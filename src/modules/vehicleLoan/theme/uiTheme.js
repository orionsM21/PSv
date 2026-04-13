export const UI_THEME = {
  CURRENT: 'current',
  GLASS: 'glass',
  NEO: 'neo',
  GLASS_NEO: 'glass_neo',
};

export const VEHICLE_THEME_OPTIONS = [
  {id: UI_THEME.CURRENT, label: 'Current'},
  {id: UI_THEME.GLASS, label: 'Glass'},
  {id: UI_THEME.NEO, label: 'Neo'},
  {id: UI_THEME.GLASS_NEO, label: 'Glass + Neo'},
];

const SHADOWS = {
  soft: {
    shadowColor: '#0E2239',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  glass: {
    shadowColor: '#0DA7D7',
    shadowOffset: {width: 0, height: 18},
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 12,
  },
  neo: {
    shadowColor: '#A7B6CA',
    shadowOffset: {width: 8, height: 8},
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 4,
  },
  mobility: {
    shadowColor: '#040B16',
    shadowOffset: {width: 0, height: 14},
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 10,
  },
  warmGlass: {
    shadowColor: '#C97872',
    shadowOffset: {width: 0, height: 18},
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 12,
  },
};

export const VEHICLE_UI_THEME = {
  current: {
    id: UI_THEME.CURRENT,
    name: 'Current',
    pageBg: '#08111F',
    pageAccent: '#C97872',
    pageGradient: ['#08111F', '#173450', '#C97872'],
    headerGradient: ['#08111F', '#1B3A5B', '#C97872'],
    surface: 'rgba(47, 62, 84, 0.95)',
    surfaceAlt: 'rgba(255, 255, 255, 0.07)',
    surfaceMuted: 'rgba(255, 255, 255, 0.04)',
    inputBg: 'rgba(255, 255, 255, 0.07)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#F8FAFC',
    textSecondary: '#D9E3EE',
    textMuted: '#AFC0D4',
    textInverse: '#FFFFFF',
    accent: '#8BD3FF',
    accentStrong: '#8BD3FF',
    success: '#60D394',
    warning: '#FDBA74',
    danger: '#FB7185',
    info: '#93C5FD',
    isDark: true,
    shadow: SHADOWS.mobility,
  },
  glass: {
    id: UI_THEME.GLASS,
    name: 'Glass',
    pageBg: '#04121C',
    pageAccent: '#15C7DA',
    pageGradient: ['#03141E', '#0B3557', '#17C2D4'],
    headerGradient: ['#05131C', '#0F3D5E', '#1ED3DF'],
    surface: 'rgba(215, 240, 255, 0.14)',
    surfaceAlt: 'rgba(170, 223, 255, 0.1)',
    surfaceMuted: 'rgba(215, 240, 255, 0.06)',
    inputBg: 'rgba(235, 247, 255, 0.1)',
    borderColor: 'rgba(188, 230, 255, 0.22)',
    textPrimary: '#F2FCFF',
    textSecondary: '#CDEFFF',
    textMuted: '#9FD3E6',
    textInverse: '#FFFFFF',
    accent: '#7FE8FF',
    accentStrong: '#34D6FF',
    success: '#4ADE80',
    warning: '#F9D66B',
    danger: '#FB7185',
    info: '#67B8FF',
    isDark: true,
    shadow: SHADOWS.glass,
  },
  neo: {
    id: UI_THEME.NEO,
    name: 'Neo',
    pageBg: '#E6ECF4',
    pageAccent: '#F5F8FC',
    pageGradient: ['#E6ECF4', '#DCE5EF', '#CBD7E6'],
    headerGradient: ['#DDE6F1', '#D2DDEA', '#BBC9DE'],
    surface: '#E6ECF4',
    surfaceAlt: '#EDF2F8',
    surfaceMuted: '#DCE4EE',
    inputBg: '#EEF3F9',
    borderColor: 'rgba(255, 255, 255, 0.45)',
    textPrimary: '#17324E',
    textSecondary: '#58708A',
    textMuted: '#71839A',
    textInverse: '#17324E',
    accent: '#1B5BA7',
    accentStrong: '#18457D',
    success: '#188C57',
    warning: '#D18A08',
    danger: '#C34242',
    info: '#2B6CB0',
    isDark: false,
    shadow: SHADOWS.neo,
  },
  glass_neo: {
    id: UI_THEME.GLASS_NEO,
    name: 'Glass + Neo',
    pageBg: '#100E14',
    pageAccent: '#C97872',
    pageGradient: ['#0D111B', '#3D2E3A', '#C97872'],
    headerGradient: ['#101520', '#493342', '#D38B79'],
    surface: 'rgba(255, 228, 220, 0.13)',
    surfaceAlt: 'rgba(255, 239, 233, 0.09)',
    surfaceMuted: 'rgba(255, 228, 220, 0.06)',
    inputBg: 'rgba(255, 239, 233, 0.1)',
    borderColor: 'rgba(255, 214, 203, 0.18)',
    textPrimary: '#FFF4EF',
    textSecondary: '#F0DCD3',
    textMuted: '#D5B8AF',
    textInverse: '#FFFFFF',
    accent: '#FFD7B7',
    accentStrong: '#FFB38B',
    success: '#6EE7B7',
    warning: '#F7C37A',
    danger: '#FDA4AF',
    info: '#A7D4FF',
    isDark: true,
    shadow: SHADOWS.warmGlass,
  },
};

export function getVehicleTheme(themeId) {
  return VEHICLE_UI_THEME[themeId] || VEHICLE_UI_THEME.current;
}

export function withOpacity(color, opacity) {
  if (!color) {
    return `rgba(15, 23, 42, ${opacity})`;
  }

  if (color.startsWith('rgba')) {
    return color.replace(/rgba\(([^)]+),\s*[\d.]+\)/, `rgba($1, ${opacity})`);
  }

  if (color.startsWith('rgb')) {
    const values = color.replace(/rgb\(|\)/g, '');
    return `rgba(${values}, ${opacity})`;
  }

  if (color.startsWith('#')) {
    const safeHex = color.replace('#', '');
    const normalized =
      safeHex.length === 3
        ? safeHex
            .split('')
            .map(char => `${char}${char}`)
            .join('')
        : safeHex;

    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return color;
}

export function getToneColor(theme, tone) {
  switch (tone) {
    case 'success':
      return theme.success;
    case 'warning':
      return theme.warning;
    case 'danger':
      return theme.danger;
    case 'accent':
      return theme.accentStrong;
    case 'info':
      return theme.info;
    default:
      return theme.textSecondary;
  }
}

export function getBadgePalette(theme, tone) {
  const color = getToneColor(theme, tone);

  return {
    backgroundColor: withOpacity(color, theme.isDark ? 0.18 : 0.12),
    borderColor: withOpacity(color, theme.isDark ? 0.28 : 0.2),
    color,
  };
}

export function getStageTone(stage) {
  const safeStage = String(stage || '').toLowerCase();

  if (safeStage.includes('disburs')) {
    return 'success';
  }

  if (
    safeStage.includes('hold') ||
    safeStage.includes('reject') ||
    safeStage.includes('deviation')
  ) {
    return 'danger';
  }

  if (
    safeStage.includes('credit') ||
    safeStage.includes('sanction') ||
    safeStage.includes('approval')
  ) {
    return 'accent';
  }

  if (
    safeStage.includes('kyc') ||
    safeStage.includes('doc') ||
    safeStage.includes('verif')
  ) {
    return 'warning';
  }

  return 'info';
}

export function formatCurrency(value) {
  const numericValue = Number(value || 0);

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numericValue);
}

export function formatCompactCurrency(value) {
  const numericValue = Number(value || 0);
  const absValue = Math.abs(numericValue);

  if (absValue >= 10000000) {
    return `Rs ${trimNumber(numericValue / 10000000)} Cr`;
  }

  if (absValue >= 100000) {
    return `Rs ${trimNumber(numericValue / 100000)} L`;
  }

  if (absValue >= 1000) {
    return `Rs ${trimNumber(numericValue / 1000)} K`;
  }

  return `Rs ${numericValue}`;
}

function trimNumber(value) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}
