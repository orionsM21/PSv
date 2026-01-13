export const UI_THEME = {
    CURRENT: 'current',
    GLASS: 'glass',
    NEO: 'neo',
    GLASS_NEO: 'glass_neo',
};

/* 🔹 Common shadow presets (platform-safe) */
const SHADOW = {
    soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 6,
    },

    neoLight: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: -6, height: -6 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },

    neoDark: {
        shadowColor: '#B8C1D1',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 6,
    },
};

export const VehicleTheme = {
    /* 🟦 CURRENT — Corporate Bank UI */
    current: {
        name: 'Current',
        pageBg: '#F5F7FA',
        headerBg: '#1E3A8A',

        cardBg: '#FFFFFF',
        borderColor: '#E5E7EB',

        textPrimary: '#0F172A',
        textSecondary: '#475569',
        textMuted: '#94A3B8',

        accent: '#2563EB',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',

        blur: false,
        blurIntensity: 0,

        neo: false,
        shadow: SHADOW.soft,
    },

    /* 🧊 GLASS — Premium Fintech */
    glass: {
        name: 'Glass',
        pageBg: '#0B1220',
        headerBg: 'rgba(30,58,138,0.85)',

        cardBg: 'rgba(255,255,255,0.22)',
        borderColor: 'rgba(255,255,255,0.35)',

        textPrimary: '#FFFFFF',
        textSecondary: '#E5E7EB',
        textMuted: '#CBD5E1',

        accent: '#60A5FA',
        success: '#4ADE80',
        warning: '#FACC15',
        danger: '#F87171',

        blur: true,
        blurIntensity: 18,

        neo: false,
        shadow: SHADOW.soft,
    },

    /* 🟤 NEO — Soft Neumorphism */
    neo: {
        pageBg: '#0B1220',
        headerBg: 'rgba(30,58,138,0.85)',
        cardBg: '#E9EDF3',

        textPrimary: '#0F172A',
        textMuted: '#64748B',
        accent: '#1E3A8A',

        borderColor: 'transparent',

        neo: true,
        blur: false,

        shadow: {
            shadowColor: '#000',
            shadowOffset: { width: 6, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 8,

            // light shadow
            elevation: 0,
        },

        lightShadow: {
            shadowColor: '#FFFFFF',
            shadowOffset: { width: -6, height: -6 },
            shadowOpacity: 0.9,
            shadowRadius: 8,
        },
    },


    /* 🧊🟤 GLASS + NEO — Flagship UI */
    glass_neo: {
        name: 'Glass Neo',
        pageBg: '#0B1220',
        headerBg: 'rgba(30,58,138,0.78)',

        cardBg: 'rgba(255,255,255,0.28)',
        borderColor: 'rgba(255,255,255,0.4)',

        textPrimary: '#FFFFFF',
        textSecondary: '#E5E7EB',
        textMuted: '#CBD5E1',

        accent: '#93C5FD',
        success: '#4ADE80',
        warning: '#FACC15',
        danger: '#FB7185',

        blur: true,
        blurIntensity: 20,

        neo: true,
        shadow: {
            ...SHADOW.soft,
        },
    },
};
