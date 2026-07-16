import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import logo from "../../assets/images/logo_gpr.jpg";
import logoSicma from "../../assets/images/logo_sicma.png";
import { notify } from "../../Utils/alert";
import { forgetPassword } from "../../apis/LoginApi";
import BlockButton from "../../components/shared/BlockButton";

// ── SVG Icons ────────────────────────────────────────────────────────────
const SvgEmail    = ({size=20,color="#64748b"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const SvgSend     = ({size=18,color="white"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const SvgShield   = ({size=16,color="rgba(255,255,255,0.7)"}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const SvgWarning  = ({size=18,color}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const SvgBulb     = ({size=18,color}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>;
const SvgMega     = ({size=18,color}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;
const SvgChart    = ({size=18,color}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const SvgBell     = ({size=18,color}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const SvgStar     = ({size=18,color}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const SvgSendMail = ({size=18,color}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;

const GROUP_A = [
  { icon: SvgWarning, label: "Réclamations",  color: "#fb923c" },
  { icon: SvgBulb,    label: "Suggestions",   color: "#60a5fa" },
  { icon: SvgMega,    label: "Dénonciations", color: "#f87171" },
  { icon: SvgChart,   label: "Rapports",      color: "#34d399" },
];

const GROUP_B = [
  { icon: SvgBell,     label: "Alertes",            color: "#f59e0b" },
  { icon: SvgStar,     label: "IA intégrée",         color: "#a78bfa" },
  { icon: SvgSendMail, label: "Notifications auto",  color: "#38bdf8" },
  null,
];

const CARD_POSITIONS = [
  { top: '9%',    left: '5%',  transform: 'rotate(-6deg)' },
  { top: '6%',    right: '4%', transform: 'rotate(4deg)'  },
  { bottom: '26%',left: '6%',  transform: 'rotate(3deg)'  },
  { bottom: '13%',right: '5%', transform: 'rotate(-4deg)' },
];

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGroupB, setShowGroupB] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setShowGroupB(g => !g), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    forgetPassword(email)
      .then(({ data }) => {
        if (data.status === true) {
          notify("Un nouveau mot de passe vous a été envoyé par email", "success");
          setEmail("");
        } else {
          notify(data.content?.message || "Erreur - Veuillez réessayer", "error");
        }
      })
      .catch((error) => {
        const message = error.response?.data?.content?.message || "Aucun compte associé à cette adresse électronique";
        notify(message, "error");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="gpr-auth flex h-screen" style={{ background: "#F8FAFC", fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── Colonne gauche — hero ── */}
      <div
        className="hidden md:flex relative overflow-hidden flex-col items-center justify-center px-4 py-8 md:px-6 md:py-10 lg:px-12 lg:py-16"
        style={{ width: "50%" }}
      >
        {/* Couche 1 — fond dégradé */}
        <div className="absolute inset-0 animate-gradient-bg" style={{ background: "linear-gradient(135deg, #0B1F4D 0%, #1565C0 100%)" }} />

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
                <span className="text-white text-[13px] font-semibold">{modA.label}</span>
              </div>
              {modB && (
                <div style={{ ...cardBase, gridArea: '1/1', transform: showGroupB ? 'translateY(0)' : 'translateY(24px)', opacity: showGroupB ? 1 : 0 }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: modB.color + "33" }}>
                    <modB.icon size={18} color={modB.color} />
                  </div>
                  <span className="text-white text-[13px] font-semibold">{modB.label}</span>
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
              <img src={logoSicma} alt="Logo Institution" className="h-full w-full object-contain" />
            </div>
          </div>

          <p className="text-white text-[15px] md:text-[19px] leading-relaxed mb-2 md:mb-3 animate-fade-up font-bold" style={{ animationDelay: "0.2s" }}>
            Chaque voix mérite une réponse.
          </p>
          <p className="text-white/75 text-[12.5px] md:text-[14.5px] leading-relaxed mb-5 md:mb-10 animate-fade-up" style={{ animationDelay: "0.25s" }}>
            Transformez les plaintes, suggestions et alertes<br />en actions concrètes et mesurables.
          </p>
        </div>

        {/* Couche 6 — CTA retour */}
        <div className="relative z-10 mt-5 md:mt-10 text-center animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <h6 className="text-white/70 text-[13px] mb-3">Vous vous souvenez de votre mot de passe ?</h6>
          <NavLink to="/login">
            <Button
              variant="outlined"
              style={{ borderColor: "rgba(255,255,255,0.5)", color: "white", borderRadius: "10px", padding: "9px 30px", fontWeight: 600, fontSize: "13px", textTransform: "none" }}
              className="transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_24px_rgba(255,255,255,0.35)]"
            >
              Se connecter
            </Button>
          </NavLink>
        </div>
      </div>

      {/* ── Colonne droite — formulaire ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white flex flex-col">
        <div className="flex flex-col items-center justify-center px-6 sm:px-10 lg:px-0 py-8 flex-1">
          <div className="w-full max-w-[440px] animate-fade-up">

            {/* Logos — mobile uniquement */}
            <div className="flex md:hidden items-center justify-center gap-4 mb-7">
              <div className="bg-[#f4f7fb] rounded-xl w-10 h-10 flex-shrink-0 overflow-hidden">
                <img src={logo} alt="Logo GPR" className="h-full w-auto object-cover object-left" />
              </div>
              <div className="w-px h-8 bg-[#e2e8f0]" />
              <img src={logoSicma} alt="Logo Institution" className="h-9 object-contain" />
            </div>

            <h2 className="text-[22px] sm:text-[24px] font-extrabold text-[#1a2b3c] mb-1.5">Mot de passe oublié</h2>
            <p className="text-[#8a9bb0] text-[13.5px] mb-7">
              Saisissez votre adresse électronique pour recevoir les instructions de réinitialisation
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <label htmlFor="email" className="block text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.6px] mb-1.5">
                  Adresse électronique
                </label>
                <div className="flex items-center gap-2.5 border-2 border-[#e2e8f0] bg-[#f8fafc] rounded-xl px-4 h-[56px] transition-all duration-200 focus-within:border-[#1E88E5] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(30,136,229,0.1)]">
                  <SvgEmail />
                  <input
                    id="email" type="email"
                    className="validate border-0 outline-none flex-1 h-full text-sm text-[#1a2b3c] bg-transparent"
                    placeholder="exemple@domaine.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <BlockButton disabled={loading} style={{ display: 'block' }}>
                <LoadingButton
                  type="submit"
                  style={{
                    width: "100%", height: "58px", borderRadius: "14px", fontSize: "16px", fontWeight: 700,
                    textTransform: "none", marginTop: "20px", color: "white",
                    background: "linear-gradient(135deg, #0F4C81 0%, #1E88E5 100%)",
                    boxShadow: "0 10px 25px -8px rgba(15,76,129,0.5)",
                  }}
                  className="transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_14px_35px_-8px_rgba(21,101,192,0.65)]"
                  loading={loading}
                  disabled={loading}
                  loadingPosition="end"
                  endIcon={<SvgSend />}
                  variant="contained"
                >
                  <span>Envoyer le lien</span>
                </LoadingButton>
              </BlockButton>

              <p className="text-center mt-5">
                <NavLink to="/login" className="text-[#1E88E5] text-[13px] font-semibold hover:underline">
                  Retour à la connexion
                </NavLink>
              </p>
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

export default ForgotPassword;
