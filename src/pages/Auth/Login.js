import React, { useEffect, useState } from "react";
import { authenticate } from "../../redux/actions/LayoutActions";
import { useThemeColors, darkenColor, getPagePrimary, getContrastText } from "../../context/ThemeColorsContext";
import { connect } from "react-redux";
import {
  emailChanged,
  etatChanged,
  loginErrors,
  passChanged,
} from "../../redux/actions/LoginActions";
import { LoginApi, LoginApiOffline } from "../../apis/LoginApi";
import {
  clearLocalstorage,
  loadItemFromLocalStorage,
  loadItemFromSessionStorage,
  saveItemToLocalStorage,
} from "../../Utils/utils";
import logo from "../../assets/images/logo_gpr.jpg";
import logoSicma from "../../assets/images/logo_sicma.png";
import loginPhoto from "../../assets/images/login_photo.png";
import bravo from "../../assets/images/bravo.jpg";
import closeImg from "../../assets/images/close.svg";
import successNew from "../../assets/images/success2.jpg";
import LoadingButton from "@mui/lab/LoadingButton";
import { NavLink } from "react-router-dom";
import { Box, Button, Modal, Typography } from "@mui/material";
import { notify } from "../../Utils/alert";
import BlockButton from "../../components/shared/BlockButton";

// ── SVG Icons ────────────────────────────────────────────────────────────
const SvgEmail = ({ size = 20, color = "#64748b" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
const SvgLock = ({ size = 20, color = "#64748b" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
const SvgEye = ({ size = 18, color = "#94a3b8" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const SvgEyeOff = ({ size = 18, color = "#94a3b8" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>;
const SvgArrowIn = ({ size = 18, color = "white" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>;
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

const Login = (props) => {
  const { colors, logo: institutionLogo } = useThemeColors();
  const primaryColor = getPagePrimary(colors);
  const primaryDark = darkenColor(primaryColor, 0.18);
  const heroText = getContrastText(primaryColor);
  const isLightHero = heroText === "#0F172A";
  const heroTextSoft = isLightHero ? "rgba(15,23,42,0.65)" : "rgba(255,255,255,0.75)";
  const heroTextSofter = isLightHero ? "rgba(15,23,42,0.55)" : "rgba(255,255,255,0.70)";
  const [showPassword, setShowPassword] = useState(false);
  const [showGroupB, setShowGroupB] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setShowGroupB(g => !g), 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  const clearComponentState = () => {
    props.emailChanged("");
    props.passChanged("");
  };

  const [rememberMe, setRememberMe] = useState(false);

  const [online, setOnline] = React.useState(true);

  const handleOnline = () => {
    setOnline(true);
    notify("Mode online activé ", "success");
  };

  const handleControl = () => {
    let lic = loadItemFromLocalStorage("lic");
    if (lic) {
      // loadItemFromLocalStorage() parse déjà le JSON en interne — un second
      // JSON.parse() ici plantait dès que "app-user" existait, empêchant le
      // passage en mode offline.
      let user = loadItemFromLocalStorage("app-user");

      if (user === undefined) {
        notify(
          "Vous devez vous connectez au moins une fois pour pouvoir accéder à l'option offline",
          "error"
        );
      } else {
        notify("Mode offline activé ", "success");
        setOnline(false);
      }
    } else {
      notify(
        "Votre licence est exoirée, vous ne pouvez accédez au mode offline. ",
        "info"
      );
    }
  };

  useEffect(() => {
    const after = localStorage.getItem("afterInscription");
    if (after) {
      localStorage.removeItem("afterInscription");
      setShowWelcomeMessage(true);
    }

    return () => {
      localStorage.removeItem("afterInscription");
      clearComponentState();
    };
  }, [""]);

  useEffect(() => {
    // vérifier si le serveur est démarré
    // pingApi().then()
    // console.error(props.email)
    // console.error(props.pass)
    return clearComponentState();
  }, []);
  let errors = {};
  const handleValidation = () => {
    let isValid = true;

    if (
      props.email === "" ||
      props.email === undefined ||
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(props.email)
    ) {
      isValid = false;
      errors["email"] = "Champ incorrect";
    }
    if (props.pass === "" || props.pass === undefined) {
      isValid = false;
      errors["pass"] = "Champ incorrect";
    }
    return isValid;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    let credentials = {};
    credentials["email"] = props.email;
    credentials["password"] = props.pass;

    if (handleValidation()) {
      props.etatChanged(true);
      // console.log("online",online)
      if (online) {
        LoginApi(credentials, props);
      } else {
        LoginApiOffline(credentials, props);
      }
    } else {
    }
    props.loginErrors(errors);
  };

  return (
    <>
      {/* ── Overlay bienvenue ── */}
      {showWelcomeMessage && (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-[99]">
          <div
            className="bg-white rounded-xl shadow-2xl p-5 text-[15px] max-w-[400px] max-h-[90vh] overflow-y-auto text-center text-black"
            style={{ backgroundImage: `url(${successNew})`, backgroundSize: "cover" }}
          >
            <div className="flex justify-end">
              <img
                src={closeImg} alt="close" className="w-[30px] cursor-pointer"
                onClick={() => { setShowWelcomeMessage(false); localStorage.removeItem("afterInscription"); }}
              />
            </div>
            <img src={bravo} alt="bravo" className="mb-2 w-[200px]" />
            <div className="text-[25px] font-black my-[5px]">Bienvenue sur GPR</div>
            <p>Bravo, Votre inscription s'est bien passée. Votre compte est en cours de validation.</p>
            <p>{"Cliquez sur \" D'accord \" pour continuer !"}</p>
            <div className="flex justify-center">
              <div
                className="bg-[#005081] px-[30px] py-[15px] rounded-full text-white my-2.5 cursor-pointer"
                onClick={() => { setShowWelcomeMessage(false); localStorage.removeItem("afterInscription"); localStorage.removeItem("CodeInstitution"); }}
              >
                D'accord
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Layout 2 colonnes ── */}
      <div className="gpr-auth flex h-screen" style={{ background: "#F8FAFC", fontFamily: "'Inter', -apple-system, sans-serif" }}>

        {/* ── Colonne gauche - hero storytelling ── */}
        <div
          className="hidden md:flex relative overflow-hidden flex-col items-center justify-center px-4 py-8 md:px-6 md:py-10 lg:px-12 lg:py-16"
          style={{ width: "50%" }}
        >

          {/* Couche 1 - fond dégradé */}
          <div
            className="absolute inset-0 animate-gradient-bg"
            style={{ background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryColor} 100%)` }}
          />

          {/* Couche 2 - grands cercles semi-transparents (≈60% de la hauteur) */}
          <div
            className="absolute rounded-full animate-blob"
            style={{ width: "62vh", height: "62vh", top: "-14%", right: "-24%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}
          />
          <div
            className="absolute rounded-full animate-blob"
            style={{ width: "44vh", height: "44vh", bottom: "-16%", left: "-18%", background: "rgba(255,255,255,0.05)", animationDelay: "6s" }}
          />

          {/* Couche 3 - carrés flottants (opacité 10%) - desktop uniquement */}
          <div className="hidden lg:block absolute top-20 left-28 w-16 h-16 rounded-2xl rotate-12 animate-float" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="hidden lg:block absolute bottom-24 right-32 w-20 h-20 rounded-2xl -rotate-12 animate-float" style={{ background: "rgba(255,255,255,0.1)", animationDelay: "1.5s" }} />
          <div className="hidden lg:block absolute top-1/2 right-12 w-10 h-10 rounded-xl rotate-45 animate-float" style={{ background: "rgba(255,255,255,0.1)", animationDelay: "3s" }} />

          {/* Couche 4 - cartes fonctionnelles avec cycle zoom */}
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
                {/* Groupe A - cellule 1/1 */}
                <div style={{ ...cardBase, gridArea: '1/1', transform: (!showGroupB || !modB) ? 'translateY(0)' : 'translateY(-24px)', opacity: (!showGroupB || !modB) ? 1 : 0 }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: modA.color + "33" }}>
                    <modA.icon size={18} color={modA.color} />
                  </div>
                  <span className="text-[13px] font-semibold" style={{ color: heroText }}>{modA.label}</span>
                </div>
                {/* Groupe B - même cellule 1/1, superposée */}
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

          {/* Couche 5 - contenu central */}
          <div className="relative z-10 flex flex-col items-center text-center w-full px-2">

            {/* Badge plateforme */}
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

          {/* Couche 6 - CTA création de compte */}
          <div className="relative z-10 mt-5 md:mt-10 text-center animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <h6 className="text-[13px] mb-3" style={{ color: heroTextSofter }}>Pas encore de compte ?</h6>
            <NavLink to="/SignUser">
              <Button
                variant="contained"
                style={{ background: "#FFFFFF", color: primaryColor, borderRadius: "10px", padding: "9px 30px", fontWeight: 700, fontSize: "13px", textTransform: "none", boxShadow: "0 6px 18px rgba(0,0,0,0.18)" }}
                className="transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_24px_rgba(0,0,0,0.28)]"
              >
                Créer un compte
              </Button>
            </NavLink>
          </div>
        </div>

        {/* ── Colonne droite - formulaire ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white flex flex-col">
          <div className="flex flex-col items-center px-6 sm:px-10 lg:px-0 pt-8 sm:pt-10 flex-1">
            <div className="w-full max-w-[540px] animate-fade-up">

              {/* Logos header */}
              <div className="mb-7">
                <div className="flex items-center justify-center gap-4 mb-5">
                  <div className="bg-[#f4f7fb] rounded-xl w-12 h-12 flex-shrink-0 overflow-hidden">
                    <img src={logo} alt="Logo GPR" className="h-12 w-auto object-cover object-left" />
                  </div>
                  <div className="w-px h-8 bg-[#e2e8f0]" />
                  <img src={institutionLogo || logoSicma} alt="Logo Institution" className="h-10 object-contain" />
                </div>
                <div className="text-center">
                  <p className="text-[#1a2b3c] font-bold text-[15px]">Gestion des Plaintes ou Réclamations</p>
                </div>
              </div>

              <h2 className="text-[22px] sm:text-[24px] font-extrabold text-[#1a2b3c] mb-1.5">Connexion</h2>
              <p className="text-[#8a9bb0] text-[13.5px] mb-7">
                Entrez vos identifiants pour accéder à la plateforme
              </p>

              {/* Toggle Online / Offline */}
              <div className="mb-6">
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    className={`flex-1 py-2.5 sm:py-3 rounded-lg font-semibold text-sm border-0 cursor-pointer transition-colors ${online ? "" : "bg-[#eef2f7] text-[#475569]"}`}
                    style={online ? { background: `linear-gradient(135deg, ${primaryDark}, ${primaryColor})`, color: heroText } : undefined}
                    onClick={handleOnline}
                  >
                    Online
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2.5 sm:py-3 rounded-lg font-semibold text-sm border-0 cursor-pointer transition-colors ${!online ? "" : "bg-[#eef2f7] text-[#475569]"}`}
                    style={!online ? { background: `linear-gradient(135deg, ${primaryDark}, ${primaryColor})`, color: heroText } : undefined}
                    onClick={handleControl}
                  >
                    Offline
                  </button>
                </div>
                <p className="text-[#64748b] text-[11.5px] mt-1.5 text-center">
                  {online ? "Connexion avec accès internet" : "Connexion en réseau local / hors ligne"}
                </p>
              </div>

              <form onSubmit={handleSubmit}>

                {/* Champ email */}
                <div className="mb-4">
                  <label htmlFor="email" className="block text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.6px] mb-1.5">
                    Adresse électronique
                  </label>
                  <div className="flex items-center gap-2.5 border-2 border-[#e2e8f0] bg-[#f8fafc] rounded-xl px-4 h-[56px] transition-all duration-200 focus-within:border-[#1E88E5] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(30,136,229,0.1)]">
                    <SvgEmail />
                    <input
                      id="email" type="email"
                      className="validate border-0 outline-none flex-1 h-full text-sm text-[#1a2b3c] bg-transparent placeholder-[#94a3b8]"
                      placeholder="exemple@domaine.com"
                      onChange={(e) => props.emailChanged(e.target.value)}
                    />
                  </div>
                  <small className="errorTxt4">
                    <span className="error text-red-500 text-xs ml-0.5 mt-1 block">{props.errors.email}</span>
                  </small>
                </div>

                {/* Champ mot de passe */}
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
                      onChange={(e) => props.passChanged(e.target.value)}
                    />
                    <span onClick={toggleShowPassword} className="cursor-pointer text-[#94a3b8] flex flex-shrink-0">
                      {showPassword ? <SvgEyeOff /> : <SvgEye />}
                    </span>
                  </div>
                  <small className="errorTxt4">
                    <span className="error text-red-500 text-xs ml-0.5 mt-1 block">{props.errors.pass}</span>
                  </small>
                </div>

                {/* Mot de passe oublié */}
                <div className="flex justify-end mb-1 mt-3">
                  <NavLink
                    to="/forgot-password"
                    style={{ color: primaryColor }}
                    className="text-[13px] font-semibold hover:underline"
                  >
                    Mot de passe oublié ?
                  </NavLink>
                </div>

                {/* Bouton Se connecter */}
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
                    <span>Se connecter</span>
                  </LoadingButton>
                </BlockButton>

              </form>

              {/* Lien création de compte - mobile uniquement */}
              <div className="lg:hidden text-center mt-6">
                <span className="text-[#64748b] text-[13px]">Pas encore de compte ?&nbsp;</span>
                <NavLink to="/SignUser" style={{ color: primaryColor }} className="text-[13px] font-semibold hover:underline">
                  Créer un compte
                </NavLink>
              </div>

            </div>
          </div>
          {/* Footer copyright */}
          <p className="text-center text-[#64748b] text-xs py-4 mt-auto border-t border-[#f1f5f9]">
            © {new Date().getFullYear()} SICMA &amp; Associés · Tous droits réservés
          </p>
        </div>

      </div>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    isLoading: state.login.isLoading,
    email: state.login.email,
    pass: state.login.pass,
    etat: state.login.etat,
    errors: state.login.login_errors,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    authenticate: () => dispatch(authenticate()),
    loginErrors: (err) => {
      dispatch(loginErrors(err));
    },
    emailChanged: (email) => {
      dispatch(emailChanged(email));
    },
    passChanged: (pass) => {
      dispatch(passChanged(pass));
    },
    etatChanged: (etat) => {
      dispatch(etatChanged(etat));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);

