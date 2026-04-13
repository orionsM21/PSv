const GOLD_DRAWER_SECTIONS = [
  {
    section: 'Core Views',
    items: [
      {
        key: 'gold-dashboard',
        label: 'Dashboard',
        route: 'Dashboard',
        icon: 'grid-outline',
        description: 'Overview and daily performance',
      },
      {
        key: 'gold-new-loan',
        label: 'New Loan',
        route: 'New Loan',
        icon: 'add-circle-outline',
        description: 'Start and track fresh applications',
      },
      {
        key: 'gold-customers',
        label: 'Customers',
        route: 'Customers',
        icon: 'people-outline',
        description: 'Review profiles and loan history',
      },
    ],
  },
  {
    section: 'Account',
    items: [
      {
        key: 'gold-profile',
        label: 'Profile',
        route: 'Profile',
        icon: 'person-circle-outline',
        description: 'Personal settings and identity',
      },
    ],
  },
];

const VEHICLE_DRAWER_SECTIONS = [
  {
    section: 'Operations',
    items: [
      {
        key: 'vehicle-dashboard',
        label: 'Dashboard',
        route: 'Dashboard',
        icon: 'speedometer-outline',
        description: 'Track branch and team momentum',
      },
      {
        key: 'vehicle-new-application',
        label: 'New Application',
        route: 'New Application',
        icon: 'add-circle-outline',
        description: 'Capture a full vehicle loan case',
      },
      {
        key: 'vehicle-customers',
        label: 'Customers',
        route: 'Customers',
        icon: 'people-outline',
        description: 'Maintain borrower relationships',
      },
      {
        key: 'vehicle-applications',
        label: 'Applications',
        route: 'Applications',
        icon: 'car-sport-outline',
        description: 'Move leads through approval stages',
      },
    ],
  },
  {
    section: 'Account',
    items: [
      {
        key: 'vehicle-profile',
        label: 'Profile',
        route: 'Profile',
        icon: 'person-circle-outline',
        description: 'User preferences and identity',
      },
    ],
  },
];

const PAYMENT_DRAWER_SECTIONS = [
  {
    section: 'Payments Hub',
    items: [
      {
        key: 'payment-dashboard',
        label: 'Dashboard',
        route: 'PaymentTabs',
        params: {screen: 'Home'},
        activeRoute: 'Home',
        icon: 'home-outline',
        description: 'Monitor balances and movement',
      },
      {
        key: 'payment-customers',
        label: 'Customers',
        route: 'Customers',
        icon: 'people-outline',
        description: 'Manage users and saved beneficiaries',
      },
      {
        key: 'payment-recent-transaction',
        label: 'Recent Txn',
        route: 'RecentTransaction',
        icon: 'receipt-outline',
        description: 'Audit the latest transaction activity',
      },
      {
        key: 'payment-transfer',
        label: 'Transfer',
        route: 'FundTransfer',
        icon: 'swap-horizontal-outline',
        description: 'Move funds securely and quickly',
      },
    ],
  },
  {
    section: 'Account',
    items: [
      {
        key: 'payment-profile',
        label: 'Profile',
        route: 'PaymentTabs',
        params: {screen: 'User'},
        activeRoute: 'User',
        icon: 'person-circle-outline',
        description: 'Personal info and sign-in settings',
      },
    ],
  },
];

export const MODULE_CATALOG = [
  {
    id: 'gold',
    title: 'Gold Loan',
    subtitle: 'Gold-backed lending journeys',
    drawerSubtitle: 'Premium Lending',
    shortLabel: 'Retail Lending',
    icon: 'cash-outline',
    avatar: 'G',
    gradient: ['#0F0E0C', '#1A1815', '#0F0E0C'],
    accent: '#D4AF37',
    accentSoft: 'rgba(212, 175, 55, 0.18)',
    cardTint: 'rgba(255, 248, 220, 0.10)',
    previewStats: [
      {label: 'Portfolio', value: '2.4K'},
      {label: 'Approval', value: '92%'},
    ],
    drawerFooterTitle: 'High-trust operations',
    drawerFooterText:
      'Built to highlight secure gold valuation, customer servicing, and fast daily decisions.',
    drawerSections: GOLD_DRAWER_SECTIONS,
  },
  {
    id: 'vehicle',
    title: 'Vehicle Loan',
    subtitle: 'Auto finance operations',
    drawerSubtitle: 'Auto Finance System',
    shortLabel: 'Mobility Finance',
    icon: 'car-sport-outline',
    avatar: 'V',
    gradient: ['#08111F', '#1B3A5B', '#C97872'],
    accent: '#8BD3FF',
    accentSoft: 'rgba(139, 211, 255, 0.18)',
    cardTint: 'rgba(255, 255, 255, 0.10)',
    previewStats: [
      {label: 'Pipeline', value: '28'},
      {label: 'Sanction', value: '76L'},
    ],
    drawerFooterTitle: 'Sales-ready experience',
    drawerFooterText:
      'Shows a sharper workflow for dashboarding, full application capture, customer handling, and approval tracking.',
    drawerSections: VEHICLE_DRAWER_SECTIONS,
  },
  {
    id: 'los',
    title: 'LOS',
    subtitle: 'Loan origination workflows',
    shortLabel: 'Origination',
    icon: 'layers-outline',
    avatar: 'L',
    gradient: ['#082032', '#0B3C73', '#22A2FF'],
    accent: '#67E8F9',
    accentSoft: 'rgba(103, 232, 249, 0.18)',
    cardTint: 'rgba(255, 255, 255, 0.10)',
    previewStats: [
      {label: 'Queue', value: '64'},
      {label: 'TAT', value: '4h'},
    ],
  },
  {
    id: 'collection',
    title: 'Collection',
    subtitle: 'Recovery and repayment control',
    shortLabel: 'Recovery',
    icon: 'wallet-outline',
    avatar: 'C',
    gradient: ['#071C24', '#0F4C5C', '#1B8A8F'],
    accent: '#8FE5DA',
    accentSoft: 'rgba(143, 229, 218, 0.18)',
    cardTint: 'rgba(255, 255, 255, 0.10)',
    previewStats: [
      {label: 'Cases', value: '1.2K'},
      {label: 'PTP', value: '83%'},
    ],
  },
  {
    id: 'payment',
    title: 'Payment',
    subtitle: 'EMI and transfer operations',
    drawerSubtitle: 'Smart Digital Wallet',
    shortLabel: 'Digital Payments',
    icon: 'card-outline',
    avatar: 'P',
    gradient: ['#07111F', '#15324D', '#102033'],
    accent: '#64E6C3',
    accentSoft: 'rgba(100, 230, 195, 0.18)',
    cardTint: 'rgba(255, 255, 255, 0.08)',
    previewStats: [
      {label: 'Success', value: '98.6%'},
      {label: 'Live Txn', value: '1.3K'},
    ],
    drawerFooterTitle: 'Trust through clarity',
    drawerFooterText:
      'Balances speed, transaction visibility, and account controls in one polished navigation flow.',
    drawerSections: PAYMENT_DRAWER_SECTIONS,
  },
  {
    id: 'chat',
    title: 'Chat',
    subtitle: 'WhatsApp and communication tools',
    shortLabel: 'Customer Connect',
    icon: 'chatbubble-ellipses-outline',
    avatar: 'H',
    gradient: ['#071C24', '#0F4C5C', '#1B8A8F'],
    accent: '#A8F0C2',
    accentSoft: 'rgba(168, 240, 194, 0.18)',
    cardTint: 'rgba(255, 255, 255, 0.10)',
    previewStats: [
      {label: 'Threads', value: '148'},
      {label: 'Live', value: '32'},
    ],
  },
];

export const ROLE_OPTIONS = [
  {label: 'TruCollect', value: 'COLLECTION_AGENT'},
  {label: 'AFPL', value: 'LOAN_OFFICER'},
  {label: 'AHFPL', value: 'ADMIN'},
];

export const DEFAULT_FEATURE_FLAGS = {
  gold: {enabled: true, roles: ['ADMIN', 'LOAN_OFFICER']},
  vehicle: {enabled: true, roles: ['ADMIN', 'LOAN_OFFICER']},
  los: {enabled: true, roles: ['ADMIN', 'LOAN_OFFICER']},
  collection: {enabled: true, roles: ['ADMIN', 'COLLECTION_AGENT']},
  payment: {enabled: true, roles: ['ADMIN']},
  chat: {enabled: true, roles: ['LOAN_OFFICER']},
};

export function getAllowedModules(role, overrides = {}) {
  if (!role) {
    return [];
  }

  return MODULE_CATALOG.filter(moduleItem => {
    const feature =
      overrides[moduleItem.id] ?? DEFAULT_FEATURE_FLAGS[moduleItem.id];
    return feature?.enabled && (!feature.roles || feature.roles.includes(role));
  });
}

export function getModuleMeta(moduleId) {
  return MODULE_CATALOG.find(moduleItem => moduleItem.id === moduleId) || null;
}

export function getGenericDrawerConfig(moduleId) {
  const moduleMeta = getModuleMeta(moduleId);

  if (!moduleMeta?.drawerSections?.length) {
    return null;
  }

  return {
    title: moduleMeta.title,
    subtitle: moduleMeta.drawerSubtitle || moduleMeta.subtitle,
    eyebrow: moduleMeta.shortLabel,
    avatar: moduleMeta.avatar || moduleMeta.title?.charAt(0) || '?',
    gradient: moduleMeta.gradient,
    accent: moduleMeta.accent,
    accentSoft: moduleMeta.accentSoft,
    cardTint: moduleMeta.cardTint,
    stats: moduleMeta.previewStats,
    footerTitle: moduleMeta.drawerFooterTitle,
    footerText: moduleMeta.drawerFooterText,
    sections: moduleMeta.drawerSections,
    menus: moduleMeta.drawerSections.flatMap(section => section.items),
  };
}
