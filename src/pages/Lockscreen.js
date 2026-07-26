import React, { useEffect, useState } from 'react'
import logo from '../assets/images/logo_gpr.jpg';
import logoSicma from '../assets/images/logo_sicma.png';
import FemalAvatar from "../assets/images/avatar/2.svg"
import LoadingButton from '@mui/lab/LoadingButton';
import { Avatar, Button } from '@mui/material';
import BlockButton from '../components/shared/BlockButton';
import { connect } from 'react-redux';
import { locked, setLastActivity, setLocked, setUnlocked, setUser, unlocked } from '../redux/actions/LockscreenActions';
import { LogoutRounded } from '@mui/icons-material';
import { LoginApi } from '../apis/LoginApi';
import { authenticate, isAuth } from "../redux/actions/LayoutActions";
import { etatChanged } from "../redux/actions/LoginActions";
import { useThemeColors, darkenColor, getPagePrimary, getContrastText } from "../context/ThemeColorsContext";

// ── SVG Icons ────────────────────────────────────────────────────────────
const SvgLock = ({ size = 20, color = "#64748b" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
const SvgEye = ({ size = 18, color = "#94a3b8" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const SvgEyeOff = ({ size = 18, color = "#94a3b8" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>;
const SvgArrowIn = ({ size = 18, color = "white" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>;
const SvgShield = ({ size = 16, color = "rgba(255,255,255,0.7)" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
const SvgComplaint = ({ size = 18, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="15.5" x2="12.01" y2="15.5" /></svg>;
const SvgBulb = ({ size = 18, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18" /><line x1="10" y1="22" x2="14" y2="22" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" /></svg>;
const SvgMega = ({ size = 18, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>;
const SvgChart = ({ size = 18, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const SvgBell = ({ size = 18, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const SvgStar = ({ size = 18, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const SvgSendMail = ({ size = 18, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;

const GROUP_A = [
    { icon: SvgComplaint, label: "Réclamations", color: "#fb923c" },
    { icon: SvgBulb, label: "Suggestions", color: "#60a5fa" },
    { icon: SvgMega, label: "Dénonciations", color: "#f87171" },
    { icon: SvgChart, label: "Rapports", color: "#34d399" },
];

const GROUP_B = [
    { icon: SvgBell, label: "Alertes", color: "#f59e0b" },
    { icon: SvgStar, label: "IA intégrée", color: "#a78bfa" },
    { icon: SvgSendMail, label: "Notifications auto", color: "#38bdf8" },
    null,
];

const CARD_POSITIONS = [
    { top: '9%', left: '5%', transform: 'rotate(-6deg)' },
    { top: '6%', right: '4%', transform: 'rotate(4deg)' },
    { bottom: '26%', left: '6%', transform: 'rotate(3deg)' },
    { bottom: '13%', right: '5%', transform: 'rotate(-4deg)' },
];

const Lockscreen = (props) => {
    const { colors, logo: institutionLogo } = useThemeColors();
    const primaryColor = getPagePrimary(colors);
    const primaryDark  = darkenColor(primaryColor, 0.18);
    const heroText = getContrastText(primaryColor);
    const isLightHero = heroText === "#0F172A";
    const heroTextSoft = isLightHero ? "rgba(15,23,42,0.65)" : "rgba(255,255,255,0.75)";
    const heroTextSofter = isLightHero ? "rgba(15,23,42,0.55)" : "rgba(255,255,255,0.70)";
    const [showPassword, setShowPassword] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [password, setPassword] = useState(null);
    const [showGroupB, setShowGroupB] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => setShowGroupB(g => !g), 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        let credentials = {};
        credentials["email"] = userInfo?.email ?? "";
        credentials["password"] = password;
        props.etatChanged(true);
        LoginApi(credentials, props, true);
    };

    const logout = () => {
        props.setUnlocked();
        props.isAuth(false);
    };

    const parseUserInfo = () => {
        var result = JSON.parse(props.user);
        if (typeof result === "string") { result = JSON.parse(result); }
        setUserInfo(result);
    };

    useEffect(() => { parseUserInfo(); }, [""]);
    const toggleShowPassword = () => { setShowPassword(!showPassword); };

    return (
        <div className="gpr-auth flex h-screen" style={{ background: "#F8FAFC", fontFamily: "'Inter', -apple-system, sans-serif" }}>

            {/* ── Colonne gauche — hero ── */}
            <div
                className="hidden md:flex relative overflow-hidden flex-col items-center justify-center px-4 py-8 md:px-6 md:py-10 lg:px-12 lg:py-16"
                style={{ width: "50%" }}
            >
                {/* Couche 1 — fond dégradé */}
                <div className="absolute inset-0 animate-gradient-bg" style={{ background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryColor} 100%)` }} />

                {/* Couche 2 — cercles */}
                <div className="absolute rounded-full animate-blob" style={{ width: "62vh", height: "62vh", top: "-14%", right: "-24%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }} />
                <div className="absolute rounded-full animate-blob" style={{ width: "44vh", height: "44vh", bottom: "-16%", left: "-18%", background: "rgba(255,255,255,0.05)", animationDelay: "6s" }} />

                {/* Couche 3 — carrés flottants — desktop uniquement */}
                <div className="hidden lg:block absolute top-20 left-28 w-16 h-16 rounded-2xl rotate-12 animate-float" style={{ background: "rgba(255,255,255,0.1)" }} />
                <div className="hidden lg:block absolute bottom-24 right-32 w-20 h-20 rounded-2xl -rotate-12 animate-float" style={{ background: "rgba(255,255,255,0.1)", animationDelay: "1.5s" }} />
                <div className="hidden lg:block absolute top-1/2 right-12 w-10 h-10 rounded-xl rotate-45 animate-float" style={{ background: "rgba(255,255,255,0.1)", animationDelay: "3s" }} />

                {/* Couche 4 — cartes cycling — desktop uniquement */}
                {CARD_POSITIONS.map((pos, i) => {
                    const modA = GROUP_A[i];
                    const modB = GROUP_B[i];
                    const cardBase = {
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 16, padding: '10px 16px',
                        backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        cursor: 'default', userSelect: 'none', whiteSpace: 'nowrap',
                        transition: 'transform 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1.2s ease',
                    };
                    return (
                        <div key={i} className="hidden lg:grid" style={{ position: 'absolute', ...pos }}>
                            <div style={{ ...cardBase, gridArea: '1/1', transform: (!showGroupB || !modB) ? 'translateY(0)' : 'translateY(-24px)', opacity: (!showGroupB || !modB) ? 1 : 0 }}>
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: modA.color + "33" }}>
                                    <modA.icon size={18} color={modA.color} />
                                </div>
                                <span className="text-[13px] font-semibold" style={{ color: heroText }}>{modA.label}</span>
                            </div>
                            {modB && (
                                <div style={{ ...cardBase, gridArea: '1/1', transform: showGroupB ? 'translateY(0)' : 'translateY(24px)', opacity: showGroupB ? 1 : 0 }}>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: modB.color + "33" }}>
                                        <modB.icon size={18} color={modB.color} />
                                    </div>
                                    <span className="text-[13px] font-semibold" style={{ color: heroText }}>{modB.label}</span>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Couche 5 — contenu central */}
                <div className="relative z-10 flex flex-col items-center text-center w-full px-2">
                    {/* Badge */}
                    <div className="bg-white rounded-2xl p-3 mb-5 md:mb-8 shadow-xl inline-flex items-center gap-3 animate-fade-up">
                        <div className="bg-[#f4f7fb] rounded-xl w-10 h-10 md:w-12 md:h-12 flex-shrink-0 overflow-hidden">
                            <img src={logo} alt="Logo GPR" className="h-full w-auto object-cover object-left" />
                        </div>
                        <div className="text-left">
                            <div className="text-[#1a2b3c] font-bold text-[12px] md:text-[13px] leading-tight">Gestion des plaintes</div>
                            <div className="text-[#1a2b3c] font-bold text-[12px] md:text-[13px] leading-tight">ou des réclamations</div>
                        </div>
                        <div className="w-px h-8 bg-[#e2e8f0] mx-1 flex-shrink-0" />
                        <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center">
                            <img src={institutionLogo || logoSicma} alt="Logo Institution" className="h-full w-full object-contain" />
                        </div>
                    </div>

                    <p className="text-[15px] md:text-[19px] leading-relaxed mb-2 md:mb-3 animate-fade-up font-bold" style={{ animationDelay: "0.2s", color: heroText }}>
                        Chaque voix mérite une réponse.
                    </p>
                    <p className="text-[12.5px] md:text-[14.5px] leading-relaxed mb-5 md:mb-10 animate-fade-up" style={{ animationDelay: "0.25s", color: heroTextSoft }}>
                        Transformez les plaintes, suggestions et alertes<br />en actions concrètes et mesurables.
                    </p>
                </div>

                {/* Couche 6 — CTA déconnexion */}
                <div className="relative z-10 mt-5 md:mt-10 text-center animate-fade-up" style={{ animationDelay: "0.4s" }}>
                    <h6 className="text-[13px] mb-3" style={{ color: heroTextSofter }}>Ce n'est pas vous ?</h6>
                    <Button
                        variant="contained"
                        onClick={logout}
                        style={{ background: "#FFFFFF", color: primaryColor, borderRadius: "10px", padding: "9px 30px", fontWeight: 700, fontSize: "13px", textTransform: "none", boxShadow: "0 6px 18px rgba(0,0,0,0.18)" }}
                        className="transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_24px_rgba(0,0,0,0.28)]"
                    >
                        Se déconnecter
                    </Button>
                </div>
            </div>

            {/* ── Colonne droite — déverrouillage ── */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white flex flex-col">
                <div className="flex flex-col items-center justify-center px-6 sm:px-10 lg:px-0 py-8 flex-1">
                    <div className="w-full max-w-[440px] animate-fade-up">

                        {/* Logos — mobile uniquement */}
                        <div className="flex md:hidden items-center justify-center gap-4 mb-7">
                            <div className="bg-[#f4f7fb] rounded-xl w-10 h-10 flex-shrink-0 overflow-hidden">
                                <img src={logo} alt="Logo GPR" className="h-full w-auto object-cover object-left" />
                            </div>
                            <div className="w-px h-8 bg-[#e2e8f0]" />
                            <img src={institutionLogo || logoSicma} alt="Logo Institution" className="h-9 object-contain" />
                        </div>

                        {/* Profil utilisateur */}
                        <div className="flex items-center gap-4 mb-7">
                            <Avatar alt="Avatar" src={FemalAvatar} sx={{ width: 64, height: 64 }} />
                            <div className="flex-1 min-w-0">
                                <div className="text-[#1a2b3c] font-bold text-[16px] leading-tight truncate">{userInfo?.firstAndLastName}</div>
                                <br /> <div className="text-[#8a9bb0] text-[13px] truncate mt-1">({userInfo?.email})</div>
                            </div>
                            <button
                                type="button"
                                onClick={logout}
                                title="Se déconnecter"
                                className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#eef2f7] text-[#8a9bb0] flex items-center justify-center border-0 cursor-pointer transition-colors hover:bg-[#fde8e8] hover:text-[#ef4444]"
                            >
                                <LogoutRounded fontSize="small" />
                            </button>
                        </div>

                        <h2 className="text-[22px] sm:text-[24px] font-extrabold text-[#1a2b3c] mb-1.5">Session verrouillée</h2>
                        <p className="text-[#8a9bb0] text-[13.5px] mb-7">
                            Entrez votre mot de passe pour continuer
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-2">
                                <label htmlFor="pass" className="block text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.6px] mb-1.5">
                                    Mot de passe
                                </label>
                                <div className="flex items-center gap-2.5 border-2 border-[#e2e8f0] bg-[#f8fafc] rounded-xl px-4 h-[56px] transition-all duration-200 focus-within:border-[#1E88E5] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(30,136,229,0.1)]">
                                    <SvgLock />
                                    <input
                                        id="pass"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="validate border-0 outline-none flex-1 h-full text-sm text-[#1a2b3c] bg-transparent"
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <span onClick={toggleShowPassword} className="cursor-pointer text-[#94a3b8] flex flex-shrink-0">
                                        {showPassword ? <SvgEyeOff /> : <SvgEye />}
                                    </span>
                                </div>
                            </div>

                            <BlockButton disabled={props.etat} style={{ display: 'block' }}>
                                <LoadingButton
                                    style={{
                                        width: "100%", height: "58px", borderRadius: "14px", fontSize: "16px", fontWeight: 700,
                                        textTransform: "none", marginTop: "20px", color: heroText,
                                        background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryColor} 100%)`,
                                        boxShadow: `0 10px 25px -8px ${primaryColor}80`,
                                    }}
                                    className="transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_14px_35px_-8px_rgba(21,101,192,0.65)]"
                                    onClick={handleSubmit}
                                    loading={props.etat}
                                    disabled={props.etat}
                                    loadingPosition="end"
                                    endIcon={<SvgArrowIn color={heroText} />}
                                    variant="contained"
                                >
                                    <span>Déverrouiller</span>
                                </LoadingButton>
                            </BlockButton>
                        </form>
                    </div>
                </div>

                <p className="text-center text-[#64748b] text-xs py-4 mt-auto border-t border-[#f1f5f9]">
                    © {new Date().getFullYear()} SICMA &amp; Associés · Tous droits réservés
                </p>
            </div>

        </div>
    );
};

const mapStateToProps = (state) => ({
    isLocked: state.lockscreen.isLocked,
    user: state.lockscreen.user,
    lastActivity: state.lockscreen.lastActivity,
    etat: state.login.etat,
});
const mapDispatchToProps = (dispatch) => ({
    setLastActivity: () => dispatch(setLastActivity(Date.now())),
    unlocked: () => dispatch(unlocked()),
    locked: () => dispatch(locked()),
    setUser: () => dispatch(setUser(localStorage.getItem("app-user"))),
    setLocked: (err) => dispatch(setLocked(localStorage.getItem("app-user"))),
    setUnlocked: (id) => dispatch(setUnlocked()),
    authenticate: () => dispatch(authenticate()),
    etatChanged: (etat) => dispatch(etatChanged(etat)),
    isAuth: (etat) => dispatch(isAuth(etat)),
});
export default connect(mapStateToProps, mapDispatchToProps)(Lockscreen);
