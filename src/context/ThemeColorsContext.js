import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadItemFromSessionStorage, saveItemToSessionStorage } from '../Utils/utils';

const DEFAULT_COLOR = '#005081';
const DEFAULT_COLORS = { sidebarColor: DEFAULT_COLOR, topbarColor: DEFAULT_COLOR };
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

// Returns the blended color when sidebar ≠ topbar, otherwise returns the single color.
// Used by all pages that are not the sidebar/topbar themselves (auth, loading, MUI theme, KPIs…).
export const getPagePrimary = (colors) => {
    const sc = (colors.sidebarColor || DEFAULT_COLOR).toLowerCase();
    const tc = (colors.topbarColor  || DEFAULT_COLOR).toLowerCase();
    return sc === tc ? colors.sidebarColor || DEFAULT_COLOR : blendColors(colors.sidebarColor, colors.topbarColor);
};

const injectCssVars = (colors) => {
    const primary = getPagePrimary(colors);
    document.documentElement.style.setProperty('--gpr-primary', primary);
    document.documentElement.style.setProperty('--gpr-primary-dark', darkenColor(primary, 0.15));
    document.documentElement.style.setProperty('--gpr-primary-light', primary + '22');
};

const ThemeColorsContext = createContext({ colors: DEFAULT_COLORS, setColors: () => {} });

export const ThemeColorsProvider = ({ children }) => {
    const [colors, setColorsState] = useState(() => {
        // Si module appearance actif → charger les couleurs institution
        try {
            const modules = JSON.parse(sessionStorage.getItem('app-modules') || '[]');
            if (Array.isArray(modules) && modules.includes('appearance')) {
                const raw = sessionStorage.getItem('app-appearance');
                if (raw) {
                    const appearance = JSON.parse(raw);
                    if (appearance?.sidebarColor) {
                        return { sidebarColor: appearance.sidebarColor, topbarColor: appearance.topbarColor || DEFAULT_COLOR };
                    }
                }
                // Module actif mais pas encore configuré → fallback localStorage
                const saved = localStorage.getItem('app-appearance');
                if (saved) {
                    const appearance = JSON.parse(saved);
                    if (appearance?.sidebarColor) {
                        return { sidebarColor: appearance.sidebarColor, topbarColor: appearance.topbarColor || DEFAULT_COLOR };
                    }
                }
            }
        } catch {}
        // Pas de module appearance → couleur GPR par défaut
        return DEFAULT_COLORS;
    });

    // Inject CSS variables whenever colors change
    useEffect(() => {
        injectCssVars(colors);
    }, [colors.sidebarColor, colors.topbarColor]);

    // Listen for auth data loaded (login / token check) — update colors from DB
    useEffect(() => {
        const handler = (e) => {
            const { sidebarColor, topbarColor } = e.detail || {};
            if (sidebarColor) {
                const next = { sidebarColor, topbarColor: topbarColor || sidebarColor };
                setColorsState(next);
                injectCssVars(next);
                try { localStorage.setItem(LS_KEY, sidebarColor); } catch {}
            }
        };
        window.addEventListener('gpr-auth-loaded', handler);
        return () => window.removeEventListener('gpr-auth-loaded', handler);
    }, []);

    const setColors = (next) => {
        setColorsState(next);
        injectCssVars(next);
        // Persist in localStorage so login/lockscreen/loading pages pick it up next time
        try { localStorage.setItem(LS_KEY, next.sidebarColor); } catch {}
        // Update session storage (maintain double-encoding to match CheckToken.js pattern)
        try {
            const raw = loadItemFromSessionStorage('app-user');
            if (raw) {
                const user = JSON.parse(raw);
                user.sidebarColor = next.sidebarColor;
                user.topbarColor = next.topbarColor;
                saveItemToSessionStorage(JSON.stringify(user), 'app-user');
            }
        } catch {}
    };

    return (
        <ThemeColorsContext.Provider value={{ colors, setColors }}>
            {children}
        </ThemeColorsContext.Provider>
    );
};

export const useThemeColors = () => useContext(ThemeColorsContext);
