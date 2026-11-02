import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { fmt, texteSur } from "./graphiquesRapport";

// Carte de chaleur « par objet et par agence » : mêmes données que les barres empilées (une ligne par agence,
// une colonne par objet, % de l'agence), dessinées dans un canvas. chartRef expose toBase64Image() comme un
// graphique Chart.js, pour que les exports PDF / Word l'intègrent sans changement.
const POLICE = "'Segoe UI', system-ui, -apple-system, sans-serif";
const nombre = (v) => { const n = typeof v === "number" ? v : parseFloat(v); return Number.isFinite(n) ? n : 0; };
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));


export function CarteChaleur({ data, couleur, chartRef }) {
  const canvasRef = useRef(null), boiteRef = useRef(null);
  const [bulle, setBulle] = useState(null);
  const grilleRef = useRef(null);

  useImperativeHandle(chartRef, () => ({
    toBase64Image: () => (canvasRef.current ? canvasRef.current.toDataURL("image/png") : ""),
    destroy: () => {},
  }));

  useEffect(() => {
    const canvas = canvasRef.current, boite = boiteRef.current; if (!canvas || !boite) return;
    const cols = (data?.datasets || []).filter((s) => (s.data || []).some((v) => nombre(v) > 0));
    const lignes = (data?.labels || []).map((n, a) => ({ n, a })).filter((r) => cols.some((s) => nombre(s.data[r.a]) > 0));
    const W = boite.clientWidth, H = boite.clientHeight, dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + "px"; canvas.style.height = H + "px";
    const ctx = canvas.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, W, H); // fond blanc dans l'image exportée
    if (!cols.length || !lignes.length) { grilleRef.current = null; return; }
    ctx.font = `11px ${POLICE}`;
    const gauche = Math.ceil(Math.max(...lignes.map((r) => ctx.measureText(r.n).width))) + 18, haut = 128, bas = 46, droite = 6;
    const cw = (W - gauche - droite) / cols.length, ch = (H - haut - bas) / lignes.length;
    const max = Math.max(...cols.flatMap((s) => s.data.map(nombre))), fond = [248, 250, 252], acc = rgb(couleur);
    const teinte = (v) => { const t = v > 0 ? 0.08 + 0.92 * Math.pow(v / max, 0.85) : 0; return fond.map((b, k) => Math.round(b + (acc[k] - b) * t)); };
    const css = (c) => `rgb(${c.join(",")})`;
    const rect = (x, y, w, h, r) => { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); };
    cols.forEach((s, j) => { // en-têtes inclinés
      ctx.save(); ctx.translate(gauche + j * cw + cw / 2, haut - 8); ctx.rotate(-Math.PI / 4);
      ctx.fillStyle = "#374151"; ctx.font = `11px ${POLICE}`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(s.label, 4, 0); ctx.restore();
    });
    lignes.forEach((r, i) => {
      const y = haut + i * ch;
      ctx.fillStyle = "#374151"; ctx.font = `11px ${POLICE}`; ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.fillText(r.n, gauche - 10, y + ch / 2);
      cols.forEach((s, j) => {
        const v = nombre(s.data[r.a]), c = teinte(v), x = gauche + j * cw;
        ctx.fillStyle = v > 0 ? css(c) : "#FFFFFF"; rect(x + 1.5, y + 1.5, cw - 3, ch - 3, 4); ctx.fill();
        if (v > 0 && cw > 30) { ctx.fillStyle = texteSur(css(c)); ctx.font = `600 10.5px ${POLICE}`; ctx.textAlign = "center"; ctx.fillText(Math.round(v) + " %", x + cw / 2, y + ch / 2); }
      });
    });
    const gy = H - 24, g = ctx.createLinearGradient(gauche, 0, gauche + 220, 0); // échelle
    g.addColorStop(0, css(teinte(max * 0.001))); g.addColorStop(1, couleur); ctx.fillStyle = g; rect(gauche, gy, 220, 10, 5); ctx.fill();
    ctx.fillStyle = "#6B7280"; ctx.font = `10.5px ${POLICE}`; ctx.textAlign = "right"; ctx.fillText("0 %", gauche - 6, gy + 5);
    ctx.textAlign = "left"; ctx.fillText(fmt(max, true) + "   part de l'objet dans les plaintes de l'agence", gauche + 228, gy + 5);
    grilleRef.current = { cols, lignes, gauche, haut, cw, ch };
  }, [data, couleur]);

  const survol = (e) => {
    const gr = grilleRef.current; if (!gr) return setBulle(null);
    const b = canvasRef.current.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    const j = Math.floor((x - gr.gauche) / gr.cw), i = Math.floor((y - gr.haut) / gr.ch);
    if (j < 0 || i < 0 || j >= gr.cols.length || i >= gr.lignes.length) return setBulle(null);
    setBulle({ x, y, agence: gr.lignes[i].n, objet: gr.cols[j].label, v: gr.cols[j].data[gr.lignes[i].a] });
  };

  return (
    <div ref={boiteRef} style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas ref={canvasRef} onMouseMove={survol} onMouseLeave={() => setBulle(null)} style={{ display: "block" }} />
      {bulle && (
        <div style={{ position: "absolute", left: bulle.x + 14, top: bulle.y + 10, background: "#1E293B", color: "#fff", borderRadius: 6, padding: "8px 10px", fontSize: 11.5, pointerEvents: "none", whiteSpace: "nowrap", zIndex: 5 }}>
          <b>{bulle.agence}</b><br />{bulle.objet} : {fmt(bulle.v, true)}
        </div>
      )}
    </div>
  );
}
