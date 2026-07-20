import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button, Tooltip } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PaletteIcon from '@mui/icons-material/Palette';
import ImageIcon from '@mui/icons-material/Image';
import axios from 'axios';
import { notify } from '../../Utils/alert';
import { HOST } from '../../Utils/globals';
import { loadItemFromLocalStorage, loadItemFromSessionStorage, saveItemToLocalStorage, saveItemToSessionStorage } from '../../Utils/utils';
import { useThemeColors, getPagePrimary, darkenColor } from '../../context/ThemeColorsContext';

const SAVE_API = HOST + 'api/v1/config/setting/others/appearance/create';
const DEFAULT_COLOR = '#005081';

const label = { display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' };
const card  = { background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' };

const SectionTitle = ({ icon: Icon, title }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Icon sx={{ fontSize: 16, color: '#3b3fd8' }} />
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#3b3fd8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{title}</Typography>
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

    // Charger les valeurs depuis app-appearance au montage
    useEffect(() => {
        try {
            const raw = loadItemFromSessionStorage('app-appearance') || loadItemFromLocalStorage('app-appearance');
            if (raw) {
                const a = JSON.parse(raw);
                const sc = a.sidebarColor || DEFAULT_COLOR;
                const tc = a.topbarColor  || DEFAULT_COLOR;
                const lg = a.logo         || null;
                setSidebarColor(sc);
                setTopbarColor(tc);
                setLogo(lg);
                savedRef.current = { sidebarColor: sc, topbarColor: tc, logo: lg };
            }
        } catch {}
    }, []);

    // Prévisualisation en temps réel → met à jour les CSS variables sans sauvegarder
    useEffect(() => {
        setColors({ sidebarColor, topbarColor });
    }, [sidebarColor, topbarColor]); // eslint-disable-line react-hooks/exhaustive-deps

    const primary     = getPagePrimary({ sidebarColor, topbarColor });
    const primaryDark = darkenColor(primary, 0.15);

    // Upload logo
    const readLogo = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => setLogo(e.target.result);
        reader.readAsDataURL(file);
    };

    const handleFileInput   = (e) => readLogo(e.target.files[0]);
    const handleDrop        = (e) => { e.preventDefault(); setIsDragging(false); readLogo(e.dataTransfer.files[0]); };
    const handleDragOver    = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave   = () => setIsDragging(false);

    const handleReset = () => {
        const s = savedRef.current;
        setSidebarColor(s.sidebarColor);
        setTopbarColor(s.topbarColor);
        setLogo(s.logo);
        setColors({ sidebarColor: s.sidebarColor, topbarColor: s.topbarColor });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = loadItemFromLocalStorage('token');
            const payload = { sidebarColor, topbarColor, logo };
            await axios.post(SAVE_API, payload, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            // Mettre à jour le storage
            const stored = JSON.stringify(payload);
            saveItemToSessionStorage(stored, 'app-appearance');
            saveItemToLocalStorage(stored,   'app-appearance');
            savedRef.current = payload;

            // Propager les couleurs dans tout le système
            window.dispatchEvent(new CustomEvent('gpr-auth-loaded', {
                detail: { sidebarColor, topbarColor }
            }));

            notify('Apparence sauvegardée', 'success');
        } catch {
            notify('Erreur lors de la sauvegarde', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="card-panel pb-5">
            {/* En-tête */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ width: 38, height: 38, borderRadius: 2, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PaletteIcon sx={{ color: '#6366F1', fontSize: 20 }} />
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
                                {sidebarColor.toLowerCase() !== topbarColor.toLowerCase() && (
                                    <span style={{ color: '#94a3b8' }}> (blend sidebar + topbar)</span>
                                )}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Logo */}
                    <Box sx={card}>
                        <SectionTitle icon={ImageIcon} title="Logo" />

                        <Box
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => document.getElementById('logo-upload-apparence').click()}
                            sx={{
                                border: `2px dashed ${isDragging ? primary : '#cbd5e1'}`,
                                borderRadius: 3,
                                p: 3,
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: isDragging ? primary + '11' : '#f8fafc',
                                transition: 'all 0.2s',
                                '&:hover': { borderColor: primary, background: primary + '11' }
                            }}
                        >
                            {logo ? (
                                <img src={logo} alt="logo" style={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain' }} />
                            ) : (
                                <>
                                    <ImageIcon sx={{ fontSize: 32, color: '#cbd5e1', mb: 1 }} />
                                    <Typography sx={{ fontSize: 13, color: '#94a3b8' }}>
                                        Glissez une image ou cliquez pour choisir
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, color: '#cbd5e1', mt: 0.5 }}>PNG, JPG — recommandé fond transparent</Typography>
                                </>
                            )}
                        </Box>
                        <input id="logo-upload-apparence" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileInput} />

                        {logo && (
                            <Box sx={{ mt: 1.5, textAlign: 'right' }}>
                                <Button size="small" color="error" onClick={() => setLogo(null)} sx={{ fontSize: 11 }}>
                                    Supprimer le logo
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {/* Boutons */}
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
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

                {/* ── Colonne droite : aperçu ── */}
                <Box sx={card}>
                    <SectionTitle icon={PaletteIcon} title="Aperçu en direct" />

                    {/* Mini application mockup */}
                    <Box sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden', background: '#f1f5f9' }}>

                        {/* Mini topbar */}
                        <Box sx={{ background: topbarColor, height: 36, display: 'flex', alignItems: 'center', px: 2, gap: 1, justifyContent: 'space-between' }}>
                            <Typography sx={{ fontSize: 11, color: '#fff', fontWeight: 700, opacity: 0.9 }}>GPR — Gestion des Plaintes</Typography>
                            <Box sx={{ display: 'flex', gap: 0.8 }}>
                                {[1,2,3].map(i => <Box key={i} sx={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />)}
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', minHeight: 220 }}>
                            {/* Mini sidebar */}
                            <Box sx={{ width: 120, background: sidebarColor, p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                                {logo && (
                                    <Box sx={{ mb: 1, textAlign: 'center' }}>
                                        <img src={logo} alt="logo" style={{ maxHeight: 32, maxWidth: '100%', objectFit: 'contain' }} />
                                    </Box>
                                )}
                                {['Tableau de bord', 'Réclamations', 'Suggestions', 'Rapports', 'Configurations'].map((item) => (
                                    <Box key={item} sx={{ px: 1, py: 0.6, borderRadius: 1.5, background: 'rgba(255,255,255,0.12)' }}>
                                        <Typography sx={{ fontSize: 9, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{item}</Typography>
                                    </Box>
                                ))}
                            </Box>

                            {/* Mini contenu */}
                            <Box sx={{ flex: 1, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {/* KPI cards */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                    {['Réclamations', 'Traitées'].map((kpi) => (
                                        <Box key={kpi} sx={{ background: '#fff', borderRadius: 2, p: 1, borderLeft: `3px solid ${primary}` }}>
                                            <Typography sx={{ fontSize: 8, color: '#64748b' }}>{kpi}</Typography>
                                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: primary }}>24</Typography>
                                        </Box>
                                    ))}
                                </Box>

                                {/* Exemple bouton primary */}
                                <Box sx={{
                                    background: `linear-gradient(135deg, ${primaryDark} 0%, ${primary} 100%)`,
                                    borderRadius: 2, py: 0.8, px: 1.5, display: 'inline-block', alignSelf: 'flex-start'
                                }}>
                                    <Typography sx={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>+ Enregistrer</Typography>
                                </Box>

                                {/* Exemple en-tête modal */}
                                <Box sx={{ background: '#fff', borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                    <Box sx={{ background: `linear-gradient(135deg, ${primaryDark} 0%, ${primary} 100%)`, px: 1.5, py: 0.8 }}>
                                        <Typography sx={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>Détail réclamation</Typography>
                                    </Box>
                                    <Box sx={{ px: 1.5, py: 1 }}>
                                        <Box sx={{ height: 6, background: '#f1f5f9', borderRadius: 2, mb: 0.8 }} />
                                        <Box sx={{ height: 6, background: '#f1f5f9', borderRadius: 2, width: '70%' }} />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    <Typography sx={{ fontSize: 11, color: '#94a3b8', mt: 1.5, textAlign: 'center' }}>
                        L'aperçu se met à jour en temps réel • Les changements sont appliqués après sauvegarde
                    </Typography>
                </Box>
            </Box>
        </div>
    );
};

export default Apparence;
