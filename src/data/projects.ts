import { getAssetUrl } from '../lib/assets';

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  demoUrl?: string;
  demoLabel?: string;
  githubUrl?: string;
  presentationUrl?: string;
  presentationLabel?: string;
  videoUrl?: string;
  videoLabel?: string;
  posterUrl?: string;
  posterLabel?: string;
  tags: string[];
  client?: string;
  role?: string;
  year?: string;
  content?: string[];
  gallery?: string[];
}

export interface ProjectCardItem {
  id: string;
  title: string;
  image: string;
  year?: string;
  role?: string;
  tags?: string[];
  client?: string;
}

export const allProjectsData: ProjectItem[] = [
  {
    id: 'computational-biology-cca',
    title: 'Identification of Biomarkers For Bile Duct Cancer Using Feature Selection',
    description: 'A computational biology research project applying machine learning to identify genetic biomarkers for Cholangiocarcinoma (CCA). Implements patient-level leakage control inside the cross-validation loops, achieving robust external generalization.',
    thumbnail: '/projects/compbio/02d-heatmap-top50.webp',
    demoUrl: 'https://drive.google.com/file/d/1eAZzssoFIfmg5apc_seJL9U8PNPv1IQq/view?usp=sharing',
    demoLabel: 'Research Paper',
    githubUrl: 'https://github.com/AxelS27/CompBio',
    presentationUrl: 'https://canva.link/klu81ydklp20l6g',
    presentationLabel: 'Canva Presentation',
    tags: [
      'Python',
      'Computational Biology',
      'Machine Learning',
      'SVM-RFE',
      'Biomarker Discovery',
      'Cross-Validation',
      'Bioinformatics',
    ],
    client: 'Computational Biology Course Project',
    role: 'ML Coder & ML Researcher',
    year: '2026',
    content: [
      'This Computational Biology project focuses on identifying diagnostic gene biomarkers for Cholangiocarcinoma (CCA), an aggressive liver cancer, using tumor and matched non-tumor transcriptomic data. To ensure biological and statistical validity, the study implements patient-level data partitioning (StratifiedGroupKFold) to properly account for paired samples and prevent cross-validation bias.',
      'The key methodological innovation is the implementation of a leakage-controlled feature selection pipeline. Unlike standard pipelines that prefilter Differential Expression Genes (DEGs) globally before cross-validation (which leaks test set information), this pipeline encapsulates the entire prefiltering, normalization (quantile normalization), and feature selection (LASSO, SVM-RFE, or Random Forest) inside each training split. Evaluated on the GSE76297 cohort (Affymetrix HTA 2.0 array), the model maintains robust performance even after data-leakage controls are strictly applied.',
      'To confirm true generalization, the biomarker model was validated on an independent external cohort GSE26566 (Illumina HumanRef-8 v2.0 array), testing its robustness across different patients and microarray platforms. The final pipeline successfully identified high-confidence gene candidates and visualized biological insights via volcano plots, MA plots, expression heatmaps, and ROC curves.',
    ],
    gallery: [
      '/projects/compbio/02d-heatmap-top50.webp',
      '/projects/compbio/02a-volcano-plot.webp',
      '/projects/compbio/fig2-cv-auc-heatmap.webp',
      '/projects/compbio/fig3-external-validation.webp',
      '/projects/compbio/fig4-roc-svmrfe.webp',
      '/projects/compbio/fig5-overfitting-diagnostic.webp',
      '/projects/compbio/02c-top30-deg-barplot.webp',
      '/projects/compbio/02b-ma-plot.webp',
    ],
  },
  {
    id: 'railroad-cv',
    title: 'Railroad CV: Crossing Safety System',
    description: 'An intelligent computer vision safety system designed for railway level-crossings. Uses classic machine learning (HOG, HSV, LBP, and Canny) and deep learning models to predict crossing status, deployed as a Next.js monorepo.',
    thumbnail: '/projects/railroad-cv/00-preprocessing-pipeline-montage.webp',
    demoUrl: 'https://railroadcv.vercel.app',
    githubUrl: 'https://github.com/AxelS27/railroad-cv',
    presentationUrl: 'https://canva.link/v927qxjw1aqlpxx',
    presentationLabel: 'Canva Presentation',
    tags: [
      'Next.js',
      'Hono API',
      'Computer Vision',
      'Scikit-Learn',
      'YOLO',
      'Tailwind CSS',
      'Monorepo',
    ],
    client: 'Computer Vision Course Project',
    role: 'Project Leader & Lead Developer',
    year: '2026',
    content: [
      'Railroad CV is an intelligent computer vision safety monitoring system developed for railway level-crossings. The application enables automated classification of crossing safety states (SAFE or DANGER) by processing visual feeds and identifying potential hazards, such as blocked tracks or vehicle queues.',
      'The codebase is managed as a pnpm monorepo with Turborepo, isolating the Next.js frontend (utilizing Tailwind CSS and shadcn/ui) from a Hono API backend. The system enables comparative analysis between two distinct computer vision architectures: (1) a Classic ML Pipeline that extracts shape, color, texture, and edge features (via HOG, HSV Histograms, Uniform Local Binary Patterns, and Canny Edge Density) classified through linear/RBF Support Vector Machines and tuned Random Forests; and (2) a Deep Learning model that uses object detection to identify obstacles and crossing barriers.',
      'By presenting a detailed Model page, the application visualizes intermediate image preprocessing steps, making the mathematical extraction of visual features explainable to non-technical users. The final architecture is designed to turn high-dimensional visual feeds into direct, low-latency safety decisions.',
    ],
    gallery: [
      '/projects/railroad-cv/00-preprocessing-pipeline-montage.webp',
      '/projects/railroad-cv/03-test-model-comparison.webp',
      '/projects/railroad-cv/02-cv-model-comparison.webp',
      '/projects/railroad-cv/01-class-distribution.webp',
      '/projects/railroad-cv/04-confusion-matrix-selected-rbf-svm.webp',
      '/projects/railroad-cv/05-confusion-matrix-logistic-regression.webp',
    ],
  },
  {
    id: 'phylaxify',
    title: 'Phylaxify: AI Powered Donation Filter',
    description: 'A high performance web security system and OBS overlay designed to shield content creators from online gambling promotions and spam. Utilizes a Triple Layer Shield featuring keyword filtering, custom BERT NLP classification, and linguistic heuristics.',
    thumbnail: '/projects/phylaxify/screenshot.webp',
    demoUrl: 'https://phylaxify.vercel.app',
    githubUrl: 'https://github.com/AxelS27/Phylaxify',
    presentationUrl: 'https://canva.link/p0qt8w7wcr5u5db',
    presentationLabel: 'Canva Presentation',
    videoUrl: 'https://drive.google.com/file/d/190MZR-jwwPE4057kRnFTITIT2SHzoXuk/view',
    videoLabel: 'Watch Video Demo',
    tags: [
      'React 19',
      'TypeScript',
      'NLP (BERT)',
      'Supabase',
      'Vercel Functions',
      'Vanilla CSS',
      'OBS Integration',
    ],
    client: 'Software Engineering Course Project',
    role: 'Project Leader & Lead Developer',
    year: '2026',
    content: [
      'Phylaxify is a full stack, third party web application built to secure content creator platforms and livestream overlays. Driven by a Triple Layer Protection Engine, the system intercepts incoming donation webhook payloads in real time, determining whether they contain spam, predatory loans, or online gambling (\'Judol\') promotions.',
      'The core architecture is built for sub-200ms latency to preserve stream pacing. When a donation event triggers, it undergoes consensus verification across three distinct gates: (1) a deterministic Smart Filter (Regex & Keyword Matcher) for instant hits, (2) Shield BERT (a fine-tuned BERT Transformer hosted as an isolated GPU microservice on Hugging Face Spaces) to catch contextual or obfuscated leetspeak spam, and (3) Linguistic Heuristics to detect automated bot behaviors and repetitive syntax.',
      'The frontend dashboard is developed using React 19 and custom Vanilla CSS styled with glassmorphic aesthetics. Integrated with a Supabase PostgreSQL backend and its Realtime WebSockets engine, Phylaxify sends instant \'Passed\' or \'Blocked\' status verdicts directly to an OBS Live Overlay browser source, ensuring streamers can filter unwanted donation displays instantly.',
    ],
    gallery: [
      '/projects/phylaxify/screenshot.webp',
      '/projects/phylaxify/preview2.webp',
      '/projects/phylaxify/preview3.webp',
      '/projects/phylaxify/preview4.webp',
      '/projects/phylaxify/preview5.webp',
      '/projects/phylaxify/preview6.webp',
      '/projects/phylaxify/preview7.webp',
      '/projects/phylaxify/preview8.webp',
    ],
  },
  {
    id: 'nlp-gambling-detection',
    title: 'YouTube Gambling Spam Classifier',
    description: 'An NLP research project designed to identify online gambling promotions in social media comments. Implements a multi tier preprocessing pipeline (homoglyph, fragmentation, and leetspeak normalization) and evaluates multiple machine learning classifiers, achieving 98.34% accuracy.',
    thumbnail: '/projects/nlp-gambling-detection/f1-comparison-chart.webp',
    demoUrl: 'https://drive.google.com/file/d/1WdNZs0b2T-psT6RGebpunDA9M2oKkbxY/view?usp=sharing',
    demoLabel: 'Research Paper',
    githubUrl: 'https://github.com/AxelS27/NLP',
    presentationUrl: 'https://canva.link/l7trgeo2h2zm2c5',
    presentationLabel: 'Canva Presentation',
    posterUrl: 'https://canva.link/0lzmn45dvkqrznm',
    posterLabel: 'Canva Poster',
    tags: [
      'Python',
      'NLP',
      'Machine Learning',
      'Scikit-Learn',
      'Research Methodology',
      'Data Cleaning',
    ],
    client: 'Natural Language Processing & Research Methodology Course',
    role: 'Project Leader & Lead Researcher',
    year: '2026',
    content: [
      'This Natural Language Processing and Research Methodology project focuses on the detection of online gambling (known locally as \'Judol\') spam comments on Indonesian YouTube videos. Because spammers actively try to bypass automated filters using creative spelling (leetspeak, unicode homoglyphs, repeated characters, and dot/dash fragmentation), this research investigates the impact of targeted preprocessing pipelines on machine learning models.',
      'The key contribution is a custom multi stage preprocessing pipeline: (Level 1) standard punctuation removal, lowercasing, and URL stripping; (Level 2) a mapping layer to normalize common leetspeak substitutions; and (Level 3) advanced unicode homoglyph normalization, character reduction (collapsing repeated letters), and token defragmentation. This level of normalization is shown to dramatically reduce false negatives.',
      'Using a dataset of over 10,000 labeled Indonesian YouTube comments, several algorithms were systematically evaluated, including Naive Bayes, Support Vector Machines (SVM), Logistic Regression, Random Forest, Soft Voting ensembles, and Stacking classifiers. The results demonstrate that a Support Vector Machine (LinearSVC) paired with Level 3 preprocessing achieves an exceptional accuracy and weighted F1-score of 98.34%, maintaining robust generalization with a minimal train-test generalization gap.',
    ],
    gallery: [
      '/projects/nlp-gambling-detection/f1-comparison-chart.webp',
      '/projects/nlp-gambling-detection/preprocessing-ablation-chart.webp',
      '/projects/nlp-gambling-detection/overfitting-diagnostic.webp',
      '/projects/nlp-gambling-detection/confusion-matrices.webp',
    ],
  },
  {
    id: 'minesweeper-solver',
    title: 'Minesweeper Solver Agent',
    description: 'A high performance Computer Vision framework designed to automate Minesweeper using real time screen capture analysis. Features a hybrid pipeline of Template Matching and BGR Color Centroid analysis for state extraction.',
    thumbnail: '/projects/minesweeper-solver/comv1.webp',
    demoUrl: '',
    githubUrl: 'https://github.com/AxelS27/Minesweeper-Solver-Agent',
    tags: [
      'Computer Vision',
      'OpenCV',
      'Python',
      'Automation',
      'Heuristics',
    ],
    client: 'Personal Project',
    role: 'Sole Developer',
    year: '2026',
    content: [
      'The Minesweeper Solver Agent is a sophisticated multistage Computer Vision framework built to bridge the gap between image perception and logical reasoning. Developed as a Sole Developer, I designed a system capable of interpreting dynamic graphical interfaces across various grid sizes and rendering styles with nearly 100% accuracy.',
      'The core architectural innovation lies in its hybrid detection pipeline. For complex icons like flags and mines, the system utilizes Normalized Cross-Correlation (cv2.TM_CCOEFF_NORMED) to handle high resolution template matching. For numerical cells and empty states, it implements a custom Average BGR Color Analysis using Euclidean Distance (L2 Norm) for high speed classification.',
      'Beyond perception, the project features a custom Spatial Grid Decomposition algorithm that segment the board ROI into a clean data matrix. This digital twin is then processed by a deterministic logic engine that applies advanced Minesweeper rules to execute moves in real time, achieving mean inference times of under 300ms per cycle.',
    ],
    gallery: [
      '/projects/minesweeper-solver/comv1.webp',
    ],
  },
  {
    id: 'hit-or-flop',
    title: 'Hit or Flop: Music Predictor',
    description: 'A professional Machine Learning suite designed to predict track popularity by analyzing acoustic fingerprints. Features a \'Big 5\' Voting Ensemble architecture (71.7% consensus accuracy) and a Random Forest top model (78.94% accuracy).',
    thumbnail: '/projects/hit-or-flop/ml1.webp',
    demoUrl: 'https://hitorflop.vercel.app',
    githubUrl: 'https://github.com/AxelS27/HitOrFLop',
    presentationUrl: 'https://canva.link/jbiv0shbz2hcfbm',
    presentationLabel: 'Canva Presentation',
    tags: [
      'Machine Learning',
      'FastAPI',
      'React 19',
      'Ensemble Modeling',
      'Data Science',
    ],
    client: 'Machine Learning Course Project',
    role: 'AI Developer, Website Developer & Project Leader',
    year: '2026',
    content: [
      'Hit or Flop is a high performance machine learning system built to predict song success by analyzing 13 acoustic dimensions including Tempo (BPM), Spectral Centroid, and RMS Energy across a massive dataset of 125 genres. The project specifically optimizes for \'Emerging Hits\' (tracks with a popularity threshold of 15), capturing the nuance of rising indie and regional music.',
      'The core prediction engine leverages a \'Big 5\' Ensemble Architecture, combining the predictive power of RandomForest, XGBoost, AdaBoost, KNN, and DecisionTree models. By using a Voting Consensus Mechanism, the platform ensures robust predictions with a 78.94% top model accuracy (Random Forest) and a 71.7% ensemble consensus accuracy, strictly reducing false positives through cross model verification.',
      'Research for the project involved a sophisticated data pipeline: processing an initial collection of 114,000 samples, implementing null value sanitation, and executing a 1:1 Undersampling strategy to create a perfectly balanced training set of 50,768 tracks. All acoustic features are normalized using Z-score scaling to maintain signal integrity during high dimensional vector transformation.',
      'The application features a modern React 19 analytics dashboard that provides real time \'Spectral DNA\' visualizations. Users can ingest music through direct file uploads or by analyzing YouTube tracks via URL. The entire backend is powered by a FastAPI inference engine, containerized with Docker, and deployed on Hugging Face Spaces for distributed cloud processing.',
    ],
    gallery: [
      '/projects/hit-or-flop/ml1.webp',
      '/projects/hit-or-flop/ml2.webp',
      '/projects/hit-or-flop/ml3.webp',
      '/projects/hit-or-flop/ml4.webp',
      '/projects/hit-or-flop/ml5.webp',
      '/projects/hit-or-flop/ml6.webp',
      '/projects/hit-or-flop/ml7.webp',
    ],
  },
  {
    id: 'brightstar',
    title: 'Brightstar Database LMS App',
    description: 'A full stack mobile application connecting a Flutter iOS/Android frontend to a robust XAMPP MySQL backend Database Management System. Functions as a digital Learning Management System for a course center.',
    thumbnail: '/projects/brightstar/screenshot-1.webp',
    demoUrl: '',
    githubUrl: 'https://github.com/AxelS27/Brightstar',
    tags: [
      'Flutter',
      'Dart',
      'PHP',
      'MySQL',
      'DBMS',
    ],
    client: 'Database Course Project',
    role: 'Lead Developer & Architect',
    year: '2025',
    content: [
      'BrightStar is a comprehensive database driven Learning Management System (LMS) built to automate administration processes for an educational course center in Madiun, moving them away from manual record keeping.',
      'The system features a multi role architecture separating privileges between Admins, Teachers, and Students. Admins manage users and curriculum, Teachers facilitate sessions and issue progress reports, while Students track their schedule and performance.',
      'It leverages a robust Relational Database built with XAMPP MySQL, implementing normalized data structures (up to BCNF) to handle complex entity relationships including course enrollments, room allocations, and detailed session reporting.',
    ],
    gallery: [
      '/projects/brightstar/screenshot-1.webp',
      '/projects/brightstar/screenshot-2.webp',
      '/projects/brightstar/screenshot-3.webp',
      '/projects/brightstar/screenshot-4.webp',
      '/projects/brightstar/screenshot-5.webp',
      '/projects/brightstar/screenshot-6.webp',
    ],
  },
  {
    id: 'the-path-of-winter',
    title: 'The Path of Winter',
    description: 'A 2D top down RPG adventure game built natively in Java. Features custom bounding box collision detection, entity based movement, a dynamic map rendering system, and a persistent SQLite/MySQL database for user progression and login.',
    thumbnail: '/projects/path-of-winter/ingame-1.webp',
    demoUrl: '',
    githubUrl: 'https://github.com/AxelS27/ThePathOfWinter',
    tags: [
      'Java',
      'Swing',
      'Game Dev',
      'MySQL',
      'OOP',
    ],
    client: 'OOP Course Project',
    role: 'Lead Developer & Architect',
    year: '2025',
    content: [
      'The Path of Winter is a Binus University course project exploring native desktop game development using raw Java Swing. Instead of relying on a pre built engine like Unity or Godot, we built a custom 2D rendering pipeline from scratch to handle sprite sheets and map management.',
      'Game development in Java provides a perfect sandbox to implement and demonstrate core Object Oriented Programming (OOP) concepts such as Inheritance, Polymorphism, Abstraction, and Encapsulation.',
      'The game features detailed tile based movement, robust collision detection algorithms using bounding boxes, smart enemy AI that chases the player, and object interactions like opening chests and navigating between its 5 procedural levels.',
      'A standout feature is the full login and registration system that hooks directly into a MySQL database (`DBConnector.java`), ensuring player progress (like accessing higher level maps) is saved permanently across play sessions.',
    ],
    gallery: [
      '/projects/path-of-winter/login.webp',
      '/projects/path-of-winter/menu.webp',
      '/projects/path-of-winter/level-select.webp',
      '/projects/path-of-winter/level-1.webp',
      '/projects/path-of-winter/ingame-1.webp',
      '/projects/path-of-winter/level-2.webp',
      '/projects/path-of-winter/ingame-2.webp',
      '/projects/path-of-winter/level-3.webp',
    ],
  },
  {
    id: 'gaia-leaf',
    title: 'Gaia Leaf AI',
    description: 'An intelligent plant pathology system that uses deep learning to identify diseases in crops. Featuring a custom CNN model for precise diagnosis and an integrated LLM assistant to provide real-time gardening solutions.',
    thumbnail: '/projects/gaia-leaf/gl1.webp',
    tags: [
      'Artificial Intelligence',
      'Computer Vision',
      'Machine Learning',
      'Mobile App',
    ],
    client: 'Artificial Intelligence Course Project',
    role: 'AI Developer & Apps Developer',
    year: '2025',
    githubUrl: 'https://github.com/AxelS27/gaialeaf_flutter',
    content: [
      'Gaia Leaf is a comprehensive AI solution designed to assist farmers and urban gardeners in identifying plant diseases early. The core of the application is a Convolutional Neural Network (CNN) trained on the PlantVillage dataset, capable of identifying diseases with high confidence.',
      'The app features a \'Gaia Assistant\', a conversational AI that interprets diagnosis results and provides actionable steps for treatment, making expert agricultural knowledge accessible to everyone.',
      'Beyond detection, the system includes a \'Plant Disease Dictionary\' which serves as an offline first knowledge vault for major crops like Tomato, Pepper, and Potato, helping users understand common vulnerabilities and prevention strategies.',
    ],
    gallery: [
      '/projects/gaia-leaf/gl1.webp',
      '/projects/gaia-leaf/gl2.webp',
      '/projects/gaia-leaf/gl3.webp',
      '/projects/gaia-leaf/gl4.webp',
    ],
  },
  {
    id: 'hyprland-config',
    title: 'Arch x Hyprland Config',
    description: 'A minimal and aesthetic Hyprland configuration focused on performance, workflow efficiency, and visual clarity.',
    thumbnail: '/projects/hyprland-config/1.webp',
    demoUrl: '',
    githubUrl: 'https://github.com/AxelS27/hyprland_config',
    videoUrl: 'https://drive.google.com/file/d/1UMwLYPobl3krsPro_AKdKI5EJXK9DU78/view',
    videoLabel: 'Watch Video Demo',
    tags: [
      'Linux',
      'Hyprland',
      'Wayland',
      'Arch Linux',
      'Dotfiles',
    ],
    client: 'Personal Project',
    role: 'Developer',
    year: '2025',
    content: [
      'This project is a highly optimized and aesthetic Hyprland configuration designed for users who prioritize speed and visual harmony in their Linux environment.',
      'The setup features custom window management rules, smooth animations, and a seamless workflow integrated with Waybar for system monitoring and Wofi for application launching.',
      'Beyond basic configuration, it includes specifically themed setups for Kitty terminal and Neovim, creating a consistent and distraction free development space across the entire Arch Linux desktop.',
    ],
    gallery: [
      '/projects/hyprland-config/1.webp',
      '/projects/hyprland-config/2.webp',
      '/projects/hyprland-config/3.webp',
      '/projects/hyprland-config/4.webp',
      '/projects/hyprland-config/5.webp',
      '/projects/hyprland-config/6.webp',
      '/projects/hyprland-config/7.webp',
      '/projects/hyprland-config/8.webp',
      '/projects/hyprland-config/9.webp',
      '/projects/hyprland-config/10.webp',
    ],
  },
  {
    id: 'resto-menu-vba',
    title: 'Resto Menu VBA App',
    description: 'A dynamic restaurant menu system built with Excel VBA and MySQL, featuring real time stock synchronization and automated inventory management.',
    thumbnail: '/projects/resto-menu-vba/vba1.webp',
    demoUrl: '',
    githubUrl: 'https://github.com/AxelS27/RestoMenuVBA',
    tags: [
      'VBA',
      'Excel',
      'MySQL',
      'Automation',
      'Management System',
    ],
    client: 'Personal Project',
    role: 'Developer',
    year: '2025',
    content: [
      'This project introduces a dynamic restaurant menu system that is exceptionally easy to use and update. Built using Excel VBA integrated with a MySQL database, it allows restaurant owners to add or modify menu items efficiently without ever needing to touch the underlying code.',
      'The architecture features full database synchronization, where all menu data and stock levels are stored securely in MySQL. This setup facilitates seamless integration with daily sales reports and other management systems, ensuring data consistency across the entire business operation.',
      'One of the key technical highlights is the implementation of automatic fallback images. If a specific menu item image is missing, the system automatically displays a default asset, keeping the UserForm interface clean and crash free while maintaining a professional visual experience for the staff.',
    ],
    gallery: [
      '/projects/resto-menu-vba/vba1.webp',
      '/projects/resto-menu-vba/vba2.webp',
      '/projects/resto-menu-vba/vba3.webp',
      '/projects/resto-menu-vba/vba4.webp',
    ],
  },
  {
    id: 'dinoverse',
    title: 'Dinoverse AR',
    description: 'An augmented reality educational app about dinosaurs. Features a pathfinding puzzle mini-game, AR card scanning to view 3D dinosaurs and informational videos, plus an interactive quiz. Includes 3 interactive dinosaurs to learn about.',
    thumbnail: '/projects/dinoverse/main.webp',
    tags: [
      'Augmented Reality',
      'Education',
      'Puzzle Algorithm',
      'Quiz',
    ],
    githubUrl: 'https://github.com/AxelS27/DinoVerse',
    client: 'HCI Course Project',
    role: 'Lead Developer & Architect',
    year: '2024',
    content: [
      'Dinoverse leverages advanced Augmented Reality to bring prehistoric creatures to life directly on a user\'s device. By scanning specialized physical cards, users can spawn interactive 3D models of dinosaurs in their own physical space.',
      'Beyond just viewing models, the app gamifies the learning experience. It includes an algorithmic pathfinding puzzle where players navigate their dinosaur toward a crown using code blocks, teaching basic logic and problem solving skills.',
      'To reinforce learning, Dinoverse includes an integrated quiz system evaluating the user\'s knowledge on dinosaur diets and characteristics, making it a comprehensive EdTech solution.',
    ],
    gallery: [
      '/projects/dinoverse/ar-view.webp',
      '/projects/dinoverse/quiz.webp',
      '/projects/dinoverse/cards.webp',
      '/projects/dinoverse/main.webp',
    ],
  },
  {
    id: 'algo-lec-final',
    title: 'Stock Up Caffee Inventory',
    description: 'A comprehensive, highly performant terminal based inventory management and cashier system for a coffee shop, written entirely in C using raw binary file structures and BST Algorithm.',
    thumbnail: '/projects/caffee-stock/screenshot-1.webp',
    demoUrl: '',
    githubUrl: 'https://github.com/AxelS27/FinalProjectCLABSemester2',
    tags: [
      'C',
      'Terminal',
      'Memory Management',
      'Algorithms',
      'BST',
    ],
    client: 'Data Structures Course Project',
    role: 'Lead Developer & Architect',
    year: '2024',
    content: [
      'Stock Up Caffee is a comprehensive terminal based application designed to efficiently manage the inventory and cashier system of a coffee shop. It features real time stock availability tracking powered by a Binary Search Tree (BST) algorithm.',
      'The application was written entirely in C and implements robust raw file handling to keep accurate records. Preset data files like `#item_stock.txt`, `#history_transaction.txt`, and `#member_data.txt` are provided to manage persistent transaction histories and store operations.',
      'In addition to transaction processing, the app includes user authentication safeguards and customizable terminal themes, allowing users to personalize the interface according to their preferences.',
    ],
    gallery: [
      '/projects/caffee-stock/screenshot-0.webp',
      '/projects/caffee-stock/screenshot-1.webp',
      '/projects/caffee-stock/screenshot-2.webp',
      '/projects/caffee-stock/screenshot-3.webp',
      '/projects/caffee-stock/screenshot-4.webp',
      '/projects/caffee-stock/screenshot-5.webp',
      '/projects/caffee-stock/screenshot-6.webp',
      '/projects/caffee-stock/screenshot-7.webp',
      '/projects/caffee-stock/screenshot-8.webp',
    ],
  },
  {
    id: 'travel-menu',
    title: 'Travel Menu CLI System',
    description: 'A terminal based Travel Menu System written in C. Enables users to navigate destinations, manage bookings, and generate reporting with robust binary file operations.',
    thumbnail: '/projects/travel-menu/screenshot-1.webp',
    demoUrl: '',
    githubUrl: 'https://github.com/AxelS27/FinalProjectCLabSemester1',
    tags: [
      'C',
      'Terminal',
      'Memory Management',
      'File Writing',
    ],
    client: 'Algorithms and Programming Course Project',
    role: 'Lead Developer & Architect',
    year: '2024',
    content: [
      'Travel Menu is a C based command line interface application intended to act as a system for planning and managing travel paths.',
      'Using complex terminal output handling and C\'s native file read/write mechanisms, the application offers booking capabilities that persist inside `.txt` files.',
      'Through implementing algorithms natively without libraries, it reinforces core Memory Management techniques needed for raw C development.',
    ],
    gallery: [
      '/projects/travel-menu/screenshot-1.webp',
      '/projects/travel-menu/screenshot-2.webp',
      '/projects/travel-menu/screenshot-3.webp',
      '/projects/travel-menu/screenshot-4.webp',
    ],
  },
  {
    id: 'wam-bot',
    title: 'WAM Telegram Bot',
    description: 'A specialized Telegram Bot for Wahyu Agung Motor (WAM) to manage and track motorcycle inventory data in real time. Features automated data retrieval from cloud stored Excel files and multi parameter search capabilities.',
    thumbnail: '/projects/wam-bot/wam1.webp',
    demoUrl: '',
    githubUrl: 'https://github.com/AxelS27',
    tags: [
      'Python',
      'Telegram API',
      'Pandas',
      'Automation',
      'Data Management',
    ],
    client: 'Wahyu Agung Motor Madiun',
    role: 'Lead Developer & Architect',
    year: '2025',
    content: [
      'The WAM Telegram Bot was developed to modernize the inventory management system for a motorcycle dealership in Madiun. It serves as a real time gateway for the owner to access sensitive sales and unit data directly through a secure chat interface.',
      'Technically, the bot implements a decoupled data architecture, dynamically fetching and parsing Excel spreadsheets hosted on Dropbox or Google Drive using Pandas. This allows the owner to update data via their mobile spreadsheet app while the bot reflects changes instantly without requiring a redeploy.',
      'The bot features a robust command system including role based authentication, status based filtering (Ready, Process, Sold), and specialized search algorithms for license plates and vehicle models. It also parses financial data to provide instant profit analysis and tax expiry reminders for each unit.',
    ],
    gallery: [
      '/projects/wam-bot/wam1.webp',
      '/projects/wam-bot/wam2.webp',
      '/projects/wam-bot/wam3.webp',
    ],
  },
  {
    id: 'jolybee-2025',
    title: 'INC 2025: Competitive Programming',
    description: 'Represented a team in one of Indonesia\'s most prestigious competitive programming contests, competing against hundreds of university teams nationwide. Focused on advanced algorithmic problem solving and high-pressure optimization.',
    thumbnail: '/projects/jolybee-2025/ada-1.webp',
    demoUrl: 'https://drive.google.com/file/d/1QkHYS-CJYJkQbG-Ptndw8hqirz103_6O/view?usp=drive_link',
    demoLabel: 'Project Report',
    githubUrl: '',
    tags: [
      'Competitive Programming',
      'Algorithms',
      'C++',
      'Data Structures',
      'Team Leadership',
    ],
    client: 'Algorithm Design and Analysis Course',
    role: 'Team Leader (Team Athelstan)',
    year: '2025',
    content: [
      'INC (Indonesia National Contest) 2025 is a prestigious national scale competitive programming arena that serves as a gateway to the ICPC regional finals. Competing as the leader of Team \'Athelstan\', I led our squad through the rigorous process of solving complex algorithmic problems as part of our Algorithm Design and Analysis course.',
      'The competition required quick thinking and proficiency in complex data structures and efficient algorithm design. Although the final result was a work in progress, the experience was invaluable for developing mental fortitude and collaborative debugging strategies in a high stakes environment.',
      'Beyond technical skills, this experience reinforced my ability to manage a team\'s workflow under strict time limits: delegating tasks based on problem difficulty and ensuring consistent logical verification across our solutions.',
    ],
    gallery: [
      '/projects/jolybee-2025/ada-1.webp',
    ],
  },
];

export const allProjects: ProjectCardItem[] = allProjectsData.map((project) => ({
  id: project.id,
  title: project.title,
  image: getAssetUrl(project.thumbnail),
  year: project.year,
  role: project.role,
  tags: project.tags,
  client: project.client,
}));

export const projectPages = Array.from(
  { length: Math.ceil(allProjects.length / 6) },
  (_, pageIndex) => allProjects.slice(pageIndex * 6, pageIndex * 6 + 6),
);

export const cubeFaces = projectPages.map((items, faceIdx) => ({
  faceIdx,
  pageIdx: faceIdx,
  items,
}));

export function getProjectById(id: string | undefined): ProjectItem | undefined {
  if (!id) return undefined;
  const cleanId = id.toLowerCase().trim();
  return (
    allProjectsData.find((p) => p.id.toLowerCase() === cleanId) ||
    allProjectsData.find((p) => p.id.toLowerCase().includes(cleanId) || cleanId.includes(p.id.toLowerCase()))
  );
}

export function getAllProjects(): ProjectItem[] {
  return allProjectsData;
}
