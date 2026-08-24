import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadItemFromSessionStorage, saveItemToSessionStorage } from '../Utils/utils';

const DEFAULT_COLOR = '#005081';
const DEFAULT_COLORS = { sidebarColor: DEFAULT_COLOR, topbarColor: DEFAULT_COLOR, logo: null };
const LS_KEY = 'gpr-primary-color';

// Darken a hex color by a ratio (0-1)
export const darkenColor = (hex, ratio = 0.25) => {
    try {
        const h = hex.replace('#', '');
        const r = Math.max(0, parseInt(h.slice(0, 2), 16) - Math.round(255 * ratio));
        const g = Math.max(0, parseInt(h.slice(2, 4), 16) - Math.round(255 * ratio));
        const b = Math.max(0, parseInt(h.slice(4, 6), 16) - Math.round(255 * ratio));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } catch { return hex; }
};

// Average two hex colors channel by channel
export const blendColors = (hex1, hex2) => {
    try {
        const h1 = hex1.replace('#', '');
        const h2 = hex2.replace('#', '');
        const r = Math.round((parseInt(h1.slice(0, 2), 16) + parseInt(h2.slice(0, 2), 16)) / 2);
        const g = Math.round((parseInt(h1.slice(2, 4), 16) + parseInt(h2.slice(2, 4), 16)) / 2);
        const b = Math.round((parseInt(h1.slice(4, 6), 16) + parseInt(h2.slice(4, 6), 16)) / 2);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } catch { return hex1; }
};

// Returns the sidebar color to perform propagation throughout the system.
// Used by all pages that are not the sidebar/topbar themselves (auth, loading, MUI theme, KPIs…).
export const getPagePrimary = (colors) => {
    return colors.sidebarColor || DEFAULT_COLOR;
};

// Picks white or dark text depending on how light the given background color is,
// so text stays readable if an institution picks a near-white theme color.
export const getContrastText = (hex) => {
    try {
        const h = hex.replace('#', '');
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.75 ? '#0F172A' : '#FFFFFF';
    } catch { return '#FFFFFF'; }
};

const injectCssVars = (colors) => {
    const primary = getPagePrimary(colors);
    document.documentElement.style.setProperty('--gpr-primary',      primary);
    document.documentElement.style.setProperty('--gpr-primary-dark', darkenColor(primary, 0.15));
    document.documentElement.style.setProperty('--gpr-primary-light', primary + '22');
    document.documentElement.style.setProperty('--gpr-sidebar', colors.sidebarColor || DEFAULT_COLOR);
    document.documentElement.style.setProperty('--gpr-topbar',  colors.topbarColor  || DEFAULT_COLOR);
};

const ThemeColorsContext = createContext({ colors: DEFAULT_COLORS, setColors: () => {}, logo: null });

const readAppearanceFromStorage = () => {
    try {
        const raw = sessionStorage.getItem('app-appearance') || localStorage.getItem('app-appearance');
        if (raw) {
            let a = JSON.parse(raw);
            if (typeof a === 'string') {
                a = JSON.parse(a);
            }
            if (a?.sidebarColor) return { sidebarColor: a.sidebarColor, topbarColor: a.topbarColor || DEFAULT_COLOR, logo: a.logo || null };
        }
    } catch {}
    return DEFAULT_COLORS;
};

export const ThemeColorsProvider = ({ children }) => {
    const [colors, setColorsState] = useState(readAppearanceFromStorage);
    const [logo, setLogo] = useState(() => readAppearanceFromStorage().logo);

    // Inject CSS variables whenever colors change
    useEffect(() => {
        injectCssVars(colors);
    }, [colors.sidebarColor, colors.topbarColor]);

    // Listen for auth data loaded (login / token check) - update colors and logo from DB
    useEffect(() => {
        const handler = (e) => {
            const { sidebarColor, topbarColor, logo: newLogo } = e.detail || {};
            if (sidebarColor) {
                const next = { sidebarColor, topbarColor: topbarColor || sidebarColor };
                setColorsState(next);
                injectCssVars(next);
                try { localStorage.setItem(LS_KEY, sidebarColor); } catch {}
            }
            if (newLogo !== undefined) setLogo(newLogo || null);
        };
        window.addEventListener('gpr-auth-loaded', handler);
        return () => window.removeEventListener('gpr-auth-loaded', handler);
    }, []);

    const setColors = (next, newLogo) => {
        setColorsState(next);
        injectCssVars(next);
        if (newLogo !== undefined) setLogo(newLogo || null);
        try { localStorage.setItem(LS_KEY, next.sidebarColor); } catch {}
        try {
            const raw = loadItemFromSessionStorage('app-user');
            if (raw) {
                const user = raw;
                user.sidebarColor = next.sidebarColor;
                user.topbarColor = next.topbarColor;
                saveItemToSessionStorage(user, 'app-user');
            }
        } catch {}
    };

    return (
        <ThemeColorsContext.Provider value={{ colors, setColors, logo }}>
            {children}
        </ThemeColorsContext.Provider>
    );
};

export const useThemeColors = () => useContext(ThemeColorsContext);
