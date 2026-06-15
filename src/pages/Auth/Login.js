import React, { useEffect, useState } from "react";
import { authenticate } from "../../redux/actions/LayoutActions";
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
import LoginIcon from "@mui/icons-material/Login";
import { NavLink } from "react-router-dom";
import { Box, Button, Modal, Typography } from "@mui/material";
import { EastOutlined, WestOutlined } from "@mui/icons-material";
import { notify } from "../../Utils/alert";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";

const MODULES = [
  { icon: ReportProblemOutlinedIcon, label: "Réclamations", color: "#fb923c" },
  { icon: LightbulbOutlinedIcon, label: "Suggestions", color: "#60a5fa" },
  { icon: CampaignOutlinedIcon, label: "Dénonciations", color: "#f87171" },
  { icon: AssessmentOutlinedIcon, label: "Rapports", color: "#34d399" },
];

const Login = (props) => {
  const [showPassword, setShowPassword] = useState(false);

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
      let user =
        loadItemFromLocalStorage("app-user") !== undefined
          ? JSON.parse(loadItemFromLocalStorage("app-user"))
          : undefined;

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
      <div className="gpr-auth flex min-h-screen" style={{ background: "#F8FAFC", fontFamily: "'Inter', -apple-system, sans-serif" }}>

        {/* ── Colonne gauche — hero storytelling ── */}
        <div
          className="hide-on-med-and-down relative overflow-hidden flex flex-col items-center justify-center px-12 py-16"
          style={{ width: "40%" }}
        >

          {/* Couche 1 — fond dégradé */}
          <div
            className="absolute inset-0 animate-gradient-bg"
            style={{ background: "linear-gradient(135deg, #0B1F4D 0%, #1565C0 100%)" }}
          />

          {/* Couche 2 — grands cercles semi-transparents (≈60% de la hauteur) */}
          <div
            className="absolute rounded-full animate-blob"
            style={{ width: "62vh", height: "62vh", top: "-14%", right: "-24%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}
          />
          <div
            className="absolute rounded-full animate-blob"
            style={{ width: "44vh", height: "44vh", bottom: "-16%", left: "-18%", background: "rgba(255,255,255,0.05)", animationDelay: "6s" }}
          />

          {/* Couche 3 — carrés flottants (opacité 10%) */}
          <div className="absolute top-20 left-28 w-16 h-16 rounded-2xl rotate-12 animate-float" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="absolute bottom-24 right-32 w-20 h-20 rounded-2xl -rotate-12 animate-float" style={{ background: "rgba(255,255,255,0.1)", animationDelay: "1.5s" }} />
          <div className="absolute top-1/2 right-12 w-10 h-10 rounded-xl rotate-45 animate-float" style={{ background: "rgba(255,255,255,0.1)", animationDelay: "3s" }} />

          {/* Couche 4 — cartes fonctionnelles flottantes, suspendues */}
          {MODULES.map((mod, i) => {
            const Icon = mod.icon;
            const positions = [
              "top-[9%] left-[5%] -rotate-6",
              "top-[16%] right-[4%] rotate-4",
              "bottom-[26%] left-[6%] rotate-3",
              "bottom-[13%] right-[5%] -rotate-4",
            ];
            return (
              <div
                key={i}
                className={`absolute z-[5] flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 backdrop-blur-md shadow-2xl hover:-translate-y-2 hover:rotate-0 hover:bg-white/20 transition-all duration-300 cursor-default ${positions[i]}`}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: mod.color + "33" }}>
                  <Icon style={{ fontSize: 18, color: mod.color }} />
                </div>
                <span className="text-white text-[13px] font-semibold whitespace-nowrap">{mod.label}</span>
              </div>
            );
          })}

          {/* Couche 5 — contenu central */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-md">

            {/* Badge plateforme */}
            <div className="bg-white rounded-2xl p-3 w-full max-w-[300px] mb-7 shadow-xl flex items-center gap-3 animate-fade-up">
              <div className="bg-[#f4f7fb] rounded-xl w-11 h-11 flex-shrink-0 overflow-hidden">
                <img src={logo} alt="Logo GPR" className="h-11 w-auto object-cover object-left" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-[#1a2b3c] font-bold text-[12.5px] leading-tight">Gestion des plaintes</div>
                <div className="text-[#1a2b3c] font-bold text-[12.5px] leading-tight">ou des réclamations</div>
              </div>
              <div className="bg-[#f4f7fb] rounded-xl w-11 h-11 flex-shrink-0 flex items-center justify-center p-1.5">
                <img src={logoSicma} alt="Logo Institution" className="h-full w-full object-contain" />
              </div>
            </div>

            <h1 className="text-white text-[42px] leading-[1.12] font-extrabold mb-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Gestion des Plaintes <br /> &amp; <span style={{ color: "#7dd3fc" }}>Réclamations</span>
            </h1>
            <p className="text-white/70 text-[14px] leading-relaxed mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Une plateforme moderne, sécurisée et conforme BCEAO pour suivre vos
              réclamations, dénonciations et suggestions en toute transparence.
            </p>

            <div className="flex items-center gap-2 text-white/70 text-xs animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <VerifiedUserOutlinedIcon style={{ fontSize: 16 }} />
              <span>Plateforme certifiée &amp; conforme BCEAO</span>
            </div>
          </div>

          {/* Couche 6 — CTA création de compte */}
          <div className="relative z-10 mt-10 text-center animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <h6 className="text-white/70 text-[13px] mb-3">Pas encore de compte ?</h6>
            <NavLink to="/SignUser">
              <Button
                variant="outlined"
                style={{ borderColor: "rgba(255,255,255,0.5)", color: "white", borderRadius: "10px", padding: "9px 30px", fontWeight: 600, fontSize: "13px", textTransform: "none" }}
                className="transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_24px_rgba(255,255,255,0.35)]"
              >
                Créer un compte
              </Button>
            </NavLink>
          </div>
        </div>

        {/* ── Colonne droite — formulaire ── */}
        <div className="flex-1 flex items-center justify-center bg-[#F8FAFC] px-6 py-10 relative overflow-hidden">

          {/* Cercles flous & effets lumineux */}
          <div className="absolute -top-28 -right-28 w-96 h-96 bg-[#1565C0]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-80px] left-[-80px] w-96 h-96 bg-[#0B1F4D]/8 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-[#FFC107]/10 rounded-full blur-3xl" />

          {/* Carte premium glassmorphism */}
          <div
            className="w-full max-w-[440px] bg-white/70 backdrop-blur-xl border border-white/60 rounded-[24px] p-8 sm:p-10 relative z-10 animate-fade-up"
            style={{ boxShadow: "0 30px 80px -20px rgba(11,31,77,0.25)" }}
          >

            {/* Logos visibles sur petits écrans */}
            <div className="hide-on-large-only flex items-center justify-center gap-4 mb-7">
              <img src={logo} alt="Logo GPR" className="h-9 object-contain" />
              <div className="w-px h-8 bg-[#e2e8f0]" />
              <img src={logoSicma} alt="Logo Institution" className="h-9 object-contain" />
            </div>

            <h2 className="text-[24px] font-extrabold text-[#1a2b3c] mb-1.5">Connexion</h2>
            <p className="text-[#8a9bb0] text-[13.5px] mb-7">
              Entrez vos identifiants pour accéder à la plateforme
            </p>

            {/* Toggle Online / Offline */}
            <div className="flex gap-2.5 mb-6">
              <button
                type="button"
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm border-0 cursor-pointer transition-colors ${online ? "text-white" : "bg-[#eef2f7] text-[#8a9bb0]"}`}
                style={online ? { background: "linear-gradient(135deg, #0F4C81, #1E88E5)" } : undefined}
                onClick={handleOnline}
              >
                Online
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm border-0 cursor-pointer transition-colors ${!online ? "text-white" : "bg-[#eef2f7] text-[#8a9bb0]"}`}
                style={!online ? { background: "linear-gradient(135deg, #0F4C81, #1E88E5)" } : undefined}
                onClick={handleControl}
              >
                Offline
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              {/* Champ email */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-[11px] font-bold text-[#94a3b8] uppercase tracking-[0.6px] mb-1.5">
                  Adresse électronique
                </label>
                <div className="flex items-center gap-2.5 border-2 border-[#e2e8f0] rounded-xl px-4 h-[52px] transition-all duration-200 focus-within:border-[#1E88E5] focus-within:shadow-[0_0_0_4px_rgba(30,136,229,0.1)]">
                  <EmailOutlinedIcon style={{ fontSize: 20, color: "#94a3b8" }} />
                  <input
                    id="email" type="email"
                    className="validate border-0 outline-none flex-1 h-full text-sm text-[#1a2b3c] bg-transparent"
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
                <div className="flex items-center gap-2.5 border-2 border-[#e2e8f0] rounded-xl px-4 h-[52px] transition-all duration-200 focus-within:border-[#1E88E5] focus-within:shadow-[0_0_0_4px_rgba(30,136,229,0.1)]">
                  <LockOutlinedIcon style={{ fontSize: 20, color: "#94a3b8" }} />
                  <input
                    id="pass"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="validate border-0 outline-none flex-1 h-full text-sm text-[#1a2b3c] bg-transparent"
                    onChange={(e) => props.passChanged(e.target.value)}
                  />
                  <span onClick={toggleShowPassword} className="cursor-pointer text-[#94a3b8] flex flex-shrink-0">
                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </span>
                </div>
                <small className="errorTxt4">
                  <span className="error text-red-500 text-xs ml-0.5 mt-1 block">{props.errors.pass}</span>
                </small>
              </div>

              {/* Se souvenir de moi / Mot de passe oublié */}
              <div className="flex items-center justify-between mb-1 mt-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded cursor-pointer accent-[#1E88E5]"
                  />
                  <span className="text-[#64748b] text-[13px]">Se souvenir de moi</span>
                </label>
                <NavLink
                  to="/forgot-password"
                  className="text-[#1E88E5] text-[13px] font-semibold hover:underline"
                >
                  Mot de passe oublié ?
                </NavLink>
              </div>

              {/* Bouton Se connecter */}
              <LoadingButton
                style={{
                  width: "100%", height: "52px", borderRadius: "12px", fontSize: "15px", fontWeight: 700,
                  textTransform: "none", marginTop: "16px", color: "white",
                  background: "linear-gradient(135deg, #0F4C81 0%, #1E88E5 100%)",
                  boxShadow: "0 10px 25px -8px rgba(15,76,129,0.5)",
                }}
                className="transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_14px_35px_-8px_rgba(21,101,192,0.65)]"
                onClick={handleSubmit}
                loading={props.etat}
                loadingPosition="end"
                endIcon={<LoginIcon />}
                variant="contained"
              >
                <span>Se connecter</span>
              </LoadingButton>

            </form>

            <p className="text-center text-[#b0bec8] text-xs mt-9">
              © {new Date().getFullYear()} SICMA &amp; Associés · Tous droits réservés
            </p>
          </div>

          <div className="content-overlay" />
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

