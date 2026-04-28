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
      <div className="flex min-h-screen">

        {/* ── Colonne gauche — branding ── */}
        <div
          className="hide-on-med-and-down w-1/2 flex flex-col items-center justify-center px-12 py-16 relative overflow-hidden"
          style={{ background: "linear-gradient(160deg, #002e52 0%, #005081 60%, #0077b6 100%)" }}
        >
          {/* Cercle décoratif */}
          <div
            className="absolute top-[42%] -left-[60px] w-[200px] h-[200px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)" }}
          />

          {/* Carte mockup */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5 w-full max-w-[430px] mb-9 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3.5">
              <div className="bg-white rounded-lg px-2.5 py-1.5 flex items-center">
                <img src={logo} alt="Logo GPR" className="h-[26px] object-contain" />
              </div>
              <div className="flex-1 h-2 bg-white/20 rounded" />
              <div className="bg-white rounded-lg px-2.5 py-1 text-[13px] font-extrabold text-[#e63b2e] tracking-wide">
                SICMa
              </div>
            </div>
            <div className="flex gap-2">
              {[68, 40, 55, 80].map((w, i) => (
                <div key={i} className="h-1.5 bg-white/20 rounded-sm" style={{ width: `${w}px` }} />
              ))}
            </div>
          </div>

          {/* Texte branding */}
          <h2 className="text-white text-[26px] font-extrabold text-center mb-2.5 tracking-wide">
            SICMA ET ASSOCIES
          </h2>
          <p className="text-white/70 text-[13.5px] text-center max-w-[340px] leading-relaxed mb-7">
            Plateforme de Gestion des Plaintes et Réclamations.
            Efficace, traçable, conforme BCEAO.
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2.5 justify-center">
            {["Réclamations", "Dénonciations", "Suggestions", "Rapports"].map((tag) => (
              <span
                key={tag}
                className="rounded-full px-[18px] py-1.5 text-white text-[12.5px]"
                style={{ border: '1px solid rgba(255,255,255,0.45)' }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Bouton créer un compte */}
          <div className="mt-8 text-center">
            <h6 className="text-white/75 text-[13px] mb-3">Créer un compte utilisateur</h6>
            <NavLink to="/SignUser">
              <Button
                variant="outlined"
                style={{ borderColor: "rgba(255,255,255,0.5)", color: "white", borderRadius: "8px", padding: "8px 28px", fontWeight: 600, fontSize: "13px", textTransform: "none" }}
              >
                Créer un compte
              </Button>
            </NavLink>
          </div>
        </div>

        {/* ── Colonne droite — formulaire ── */}
        <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-10 relative">
          <div className="w-full max-w-[420px]">

            <h2 className="text-[22px] font-bold text-[#1a2b3c] mb-1.5">Connexion</h2>
            <p className="text-[#8a9bb0] text-[13.5px] mb-7">
              Entrez vos identifiants pour accéder à la plateforme
            </p>

            {/* Toggle Online / Offline */}
            <div className="flex gap-2.5 mb-5">
              <button
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm border-0 cursor-pointer transition-colors ${online ? 'bg-[#005081] text-white' : 'bg-[#f0f4f8] text-[#8a9bb0]'}`}
                onClick={handleOnline}
              >
                Online
              </button>
              <button
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm border-0 cursor-pointer transition-colors ${!online ? 'bg-[#005081] text-white' : 'bg-[#f0f4f8] text-[#8a9bb0]'}`}
                onClick={handleControl}
              >
                Offline
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              {/* Champ email */}
              <div className="mb-3.5">
                <div className="border border-[#d8e3ee] rounded-lg px-3.5 flex items-center h-[50px]">
                  <input
                    id="email" type="email"
                    className="validate border-0 outline-none flex-1 text-sm text-[#1a2b3c] bg-transparent"
                    placeholder="Adresse électronique"
                    onChange={(e) => props.emailChanged(e.target.value)}
                  />
                  <label htmlFor="email" className="hidden">Adresse électronique</label>
                </div>
                <small className="errorTxt4">
                  <span className="error text-red-500 text-xs ml-0.5 mt-1 block">{props.errors.email}</span>
                </small>
              </div>

              {/* Champ mot de passe */}
              <div className="mb-3.5">
                <div className="border border-[#d8e3ee] rounded-lg px-3.5 flex items-center h-[50px]">
                  <input
                    id="pass"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mot de passe"
                    className="validate border-0 outline-none flex-1 text-sm text-[#1a2b3c] bg-transparent"
                    onChange={(e) => props.passChanged(e.target.value)}
                  />
                  <label htmlFor="pass" className="hidden">Mot de passe</label>
                  <span onClick={toggleShowPassword} className="cursor-pointer text-[#8a9bb0] flex">
                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </span>
                </div>
                <small className="errorTxt4">
                  <span className="error text-red-500 text-xs ml-0.5 mt-1 block">{props.errors.pass}</span>
                </small>
              </div>

              {/* Bouton S'authentifier */}
              <LoadingButton
                style={{ width: "100%", height: "50px", backgroundColor: "#005081", borderRadius: "8px", fontSize: "15px", fontWeight: 600, textTransform: "none", marginTop: "8px" }}
                onClick={handleSubmit}
                loading={props.etat}
                loadingPosition="end"
                endIcon={<LoginIcon />}
                variant="contained"
              >
                <span>S'authentifier</span>
              </LoadingButton>

            </form>

            <p className="text-center text-[#b0bec8] text-xs mt-11">
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
