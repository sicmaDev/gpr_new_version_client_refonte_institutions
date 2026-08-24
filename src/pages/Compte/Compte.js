import React from "react";
import CompteDetails from "./CompteDetails";
import ChangePassword from "./ChangePassword";
import { loadItemFromSessionStorage, loadItemFromLocalStorage } from "../../Utils/utils";
import { useThemeColors, getPagePrimary } from "../../context/ThemeColorsContext";

const HABILITATIONS = [
  { code: "H1",  label: "Enregistrer une réclamation, suggestion, dénonciation",                                              color: "#00B8D9" },
  { code: "H2",  label: "Traitement d'une réclamation, dénonciation à risque mineur",                                         color: "#0052CC" },
  { code: "H3",  label: "Traitement d'une réclamation, dénonciation à risque moyen",                                          color: "#5243AA" },
  { code: "H4",  label: "Traitement d'une réclamation, dénonciation à risque élevé",                                          color: "#FF5630" },
  { code: "H5",  label: "Mesurer la satisfaction d'une réclamation",                                                          color: "#FF8B00" },
  { code: "H6",  label: "Affecter le traitement d'une réclamation, dénonciation à un utilisateur",                            color: "#FFC400" },
  { code: "H7",  label: "Imprimer la liste des réclamations, suggestions, dénonciations",                                     color: "#36B37E" },
  { code: "H8",  label: "Imprimer la liste avec le choix des critères",                                                       color: "#00875A" },
  { code: "H9",  label: "Exporter la liste des réclamations, suggestions, dénonciations",                                     color: "#253858" },
  { code: "H10", label: "Exporter la liste avec le choix des critères",                                                       color: "#666666" },
  { code: "H11", label: "Générer des rapports et statistiques",                                                               color: "#3333ff" },
  { code: "H12", label: "Configurer l'outil de gestion de plainte ou réclamation",                                            color: "#99003d" },
  { code: "H13", label: "Consulter les alertes de retard de traitement",                                                      color: "#00cc00" },
  { code: "H14", label: "Consulter toutes les informations",                                                                  color: "#333300" },
];

const ROLE_LABEL = { PILOTE: "Pilote Principal", DE: "Directeur / Directrice" };

const avatarColor = (name = "") => {
  const colors = ["#0F4C81", "#1E88E5", "#7C3AED", "#059669", "#DC2626", "#D97706", "#0891B2"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const initials = (name = "") => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Compte = () => {
  const user = loadItemFromSessionStorage("app-user")
    ? loadItemFromSessionStorage("app-user")
    : {};

  const name      = user.firstAndLastName || "";
  const email     = user.email || "";
  const poste     = user.posteDto?.libelle || "";
  const role      = user.additionalRole;
  const hbtCodes  = user.posteDto?.habilitations
    ? user.posteDto.habilitations.split(",").map(h => h.trim())
    : [];

  const { colors } = useThemeColors();
  const bg = getPagePrimary(colors);
  const userHabilitations = HABILITATIONS.filter(h => hbtCodes.includes(h.code));

  // Logo de l'institution (même logique de repli que Apparence.js : app-appearance.logo,
  // sinon app-institution.logo) affiché en fond du bandeau, à la place d'une photo de profil
  // personnalisée (fonctionnalité non prise en charge par l'application).
  const institutionLogo = (() => {
    try {
      const rawApp = loadItemFromSessionStorage('app-appearance') || loadItemFromLocalStorage('app-appearance');
      const app = typeof rawApp === 'string' ? JSON.parse(rawApp) : rawApp;
      if (app?.logo) return app.logo;

      const rawInst = loadItemFromSessionStorage('app-institution') || loadItemFromLocalStorage('app-institution');
      const inst = typeof rawInst === 'string' ? JSON.parse(rawInst) : rawInst;
      return inst?.logo || null;
    } catch {
      return null;
    }
  })();

  return (
    <div style={{ padding: "28px clamp(24px, 4vw, 52px)", maxWidth: 1100, margin: "0 auto" }}>

      {/* Page title */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Mon profil</div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>Gérez vos informations personnelles et votre sécurité</div>
      </div>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* ── Colonne gauche ── */}
        <div style={{ flex: "0 0 280px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Card identité */}
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            {/* Bandeau — logo de l'institution si disponible, sinon dégradé de couleur */}
            <div style={{
              height: 64,
              background: institutionLogo
                ? `url(${institutionLogo}) center / contain no-repeat, linear-gradient(135deg, ${bg}22 0%, ${bg}44 100%)`
                : `linear-gradient(135deg, ${bg}22 0%, ${bg}44 100%)`,
            }} />
            {/* Avatar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 20px 24px", marginTop: -28 }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: bg, border: "3px solid #fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 800, color: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,.15)",
                }}>
                  {initials(name)}
                </div>
              </div>
              <div style={{ marginTop: 12, fontWeight: 800, fontSize: 15.5, color: "#0F172A", textAlign: "center" }}>{name || "-"}</div>
              <div style={{
                marginTop: 6, fontSize: 11.5, fontWeight: 700,
                color: bg, background: bg + '18',
                padding: "3px 12px", borderRadius: 20,
              }}>
                {poste || "-"}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "#64748b", textAlign: "center", wordBreak: "break-all" }}>{email}</div>

              {role && (role === "PILOTE" || role === "DE") && (
                <div style={{
                  marginTop: 12, fontSize: 11.5, fontWeight: 700,
                  color: "#7C3AED", background: "#F5F3FF",
                  padding: "3px 12px", borderRadius: 20,
                }}>
                  {ROLE_LABEL[role]}
                </div>
              )}
            </div>
          </div>

          {/* Card habilitations */}
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", padding: "20px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 14 }}>
              Habilitations
            </div>
            {userHabilitations.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "#cbd5e1", fontStyle: "italic" }}>Aucune habilitation</div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {userHabilitations.map(h => (
                  <div
                    key={h.code}
                    title={h.label}
                    style={{
                      padding: "4px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                      color: h.color, background: `${h.color}18`,
                      cursor: "default", border: `1px solid ${h.color}30`,
                    }}
                  >
                    {h.code}
                  </div>
                ))}
              </div>
            )}

            {/* Légende - liste des labels */}
            {userHabilitations.length > 0 && (
              <div style={{ marginTop: 18, borderTop: "1px solid #f1f5f9", paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                {userHabilitations.map(h => (
                  <div key={h.code} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: h.color, minWidth: 32, flexShrink: 0 }}>{h.code}</span>
                    <span style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>{h.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── Colonne droite ── */}
        <div style={{ flex: "1 1 420px", display: "flex", flexDirection: "column", gap: 20 }}>
          <CompteDetails />
          <ChangePassword />
        </div>

      </div>
    </div>
  );
};

export default Compte;
