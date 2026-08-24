import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button, Tooltip } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PaletteIcon from '@mui/icons-material/Palette';
import ImageIcon from '@mui/icons-material/Image';
import axios from 'axios';
import { notify } from '../../Utils/alert';
import { KTApp } from '../../Utils/blockui';
import { HOST } from '../../Utils/globals';
import { loadItemFromLocalStorage, loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from '../../Utils/utils';
import { useThemeColors, getPagePrimary, darkenColor } from '../../context/ThemeColorsContext';

const SAVE_API = HOST + 'api/v1/config/setting/others/appearance/create';
const INST_API = HOST + 'api/v1/config/setting/others/institution/create';
const DEFAULT_COLOR = '#005081';

const label = { display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' };
const card  = { background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' };

const SectionTitle = ({ icon: Icon, title }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Icon sx={{ fontSize: 16, color: 'var(--gpr-primary, #005081)' }} />
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: 'var(--gpr-primary, #005081)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{title}</Typography>
    </Box>
);

const Apparence = () => {
    const { setColors } = useThemeColors();

    // Valeurs sauvegardées (référence pour Réinitialiser)
    const savedRef = useRef({ sidebarColor: DEFAULT_COLOR, topbarColor: DEFAULT_COLOR, logo: null });

    // État en cours d'édition
    const [sidebarColor, setSidebarColor] = useState(DEFAULT_COLOR);
    const [topbarColor,  setTopbarColor]  = useState(DEFAULT_COLOR);
    const [logo,         setLogo]         = useState(null);
    const [saving,       setSaving]       = useState(false);
    const [isDragging,   setIsDragging]   = useState(false);
    const fileInputRef = useRef(null);

    const institutionName = (() => {
        try {
            const raw = loadItemFromSessionStorage('app-institution') || loadItemFromLocalStorage('app-institution');
            if (raw) return raw?.denomination || '';
        } catch {}
        return '';
    })();

    // Charger les valeurs depuis app-appearance (couleurs + logo) avec fallback institution
    useEffect(() => {
        KTApp.blockPage({ overlayColor: '#000000', type: 'v2', state: 'danger', message: 'Chargement...' });
        try {
            const rawApp  = loadItemFromSessionStorage('app-appearance')  || loadItemFromLocalStorage('app-appearance');
            const rawInst = loadItemFromSessionStorage('app-institution') || loadItemFromLocalStorage('app-institution');

            let sc = DEFAULT_COLOR, tc = DEFAULT_COLOR, lg = null;
            if (rawApp) {
                let a = rawApp;
                if (typeof a === 'string') {
                    a = JSON.parse(a);
                }
                sc = a.sidebarColor || DEFAULT_COLOR;
                tc = a.topbarColor  || DEFAULT_COLOR;
                lg = a.logo         || null;
            }

            // Fallback logo : institution si app-appearance n'en a pas
            let inst = rawInst;
            if (typeof inst === 'string') {
                inst = JSON.parse(inst);
            }
            if (!lg && inst) {
                lg = inst.logo || null;
            }

            setSidebarColor(sc);
            setTopbarColor(tc);
            setLogo(lg);
            savedRef.current = { sidebarColor: sc, topbarColor: tc, logo: lg };
        } catch {} finally {
            KTApp.unblockPage();
        }
    }, []);

    const primary     = getPagePrimary({ sidebarColor, topbarColor });
    const primaryDark = darkenColor(primary, 0.15);

    // Upload logo
    const readLogo = (file) => {
        if (!file) return;
        const ext = file.name.split('.').pop().toLowerCase();
        if (!['jpg', 'jpeg', 'png'].includes(ext)) {
            notify('Format non accepté. Utilisez JPG, JPEG ou PNG uniquement.', 'error');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            notify('Image trop volumineuse (max 2MB)', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => setLogo(e.target.result);
        reader.readAsDataURL(file);
    };

    const handleFileInput   = (e) => { readLogo(e.target.files[0]); e.target.value = ''; };
    const handleDrop        = (e) => { e.preventDefault(); setIsDragging(false); readLogo(e.dataTransfer.files[0]); };
    const handleZoneClick   = () => fileInputRef.current?.click();
    const handleDragOver    = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave   = () => setIsDragging(false);

    const handleReset = () => {
        setSidebarColor(DEFAULT_COLOR);
        setTopbarColor(DEFAULT_COLOR);
        setLogo(null);
        setColors({ sidebarColor: DEFAULT_COLOR, topbarColor: DEFAULT_COLOR }, null);
    };

    const handleSave = async () => {
        setSaving(true);
        KTApp.blockPage({ overlayColor: '#000000', type: 'v2', state: 'danger', message: 'Sauvegarde en cours...' });
        try {
            const token = loadItemFromLocalStorage('token');

            // 1. Sauvegarder couleurs + logo dans app-appearance (source de vérité pour le refresh)
            const appearancePayload = { sidebarColor, topbarColor, logo };
            await axios.post(SAVE_API, appearancePayload, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            saveItemToSessionStorage(appearancePayload, 'app-appearance');
            saveItemToLocalStorage(appearancePayload,   'app-appearance');
            savedRef.current = { sidebarColor, topbarColor, logo };

            // 2. Appliquer immédiatement dans tout le système
            window.dispatchEvent(new CustomEvent('gpr-auth-loaded', {
                detail: { sidebarColor, topbarColor, logo: logo || null }
            }));
            setColors({ sidebarColor, topbarColor }, logo || null);

            // 3. Propager le logo vers institution (indépendant - n'empêche pas l'application des couleurs)
            try {
                const rawInst = loadItemFromSessionStorage('app-institution') || loadItemFromLocalStorage('app-institution');
                if (rawInst && logo) {
                    const inst        = rawInst;
                    const instPayload = { ...inst, logo };
                    const instRes     = await axios.post(INST_API, instPayload, {
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                    });
                    const savedInst = instRes.data?.content ? instRes.data.content : instPayload;
                    saveItemToSessionStorage(savedInst, 'app-institution');
                    saveItemToLocalStorage(savedInst,   'app-institution');
                }
            } catch {}

            notify('Apparence sauvegardée', 'success');
        } catch {
            notify('Erreur lors de la sauvegarde', 'error');
        } finally {
            setSaving(false);
            KTApp.unblockPage();
        }
    };

    return (
        <div className="card-panel pb-5" style={{ paddingBottom: 48 }}>
            {/* En-tête */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ width: 38, height: 38, borderRadius: 2, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PaletteIcon sx={{ color: 'var(--gpr-primary, #005081)', fontSize: 20 }} />
                </Box>
                <Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Apparence</Typography>
                    <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>Personnalisez l'identité visuelle de l'application</Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>

                {/* ── Colonne gauche : configuration ── */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                    {/* Couleurs */}
                    <Box sx={card}>
                        <SectionTitle icon={PaletteIcon} title="Couleurs" />

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <Box>
                                <span style={label}>Couleur Sidebar</span>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <input
                                        type="color"
                                        value={sidebarColor}
                                        onChange={e => setSidebarColor(e.target.value)}
                                        style={{ width: 40, height: 40, border: 'none', cursor: 'pointer', borderRadius: 8, padding: 0 }}
                                    />
                                    <input
                                        type="text"
                                        value={sidebarColor}
                                        onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) setSidebarColor(e.target.value); }}
                                        style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'monospace', outline: 'none' }}
                                    />
                                </Box>
                            </Box>
                            <Box>
                                <span style={label}>Couleur Topbar</span>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <input
                                        type="color"
                                        value={topbarColor}
                                        onChange={e => setTopbarColor(e.target.value)}
                                        style={{ width: 40, height: 40, border: 'none', cursor: 'pointer', borderRadius: 8, padding: 0 }}
                                    />
                                    <input
                                        type="text"
                                        value={topbarColor}
                                        onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) setTopbarColor(e.target.value); }}
                                        style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'monospace', outline: 'none' }}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{ mt: 2, p: 1.5, background: '#f8fafc', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 20, height: 20, borderRadius: '50%', background: primary, border: '2px solid #e2e8f0' }} />
                            <Typography sx={{ fontSize: 12, color: '#64748b' }}>
                                Couleur principale des boutons : <strong style={{ fontFamily: 'monospace' }}>{primary}</strong>
                            </Typography>
                        </Box>
                    </Box>

                    {/* Logo */}
                    <Box sx={card}>
                        <SectionTitle icon={ImageIcon} title="Logo" />

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            style={{ display: 'none' }}
                            onChange={handleFileInput}
                        />
                        <Box
                            onClick={handleZoneClick}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `2px dashed ${isDragging ? primary : '#cbd5e1'}`,
                                borderRadius: 3,
                                p: 3,
                                textAlign: 'center',
                                background: isDragging ? primary + '11' : '#f8fafc',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                minHeight: 120,
                                '&:hover': { borderColor: primary, background: primary + '11' }
                            }}
                        >
                            {logo ? (
                                <img src={logo} alt="logo" style={{ maxHeight: 100, maxWidth: '100%', objectFit: 'contain', display: 'block' }} />
                            ) : (
                                <>
                                    <ImageIcon sx={{ fontSize: 32, color: '#cbd5e1', mb: 1 }} />
                                    <Typography sx={{ fontSize: 13, color: '#94a3b8' }}>
                                        Glissez une image ou cliquez pour choisir
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, color: '#cbd5e1', mt: 0.5 }}>Formats acceptés : JPG, JPEG, PNG - max 2MB</Typography>
                                </>
                            )}
                        </Box>

                        {logo && (
                            <Box sx={{ mt: 1.5, textAlign: 'right' }}>
                                <Button size="small" color="error" onClick={() => setLogo(null)} sx={{ fontSize: 11 }}>
                                    Supprimer le logo
                                </Button>
                            </Box>
                        )}
                    </Box>

                </Box>

                {/* ── Colonne droite : aperçu ── */}
                <Box sx={card}>
                    <SectionTitle icon={PaletteIcon} title="Aperçu en direct" />

                    {/* Mini application mockup */}
                    <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden', background: '#f1f5f9' }}>

                        {/* Mini topbar */}
                        <Box sx={{ background: topbarColor, height: 44, display: 'flex', alignItems: 'center', px: 2, gap: 1.5, justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {logo && (
                                    <img src={logo} alt="logo" style={{ height: 28, maxWidth: 36, objectFit: 'contain', display: 'block' }} />
                                )}
                                <Box>
                                    <Typography sx={{ fontSize: 11, color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>GPR</Typography>
                                    {institutionName && (
                                        <Typography sx={{ fontSize: 8, color: 'rgba(255,255,255,0.75)', lineHeight: 1.2 }}>{institutionName}</Typography>
                                    )}
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.8 }}>
                                {[1,2,3].map(i => <Box key={i} sx={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />)}
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', minHeight: 220 }}>
                            {/* Mini sidebar */}
                            <Box sx={{ width: 120, background: sidebarColor, p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                                {['Tableau de bord', 'Réclamations', 'Suggestions', 'Rapports', 'Configurations'].map((item) => (
                                    <Box key={item} sx={{ px: 1, py: 0.6, borderRadius: 1.5, background: 'rgba(255,255,255,0.12)' }}>
                                        <Typography sx={{ fontSize: 9, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{item}</Typography>
                                    </Box>
                                ))}
                            </Box>

                            {/* Mini contenu */}
                            <Box sx={{ flex: 1, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {/* KPI cards - fidèles au vrai StatCard */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                    {[{ label: 'Réclamations', val: '12' }, { label: 'Traités', val: '8' }].map((kpi) => (
                                        <Box key={kpi.label} sx={{
                                            background: '#fff', borderRadius: 2, p: 1,
                                            border: '1px solid #f1f5f9',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                            display: 'flex', flexDirection: 'column', gap: 0.5
                                        }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Typography sx={{ fontSize: 7, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{kpi.label}</Typography>
                                                <Box sx={{ width: 14, height: 14, borderRadius: 1, background: primary + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: primary }} />
                                                </Box>
                                            </Box>
                                            <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{kpi.val}</Typography>
                                        </Box>
                                    ))}
                                </Box>

                                {/* Exemple bouton primary */}
                                <Box sx={{
                                    background: primary,
                                    borderRadius: 1.5, py: 0.7, px: 1.2, display: 'inline-block', alignSelf: 'flex-start',
                                    boxShadow: `0 2px 6px ${primary}55`
                                }}>
                                    <Typography sx={{ fontSize: 9, color: '#fff', fontWeight: 600 }}>+ Enregistrer</Typography>
                                </Box>

                                {/* Exemple en-tête modal */}
                                <Box sx={{ background: '#fff', borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                    <Box sx={{ background: primary, px: 1.5, py: 0.8 }}>
                                        <Typography sx={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>Détail réclamation</Typography>
                                    </Box>
                                    <Box sx={{ px: 1.5, py: 1 }}>
                                        <Box sx={{ height: 5, background: '#f1f5f9', borderRadius: 2, mb: 0.8 }} />
                                        <Box sx={{ height: 5, background: '#f1f5f9', borderRadius: 2, width: '70%' }} />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    <Typography sx={{ fontSize: 11, color: '#94a3b8', mt: 1.5, textAlign: 'center' }}>
                        L'aperçu se met à jour en temps réel • Les changements sont appliqués après sauvegarde
                    </Typography>

                    {/* Boutons */}
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<RestartAltIcon />}
                            onClick={handleReset}
                            sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontSize: 13 }}
                        >
                            Réinitialiser
                        </Button>
                        <LoadingButton
                            variant="contained"
                            startIcon={<SaveIcon />}
                            loading={saving}
                            onClick={handleSave}
                            sx={{ flex: 2, borderRadius: 2, textTransform: 'none', fontSize: 13 }}
                        >
                            Sauvegarder
                        </LoadingButton>
                    </Box>
                </Box>
            </Box>
        </div>
    );
};

export default Apparence;
