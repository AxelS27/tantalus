import React, { useState, useRef, useEffect } from 'react';
import { ImageOff } from 'lucide-react';
import Skeleton from './Skeleton';
import { getThumbnailSrcSet, getThumbnailUrl } from '../../lib/thumbnails';

export interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
  skeletonClassName?: string;
  skeletonVariant?: 'rectangular' | 'circular' | 'rounded' | 'text';
  fallbackIcon?: React.ReactNode;
  fallbackText?: string;
}

export default function ImageWithSkeleton({
  src,
  alt = '',
  className = '',
  wrapperClassName = '',
  skeletonClassName = '',
  skeletonVariant = 'rectangular',
  fallbackIcon,
  fallbackText,
  loading = 'lazy',
  decoding = 'async',
  referrerPolicy = 'no-referrer',
  srcSet,
  sizes,
  onLoad,
  onError,
  style,
  ...props
}: ImageWithSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const resolvedSrc = getThumbnailUrl(src);
  const resolvedSrcSet = srcSet || getThumbnailSrcSet(src);

  // Check if image is already cached/complete on mount or when src changes
  useEffect(() => {
    setIsLoaded(false);
    setIsError(false);

    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [resolvedSrc]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsError(true);
    setIsLoaded(true);
    if (onError) onError(e);
  };

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {/* Skeleton placeholder shown while loading */}
      {!isLoaded && !isError && (
        <Skeleton
          variant={skeletonVariant}
          className={`absolute inset-0 w-full h-full z-0 ${skeletonClassName}`}
        />
      )}

      {/* Error Fallback */}
      {isError ? (
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-black/10 dark:bg-white/5 text-stone-500 p-4 select-none z-10">
          {fallbackIcon || <ImageOff size={24} className="opacity-40 mb-2" />}
          {fallbackText && (
            <span className="text-[10px] font-mono tracking-widest uppercase opacity-50 text-center">
              {fallbackText}
            </span>
          )}
        </div>
      ) : (
        /* Actual Image with smooth fade-in */
        <img
          ref={imgRef}
          src={resolvedSrc}
          srcSet={resolvedSrcSet}
          sizes={sizes || '(max-width: 640px) 140px, 200px'}
          alt={alt}
          loading={loading}
          decoding={decoding}
          referrerPolicy={referrerPolicy}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-500 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          style={style}
          {...props}
        />
      )}
    </div>
  );
}
