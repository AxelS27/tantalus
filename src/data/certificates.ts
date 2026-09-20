import { getAssetUrl } from '../lib/assets';

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  issuerBadgeColor: string;
  issueDate: string;
  credentialUrl: string;
  image: string;
  description: string;
}

// Ordered chronologically: Newest on the left (index 0) to oldest on the right
export const certificatesData: CertificateItem[] = [
  {
    id: 'ai-career-readiness',
    title: 'AI Career Readiness Certificate',
    issuer: 'ASEAN Foundation',
    issuerBadgeColor: 'bg-[#D97706]/15 text-[#B45309] dark:text-[#FCD34D] border-[#D97706]/30',
    issueDate: 'SEP 2026',
    credentialUrl: 'https://drive.google.com/file/d/1W441eL0WyWvlMBlyDY0ElU-Djaq_gsvq/view',
    image: getAssetUrl('/images/thumbnails/certificates/ai-career-readiness.webp'),
    description:
      'Applied artificial intelligence competence, digital stewardship, and machine learning industrial readiness.',
  },
  {
    id: 'ms-azure-ai-fundamentals',
    title: 'Microsoft Azure AI Fundamentals (AI-900)',
    issuer: 'Microsoft x BINUS University',
    issuerBadgeColor: 'bg-[#0078D4]/15 text-[#0078D4] dark:text-[#60A5FA] border-[#0078D4]/30',
    issueDate: 'FEB 2026',
    credentialUrl: 'https://drive.google.com/file/d/1EBukOExRhI2w0Lir1uJlHs5avyDDEgUV/view?usp=drive_link',
    image: getAssetUrl('/images/thumbnails/certificates/microsoft-eleveate-ai-training.webp'),
    description:
      'Artificial intelligence workloads, cognitive vision & NLP services, and responsible AI principles in cloud environments.',
  },
  {
    id: 'dean-list-binus',
    title: "Dean's List Certificate of Academic Excellence",
    issuer: 'BINUS University',
    issuerBadgeColor: 'bg-[#B91C1C]/15 text-[#B91C1C] dark:text-[#F87171] border-[#B91C1C]/30',
    issueDate: 'DEC 2025',
    credentialUrl: 'https://drive.google.com/file/d/1GdgwtUW11Zn-PcgFVgBObksK-sERQpDQ/view?usp=sharing',
    image: getAssetUrl('/images/thumbnails/certificates/dean-list-2025.webp'),
    description:
      'Academic honor awarded for exceptional scholastic performance, research dedication, and highest GPA honors.',
  },
  {
    id: 'bncc-lnt-c-programming',
    title: 'BNCC LNT C Programming',
    issuer: 'Bina Nusantara Computer Club',
    issuerBadgeColor: 'bg-[#0056D2]/15 text-[#0056D2] dark:text-[#5B96F7] border-[#0056D2]/30',
    issueDate: 'AUG 2025',
    credentialUrl: 'https://drive.google.com/file/d/1dJoY8GTQCdgxZApqdUdXIyGXEuTSBmWL/view',
    image: getAssetUrl('/images/thumbnails/certificates/lnt-c-programming.webp'),
    description:
      'Low-level systems programming, manual pointer arithmetic, dynamic memory allocation, and algorithmic problem solving.',
  },
  {
    id: 'nvidia-deep-learning',
    title: 'Fundamentals of Deep Learning',
    issuer: 'NVIDIA Deep Learning Institute',
    issuerBadgeColor: 'bg-[#76B900]/15 text-[#4D7C0F] dark:text-[#84CC16] border-[#76B900]/30',
    issueDate: 'OCT 2024',
    credentialUrl: 'https://learn.nvidia.com/certificates?id=wnSF-zEPRmuMGkEWrq1h4A',
    image: getAssetUrl('/images/thumbnails/certificates/fundamental-of-deeplearning.webp'),
    description:
      'Foundational deep learning network design, computer vision feature representations, and transfer learning workflows.',
  },
];
