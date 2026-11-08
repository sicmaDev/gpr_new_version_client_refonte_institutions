import React, { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import { carteRapportApi } from "../../../apis/Rapports/CarteApi";
import { SENS } from "./couleursRapport";
import { alpha, fmt } from "./graphiquesRapport";
import { FOND_BENIN } from "./fondCarteBenin";
import { ChargementRond } from "../../../components/shared/ChargementRond";
import { LinearProgress } from "@mui/material";

// Cartographie des plaintes par agence (seul élément nouveau du rapport Global).
// - Données : /api/v1/report/carte, avec le même filtre que le rapport ; le serveur applique le périmètre du rôle.
// - Fond : tuiles dont l'adresse vient de la configuration serveur (OpenStreetMap en phase pilote), sans bibliothèque.
// - Fond indisponible : message et classement des agences, jamais une zone vide.
// - Export PDF / Word : chartRef.toBase64Image() dessine la carte (ou le classement) dans une image.
export const SEUILS_HORS_DELAI = [15, 30]; // seule constante des seuils : vert < 15 %, orange 15–30 %, rouge > 30 %
export const couleurHorsDelai = (p) => (p == null ? "#94A3B8" : p < SEUILS_HORS_DELAI[0] ? SENS.vert : p <= SEUILS_HORS_DELAI[1] ? SENS.orange : SENS.rouge);

const POLICE = "'Segoe UI', system-ui, -apple-system, sans-serif";
const TUILE = 256, HAUTEUR = 640;
const mx = (lon, z) => ((lon + 180) / 360) * TUILE * 2 ** z;
const my = (lat, z) => { const s = Math.sin((lat * Math.PI) / 180); return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * TUILE * 2 ** z; };
const volume = (a) => a.reclamations + a.denonciations + a.suggestions;
const localisee = (a) => a.latitude != null && a.longitude != null;

const styles = {
  zone: { position: "relative", width: "100%", height: HAUTEUR, overflow: "hidden", borderRadius: 8, background: "#E5E7EB", cursor: "grab", touchAction: "none", userSelect: "none" },
  bouton: { width: 30, height: 30, borderRadius: 6, border: "1px solid #CBD5E1", background: "#fff", color: "#334155", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,.12)" },
  attribution: { position: "absolute", right: 0, bottom: 0, background: "rgba(255,255,255,.85)", fontSize: 10.5, color: "#475569", padding: "2px 6px", borderTopLeftRadius: 6 },
  encadre: { background: "#FFFFFF", border: "1px solid #E2E8F0", borderLeft: "3px solid " + SENS.orange, borderRadius: 8, color: "#1E293B", fontSize: 12.5, lineHeight: 1.6, padding: "12px 14px" },
  bulle: { position: "absolute", zIndex: 5, background: "#1E293B", color: "#fff", borderRadius: 6, padding: "10px 12px", fontSize: 11.5, minWidth: 230, pointerEvents: "none", boxShadow: "0 6px 18px rgba(0,0,0,.25)" },
};

function Bulle({ a, x, y }) {
  const ph = a.horsDelaiPct, ligne = (l, v, sep, couleur) => (
    <tr><td style={{ padding: "2px 0", borderTop: sep ? "1px solid #334155" : "none", paddingTop: sep ? 5 : 2 }}>{l}</td>
      <td style={{ textAlign: "right", fontWeight: 600, borderTop: sep ? "1px solid #334155" : "none", paddingTop: sep ? 5 : 2, color: couleur }}>{v}</td></tr>);
  return (
    <div style={{ ...styles.bulle, left: x + 14, top: y + 10 }}>
      <b style={{ fontSize: 12.5 }}>{a.libelle}</b>
      <span style={{ display: "block", color: "#94A3B8", fontSize: 10.5, marginBottom: 6 }}>{[a.ville, a.quartier].filter(Boolean).join(", ")}</span>
      <table style={{ width: "100%", borderCollapse: "collapse" }}><tbody>
        {ligne("Réclamations", a.reclamations)}{ligne("Dénonciations", a.denonciations)}{ligne("Suggestions", a.suggestions)}
        {ligne("Traitées (réc. + dén.)", a.reclamationsTraitees + a.denonciationsTraitees, true)}
        {ligne("Non traitées (réc. + dén.)", a.reclamationsNonTraitees + a.denonciationsNonTraitees)}
        {ligne("Traitées hors délai", ph == null ? "n.d." : fmt(ph, true), false, couleurHorsDelai(ph))}
        {ligne("Satisfaction (réclamations)", a.satisfactionPct == null ? "n.d." : fmt(a.satisfactionPct, true), true)}
      </tbody></table>
    </div>
  );
}

// Cadre de la carte, même aspect que les cartes de graphique (PBICard) du rapport. Il est défini ici, au niveau du
// module : PBICard est recréé à chaque rendu de la page, ce qui remonterait la carte (et relancerait son chargement).
// onClose : croix ✕ du mode édition du modèle de rapport, comme PBICard.
export function CadreCarte({ titre, accent, onClose, loading = false, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #E9ECF1", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", overflow: "hidden", marginBottom: 16, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: `3px solid ${accent}`, background: "#FAFBFC" }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", letterSpacing: "0.2px", textTransform: "uppercase" }}>{titre}</span>
        {onClose && <span onClick={onClose} style={{ cursor: "pointer", fontSize: 14, color: "#9CA3AF", lineHeight: 1 }}>✕</span>}
      </div>
      {loading ? (
        <LinearProgress
          sx={{
            height: 3,
            backgroundColor: "#E2E8F0",
            "& .MuiLinearProgress-bar": {
              backgroundColor: accent || "#0F4C81",
            },
          }}
        />
      ) : (
        <div style={{ height: 3 }} />
      )}
      <div style={{ padding: "16px 18px 12px", flex: 1 }}>{children}</div>
    </div>
  );
}

export function CarteRapport({ filtres, version, paysCode, chartRef, visible = true }) {
  const [etat, setEtat] = useState({ chargement: true, erreur: false, agences: [], tuilesUrl: null, attribution: "© contributeurs OpenStreetMap" });
  const [echecFond, setEchecFond] = useState(false);
  const [vue, setVue] = useState(null);
  const [bulle, setBulle] = useState(null);
  const zoneRef = useRef(null), glisse = useRef(null), tuilesChargees = useRef({ ok: 0, ko: 0 });

  // Chargement : à chaque nouveau rapport (version) avec le même filtre que lui.
  useEffect(() => {
    let actif = true;
    setEtat((e) => ({ ...e, chargement: true, erreur: false }));
    carteRapportApi(filtres)
      .then((r) => { if (actif) setEtat({ chargement: false, erreur: !r || !Array.isArray(r.agences), agences: r?.agences || [], tuilesUrl: r?.tuilesUrl, attribution: r?.attribution || "© contributeurs OpenStreetMap" }); })
      .catch(() => { if (actif) setEtat((e) => ({ ...e, chargement: false, erreur: true, agences: [] })); });
    return () => { actif = false; };
  }, [filtres, version]);

  const agences = etat.agences, loc = useMemo(() => agences.filter(localisee), [agences]);
  const nonLoc = useMemo(() => agences.filter((a) => !localisee(a)), [agences]);
  const classement = useMemo(() => agences.slice().sort((a, b) => volume(b) - volume(a)), [agences]);
  const departements = paysCode === FOND_BENIN.pays ? FOND_BENIN.departements : [];
  const maxVol = Math.max(1, ...loc.map(volume)), rayon = (v) => 6 + 20 * Math.sqrt(v / maxVol);

  // Cadrage automatique sur les agences localisées de l'institution, quel que soit le pays.
  const cadrer = useCallback(() => {
    const el = zoneRef.current; if (!el || !loc.length) return;
    const W = el.clientWidth, H = el.clientHeight, marge = 70;
    const B = { minLon: Math.min(...loc.map((a) => a.longitude)), maxLon: Math.max(...loc.map((a) => a.longitude)), minLat: Math.min(...loc.map((a) => a.latitude)), maxLat: Math.max(...loc.map((a) => a.latitude)) };
    let z = 13; while (z > 3 && (mx(B.maxLon, z) - mx(B.minLon, z) > W - 2 * marge || my(B.minLat, z) - my(B.maxLat, z) > H - 2 * marge)) z--;
    setVue({ z, cx: (mx(B.minLon, z) + mx(B.maxLon, z)) / 2, cy: (my(B.minLat, z) + my(B.maxLat, z)) / 2 });
  }, [loc]);
  // Recadrage quand la carte devient visible (elle reste montée, masquée, sur les autres onglets).
  useLayoutEffect(() => { if (visible) cadrer(); }, [cadrer, visible]);
  useEffect(() => { tuilesChargees.current = { ok: 0, ko: 0 }; setEchecFond(false); }, [etat.tuilesUrl]);

  const W = zoneRef.current?.clientWidth || 600;
  const tuiles = [];
  if (vue && etat.tuilesUrl && !echecFond) {
    const n = 2 ** vue.z, ox = vue.cx - W / 2, oy = vue.cy - HAUTEUR / 2;
    for (let x = Math.floor(ox / TUILE); x <= Math.floor((ox + W) / TUILE); x++) {
      for (let y = Math.max(0, Math.floor(oy / TUILE)); y <= Math.min(n - 1, Math.floor((oy + HAUTEUR) / TUILE)); y++) {
        tuiles.push({ cle: `${vue.z}/${x}/${y}`, x, y, src: etat.tuilesUrl.replace("{z}", vue.z).replace("{x}", ((x % n) + n) % n).replace("{y}", y) });
      }
    }
  }
  const ox = vue ? vue.cx - W / 2 : 0, oy = vue ? vue.cy - HAUTEUR / 2 : 0;

  const zoomer = (dz) => setVue((v) => { if (!v) return v; const z = Math.min(16, Math.max(3, v.z + dz)); const f = 2 ** (z - v.z); return { z, cx: v.cx * f, cy: v.cy * f }; });
  const debut = (e) => { if (e.target.closest("button, a")) return; glisse.current = { x: e.clientX, y: e.clientY }; setBulle(null); };
  const deplacer = (e) => { if (!glisse.current) return; const dx = e.clientX - glisse.current.x, dy = e.clientY - glisse.current.y; glisse.current = { x: e.clientX, y: e.clientY }; setVue((v) => v && { ...v, cx: v.cx - dx, cy: v.cy - dy }); };
  const fin = () => { glisse.current = null; };
  const surTuile = (ok) => { const t = tuilesChargees.current; ok ? t.ok++ : t.ko++; if (!t.ok && t.ko >= 2) setEchecFond(true); };

  // Image pour les exports : la carte telle qu'affichée (tuiles chargées, départements, points, légende),
  // ou le classement si le fond n'a pas chargé. Les tuiles sont chargées en « anonymous » pour pouvoir être copiées.
  useImperativeHandle(chartRef, () => ({
    destroy: () => {},
    toBase64Image: () => {
      const cv = document.createElement("canvas"), w = zoneRef.current?.clientWidth || 900, h = HAUTEUR, lh = 54;
      const parClassement = echecFond || !vue || !loc.length;
      cv.width = w; cv.height = parClassement ? 70 + classement.length * 22 : h + lh;
      const ctx = cv.getContext("2d"); ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, cv.width, cv.height); ctx.textBaseline = "middle";
      if (parClassement) {
        ctx.fillStyle = "#92400E"; ctx.font = `12px ${POLICE}`; ctx.fillText("Fond de carte indisponible lors de l'export : classement des agences.", 12, 18);
        ctx.fillStyle = "#64748B"; ctx.font = `600 11px ${POLICE}`; ctx.fillText("Agence", 32, 46); ctx.textAlign = "right"; ctx.fillText("Volume", w - 140, 46); ctx.fillText("% hors délai", w - 12, 46);
        classement.forEach((a, i) => { const y = 70 + i * 22; ctx.textAlign = "left"; ctx.fillStyle = couleurHorsDelai(a.horsDelaiPct); ctx.beginPath(); ctx.arc(18, y, 5, 0, 7); ctx.fill();
          ctx.fillStyle = "#374151"; ctx.font = `12px ${POLICE}`; ctx.fillText(a.libelle, 32, y); ctx.textAlign = "right"; ctx.fillText(String(volume(a)), w - 140, y); ctx.fillText(a.horsDelaiPct == null ? "n.d." : fmt(a.horsDelaiPct, true), w - 12, y); });
        return cv.toDataURL("image/png");
      }
      ctx.fillStyle = "#E5E7EB"; ctx.fillRect(0, 0, w, h);
      zoneRef.current.querySelectorAll("img[data-x]").forEach((img) => { if (img.complete && img.naturalWidth) ctx.drawImage(img, img.dataset.x * TUILE - ox, img.dataset.y * TUILE - oy, TUILE, TUILE); });
      const P = (lon, lat) => [mx(lon, vue.z) - ox, my(lat, vue.z) - oy];
      ctx.strokeStyle = "rgba(71,85,105,.6)"; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]);
      departements.forEach((d) => d.anneaux.forEach((r) => { ctx.beginPath(); r.forEach(([lon, lat], i) => { const [x, y] = P(lon, lat); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.stroke(); }));
      ctx.setLineDash([]);
      loc.slice().sort((a, b) => volume(b) - volume(a)).forEach((a) => { const [x, y] = P(a.longitude, a.latitude), c = couleurHorsDelai(a.horsDelaiPct);
        ctx.beginPath(); ctx.arc(x, y, rayon(volume(a)), 0, 7); ctx.fillStyle = alpha(c, 0.8); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = "#FFFFFF"; ctx.stroke(); });
      ctx.font = `10.5px ${POLICE}`; const aw = ctx.measureText(etat.attribution).width + 12;
      ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.fillRect(w - aw, h - 18, aw, 18); ctx.fillStyle = "#475569"; ctx.textAlign = "right"; ctx.fillText(etat.attribution, w - 6, h - 9);
      ctx.textAlign = "left"; ctx.fillStyle = "#374151"; ctx.font = `11.5px ${POLICE}`;
      ctx.fillText("Taille : volume total (réclamations + dénonciations + suggestions)", 8, h + 16);
      const texte = "Couleur : part traitée hors délai (réclamations + dénonciations)"; ctx.fillText(texte, 8, h + 38); let x = 8 + ctx.measureText(texte).width + 14;
      [[SENS.vert, `< ${SEUILS_HORS_DELAI[0]} %`], [SENS.orange, `${SEUILS_HORS_DELAI[0]}–${SEUILS_HORS_DELAI[1]} %`], [SENS.rouge, `> ${SEUILS_HORS_DELAI[1]} %`]].forEach(([c, t]) => {
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 5, h + 38, 5, 0, 7); ctx.fill(); ctx.fillStyle = "#374151"; ctx.fillText(t, x + 14, h + 38); x += ctx.measureText(t).width + 30; });
      return cv.toDataURL("image/png");
    },
  }), [echecFond, vue, loc, classement, departements, etat.attribution, ox, oy, W, maxVol]);

  if (etat.chargement && !agences.length) return <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}><ChargementRond taille={36} /></div>;
  if (etat.erreur) return <div style={styles.encadre}><b style={{ color: SENS.orange }}>La carte n'a pas pu être chargée.</b> Les graphiques du rapport ne sont pas concernés.</div>;
  if (!agences.length) return <div style={{ ...styles.encadre, borderLeftColor: "#CBD5E1" }}>Aucune agence ne correspond aux critères du rapport.</div>;

  return (
    <div onPointerMove={deplacer} onPointerUp={fin} onPointerLeave={fin}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 52%", minWidth: 300, position: "relative" }}>
          {echecFond || !loc.length ? (
            <div style={styles.encadre}>
              {!loc.length ? <><b style={{ color: SENS.orange }}>Aucune agence n'est encore localisée.</b><br />Renseignez la latitude et la longitude dans Configurations, Points de service.</>
                : <><b style={{ color: SENS.orange }}>Le fond de carte n'a pas pu être chargé</b> (pas de connexion Internet ou serveur de cartes indisponible).<br />Les chiffres de chaque agence restent consultables dans le classement ci-contre.</>}
            </div>
          ) : (
            <div ref={zoneRef} style={{ ...styles.zone, cursor: glisse.current ? "grabbing" : "grab" }} onPointerDown={debut}>
              <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${-ox}px, ${-oy}px)` }}>
                {tuiles.map((t) => <img key={t.cle} data-x={t.x} data-y={t.y} src={t.src} alt="" draggable={false} crossOrigin="anonymous"
                  onLoad={() => surTuile(true)} onError={() => surTuile(false)} style={{ position: "absolute", left: t.x * TUILE, top: t.y * TUILE, width: TUILE, height: TUILE, maxWidth: "none" }} />)}
              </div>
              {vue && (
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
                  <g transform={`translate(${-ox} ${-oy})`}>
                    {departements.map((d) => <path key={d.iso} d={d.anneaux.map((r) => "M" + r.map(([lon, lat]) => mx(lon, vue.z).toFixed(1) + "," + my(lat, vue.z).toFixed(1)).join("L") + "Z").join("")}
                      style={{ fill: "rgba(17,141,255,.04)", stroke: "#475569", strokeOpacity: 0.6, strokeWidth: 1.2, strokeDasharray: "4 3" }}><title>{d.nom}</title></path>)}
                    {loc.slice().sort((a, b) => volume(b) - volume(a)).map((a) => { const c = couleurHorsDelai(a.horsDelaiPct); return (
                      <circle key={a.id} cx={mx(a.longitude, vue.z)} cy={my(a.latitude, vue.z)} r={rayon(volume(a))} fill={alpha(c, 0.8)} stroke="#FFFFFF" strokeWidth={2} style={{ cursor: "pointer" }}
                        onMouseMove={(e) => { if (glisse.current) return; const b = zoneRef.current.getBoundingClientRect(); setBulle({ a, x: e.clientX - b.left, y: e.clientY - b.top }); }}
                        onMouseLeave={() => setBulle(null)} />); })}
                  </g>
                </svg>
              )}
              <div style={{ position: "absolute", top: 10, right: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                <button type="button" style={styles.bouton} title="Zoomer" onClick={() => zoomer(1)}>+</button>
                <button type="button" style={styles.bouton} title="Dézoomer" onClick={() => zoomer(-1)}>−</button>
                <button type="button" style={styles.bouton} title="Recentrer sur les agences" onClick={cadrer}>⌂</button>
              </div>
              <div style={styles.attribution}>{etat.attribution.includes("OpenStreetMap")
                ? <>{etat.attribution.split("OpenStreetMap")[0]}<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>{etat.attribution.split("OpenStreetMap")[1]}</>
                : etat.attribution}</div>
              {bulle && <Bulle {...bulle} />}
            </div>
          )}
        </div>
        <div style={{ flex: "1 1 300px", fontSize: 12, maxHeight: HAUTEUR, overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1.5px solid #E2E8F0", fontSize: 10.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.4 }}>
            <span style={{ width: 10 }} /><span style={{ flex: 1 }}>Agence</span><span style={{ width: 52, textAlign: "right" }}>Volume</span><span style={{ width: 90, textAlign: "right" }}>% hors délai</span>
          </div>
          {classement.map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid #F1F5F9" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: couleurHorsDelai(a.horsDelaiPct) }} />
              <span style={{ flex: 1, color: "#374151" }}>{a.libelle}{!localisee(a) && <i style={{ fontSize: 10, color: "#B45309", fontStyle: "normal" }}> non localisée</i>}</span>
              <span style={{ width: 52, textAlign: "right", fontWeight: 700, color: "#0F172A" }}>{volume(a)}</span>
              <span style={{ width: 90, textAlign: "right", color: "#64748B" }}>{a.horsDelaiPct == null ? "n.d." : fmt(a.horsDelaiPct, true)}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: "10px 0 6px", fontSize: 11.5, color: "#475569", display: "flex", flexDirection: "column", gap: 6 }}>
        <div><b>Taille</b> : volume total (réclamations + dénonciations + suggestions)</div>
        <div><b>Couleur</b> : part traitée hors délai (réclamations + dénonciations)
          {[[SENS.vert, `< ${SEUILS_HORS_DELAI[0]} %`], [SENS.orange, `${SEUILS_HORS_DELAI[0]}–${SEUILS_HORS_DELAI[1]} %`], [SENS.rouge, `> ${SEUILS_HORS_DELAI[1]} %`]].map(([c, t]) => (
            <span key={t} style={{ marginLeft: 12, whiteSpace: "nowrap" }}><i style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", marginRight: 5, verticalAlign: -1, background: c }} />{t}</span>))}
        </div>
      </div>
      {nonLoc.length > 0 && (
        <div style={{ ...styles.encadre, fontSize: 11.5, padding: "8px 12px" }}>
          <b style={{ color: SENS.orange }}>{nonLoc.length} {nonLoc.length > 1 ? "agences non localisées" : "agence non localisée"}</b> : {nonLoc.map((a) => a.libelle).join(", ")}.{" "}
          <span style={{ color: "#64748B" }}>Coordonnées à renseigner dans Configurations, Points de service.</span>
        </div>
      )}
    </div>
  );
}
