import { useCallback, useEffect, useRef, useState } from 'react';
import type { PortfolioSettings } from '../lib/settings';
import { MUSIC_TRACKS, MusicQueue, type MusicTrackId } from '../lib/music';
import { getAssetUrl } from '../lib/assets';

export type MusicStatus = 'off' | 'loading' | 'playing' | 'blocked' | 'error';

const sourceFor = (id: MusicTrackId) => getAssetUrl(`/music/${id}.m4a`);

export function useBackgroundMusic(settings: PortfolioSettings, openingTrack?: MusicTrackId) {
  const [trackId, setTrackId] = useState<MusicTrackId | null>(null);
  const [status, setStatus] = useState<MusicStatus>('off');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadRef = useRef<{ id: MusicTrackId; audio: HTMLAudioElement } | null>(null);
  const currentRef = useRef<MusicTrackId | null>(null);
  const queueRef = useRef<MusicQueue | null>(null);
  // Keep the initial opening fixed as the intro advances through its stages.
  const openingTrackRef = useRef(openingTrack);
  const settingsRef = useRef(settings);
  const advanceRef = useRef<() => void>(() => {});
  const failuresRef = useRef(0);
  const configurationRef = useRef({ order: settings.musicOrder, mode: settings.playbackMode });
  settingsRef.current = settings;
  if (!queueRef.current) queueRef.current = new MusicQueue(settings.musicOrder, settings.playbackMode, openingTrackRef.current);

  const preloadNext = useCallback(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (preloadRef.current || connection?.saveData) return;
    const id = queueRef.current!.next();
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = sourceFor(id);
    preloadRef.current = { id, audio };
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !settingsRef.current.isAudioEnabled || !currentRef.current) return;
    setStatus('loading');
    try {
      await audio.play();
      if (audio === audioRef.current && !audio.paused) {
        failuresRef.current = 0;
        setStatus('playing');
        preloadNext();
      }
    } catch (error) {
      if (audio !== audioRef.current || !settingsRef.current.isAudioEnabled) return;
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setStatus(error instanceof DOMException && error.name === 'NotAllowedError' ? 'blocked' : 'error');
    }
  }, [preloadNext]);

  const advance = useCallback(() => {
    if (!settingsRef.current.isAudioEnabled) return;
    const audio = audioRef.current;
    if (!audio) return;
    const next = preloadRef.current;
    preloadRef.current = null;
    const id = next?.id ?? queueRef.current!.next();
    audio.pause();
    audio.src = sourceFor(id);
    currentRef.current = id;
    setTrackId(id);
    void play();
  }, [play]);
  advanceRef.current = advance;

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audioRef.current = audio;
    const onEnded = () => advanceRef.current();
    const onError = () => {
      if (!settingsRef.current.isAudioEnabled || !currentRef.current) return;
      failuresRef.current += 1;
      if (failuresRef.current >= MUSIC_TRACKS.length) {
        setStatus('error');
      } else {
        advanceRef.current();
      }
    };
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.removeAttribute('src');
      audioRef.current = null;
      preloadRef.current?.audio.removeAttribute('src');
      preloadRef.current = null;
      currentRef.current = null;
      queueRef.current = new MusicQueue(settingsRef.current.musicOrder, settingsRef.current.playbackMode, openingTrackRef.current);
      failuresRef.current = 0;
    };
  }, []);

  useEffect(() => {
    const previous = configurationRef.current;
    if (previous.mode === settings.playbackMode && previous.order === settings.musicOrder) return;
    queueRef.current!.configure(settings.musicOrder, settings.playbackMode, currentRef.current, preloadRef.current?.id ?? null);
    configurationRef.current = { order: settings.musicOrder, mode: settings.playbackMode };
    preloadRef.current?.audio.removeAttribute('src');
    preloadRef.current = null;
    if (currentRef.current && audioRef.current && !audioRef.current.paused) preloadNext();
  }, [settings.musicOrder, settings.playbackMode, preloadNext]);

  useEffect(() => {
    const volume = Math.max(0, Math.min(100, settings.volume)) / 100;
    if (audioRef.current) audioRef.current.volume = volume;
  }, [settings.volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!settings.isAudioEnabled) {
      audio.pause();
      preloadRef.current?.audio.removeAttribute('src');
      preloadRef.current = null;
      setStatus('off');
      return;
    }
    if (!currentRef.current) {
      const id = queueRef.current!.next();
      currentRef.current = id;
      setTrackId(id);
      audio.src = sourceFor(id);
    }
    void play();
  }, [settings.isAudioEnabled, play, preloadNext]);

  // Saved preferences cannot bypass browser autoplay rules. Resume on the next
  // gesture after a reload, without making the visitor open Settings again.
  useEffect(() => {
    const resume = () => {
      if (settingsRef.current.isAudioEnabled && audioRef.current?.paused && status === 'blocked') {
        void play();
      }
    };
    window.addEventListener('pointerdown', resume);
    window.addEventListener('keydown', resume);
    return () => {
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
    };
  }, [play, status]);

  return { trackId, status, skipTrack: advance, retryPlayback: play };
}
