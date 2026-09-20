import { getAssetUrl } from '../lib/assets';

export interface TimelineItem {
  id: string;
  year: string;
  role: string;
  company: string;
  description: string;
  image: string;
  isUpcoming?: boolean;
}

export const timelineData: TimelineItem[] = [
  {
    id: 'apple-academy',
    year: 'MAR 2027 - DEC 2027',
    role: 'Apple Developer Academy Learner',
    company: 'Apple Developer Academy @Tangerang',
    description:
      'Accepted into the prestigious Apple Developer Academy 2027 Cohort. Intensive 10-month journey mastering iOS app architecture, Swift, SwiftUI, spatial computing, and human-centered design.',
    image: getAssetUrl('/images/thumbnails/career/apple-academy.webp'),
    isUpcoming: true,
  },
  {
    id: 'binus-jakarta',
    year: 'FEB 2026 - PRESENT',
    role: 'Intelligent Systems Mobility Student',
    company: 'BINUS University @Kemanggisan',
    description:
      'Continuing CS degree through a cross-campus mobility program in Jakarta. Specializing in Intelligent Systems with a deep focus on Natural Language Processing, Computer Vision, and Deep Learning.',
    image: getAssetUrl('/images/thumbnails/career/binus-anggrek.webp'),
  },
  {
    id: 'coding-educator',
    year: 'JUN 2025 - PRESENT',
    role: 'Online Private Coding Educator',
    company: 'Freelance @Online',
    description:
      'Providing 1-on-1 online programming mentorship as an independent educator. Mentoring students in algorithmic logic, data structures, and interactive full-stack projects.',
    image: getAssetUrl('/images/thumbnails/career/online-tutoring.webp'),
  },
  {
    id: 'kode-kiddo',
    year: 'JUN 2025 - SEP 2025',
    role: 'Computer Science Instructor',
    company: 'KODE KIDDO @Madiun',
    description:
      'Taught coding classes for young minds, facilitating foundational programming concepts, algorithmic thinking, and problem-solving through interactive software creations.',
    image: getAssetUrl('/images/thumbnails/career/madiun-office.webp'),
  },
  {
    id: 'binus-malang',
    year: 'AUG 2024 - FEB 2026',
    role: 'Undergraduate Computer Science Student',
    company: 'BINUS University @Malang',
    description:
      'Built a rigorous academic foundation in algorithms, software engineering, database management, and mathematical foundations of computing at Binus Malang.',
    image: getAssetUrl('/images/thumbnails/career/binus-malang.webp'),
  },
];
