import { getAssetUrl } from '../lib/assets';

export interface ProjectCardItem {
  id: string;
  title: string;
  image: string;
}

// Batch 1 (Page 01 - 12 Items)
export const page1Projects: ProjectCardItem[] = [
  {
    id: 'comp-bio',
    title: 'Biomarker Discovery for Cancer',
    image: 'https://media.liemaxels.com/images/career-trace/binus-anggrek.webp',
  },
  {
    id: 'railroad-cv',
    title: 'Railroad Safety System',
    image: 'https://media.liemaxels.com/images/career-trace/madiun-office.webp',
  },
  {
    id: 'tantalus-spatial',
    title: 'Tantalus 2D Spatial Canvas',
    image: getAssetUrl('/images/tantalize/projects.webp'),
  },
  {
    id: 'apple-spatial',
    title: 'Spatial Audio & Vision',
    image: 'https://media.liemaxels.com/images/career-trace/apple-academy.webp',
  },
  {
    id: 'liem-monorepo',
    title: 'Liem Distributed Monorepo',
    image: 'https://media.liemaxels.com/images/career-trace/online-tutoring.webp',
  },
  {
    id: 'neural-nlp',
    title: 'Lexical Intent Classifier',
    image: 'https://media.liemaxels.com/images/career-trace/binus-malang.webp',
  },
  {
    id: 'webgl-renderer',
    title: 'Raymarched 3D Shaders',
    image: getAssetUrl('/images/tantalize/connect.webp'),
  },
  {
    id: 'autonomous-nav',
    title: 'Stereo Depth Odometry',
    image: getAssetUrl('/images/tantalize/archives.webp'),
  },
  {
    id: 'ai-code-reviewer',
    title: 'Static Analyzer AI Agent',
    image: getAssetUrl('/images/tantalize/certificates.webp'),
  },
  {
    id: 'distributed-queue',
    title: 'Zero-Allocation Stream',
    image: getAssetUrl('/images/tantalize/timeline.webp'),
  },
  {
    id: 'biometric-auth',
    title: 'Facial Anti-Spoofing',
    image: getAssetUrl('/images/tantalize/home.webp'),
  },
  {
    id: 'cloud-orchestration',
    title: 'Self-Healing Mesh',
    image: getAssetUrl('/images/tantalize/projects.webp'),
  },
];

// Batch 2 (Page 02 - 12 Items)
export const page2Projects: ProjectCardItem[] = [
  {
    id: 'quantum-sim',
    title: 'Qubit State Simulator',
    image: 'https://media.liemaxels.com/images/career-trace/binus-malang.webp',
  },
  {
    id: 'swift-neural',
    title: 'CoreML Neural Style',
    image: 'https://media.liemaxels.com/images/career-trace/apple-academy.webp',
  },
  {
    id: 'audio-dsp',
    title: 'Real-time Synthesizer',
    image: getAssetUrl('/images/tantalize/home.webp'),
  },
  {
    id: 'edge-inference',
    title: 'FPGA DL Accelerator',
    image: getAssetUrl('/images/tantalize/timeline.webp'),
  },
  {
    id: 'graph-rag',
    title: 'Knowledge Graph RAG',
    image: 'https://media.liemaxels.com/images/career-trace/binus-anggrek.webp',
  },
  {
    id: 'astronomy-cv',
    title: 'Exoplanet Curve AI',
    image: getAssetUrl('/images/tantalize/connect.webp'),
  },
  {
    id: 'p2p-sync',
    title: 'CRDT Decentralized Sync',
    image: getAssetUrl('/images/tantalize/archives.webp'),
  },
  {
    id: 'micro-compiler',
    title: 'LLVM Bytecode JIT',
    image: getAssetUrl('/images/tantalize/certificates.webp'),
  },
  {
    id: 'vision-pose',
    title: '3D Kinematic Tracker',
    image: 'https://media.liemaxels.com/images/career-trace/madiun-office.webp',
  },
  {
    id: 'semantic-search',
    title: 'HNSW Vector Index',
    image: 'https://media.liemaxels.com/images/career-trace/online-tutoring.webp',
  },
  {
    id: 'gpu-particles',
    title: 'Million-Body Physics',
    image: getAssetUrl('/images/tantalize/projects.webp'),
  },
  {
    id: 'kernel-driver',
    title: 'Zero-Copy Packet Filter',
    image: getAssetUrl('/images/tantalize/home.webp'),
  },
];

export const projectPages = [page1Projects, page2Projects];

export const cubeFaces = [
  { faceIdx: 0, pageIdx: 0, items: page1Projects },
  { faceIdx: 1, pageIdx: 1, items: page2Projects },
  { faceIdx: 2, pageIdx: 0, items: page1Projects },
  { faceIdx: 3, pageIdx: 1, items: page2Projects },
];
