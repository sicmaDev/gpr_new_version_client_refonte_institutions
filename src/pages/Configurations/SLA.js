import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { HOST } from "../../Utils/globals";
import { loadItemFromSessionStorage } from "../../Utils/utils";
import { notify } from "../../Utils/alert";

// ── Constantes ────────────────────────────────────────────────────────────────

const STATUTS_OUVERTS = ["SAVED", "AFFECTED", "DESAPPROUVED"];

const TYPE_MAP = {
  CLAIM:        { label: "Réclamation",  color: "#EF4444", bg: "#FEF2F2" },
  DENUNCIACION: { label: "Dénonciation", color: "#F59E0B", bg: "#FFFBEB" },
};

const STATUS_LABEL = {
  SAVED:            "À traiter",
  AFFECTED:         "Affectée",
  DESAPPROUVED:     "Désapprouvée",
  TREAT:            "Traitée",
  SATISFIED:        "Satisfait",
  PARTIAL_SATISFIED:"Part. satisfait",
  UNSATISFIED:      "Non satisfait",
  LITIGATION:       "Contentieux",
  CLASSED:          "Classée",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const getToken = () => loadItemFromSessionStorage("token");

/**
 * Parse les formats de date du backend :
 * - ISO : "2026-01-06T14:30:00"
 * - Custom : "06-01-2026 14:30"  (dd-MM-yyyy HH:mm)
 */
const parseDate = (dt) => {
  if (!dt) return null;
  // Format ISO → new Date() gère nativement
  if (dt.includes("T") || dt.match(/^\d{4}-\d{2}-\d{2}/)) {
    const d = new Date(dt);
    return isNaN(d.getTime()) ? null : d;
  }
  // Format "dd-MM-yyyy HH:mm"
  const match = dt.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (match) {
    const [, day, month, year, hour = "00", min = "00"] = match;
    const d = new Date(`${year}-${month}-${day}T${hour}:${min}:00`);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

const calcSla = (receiptDateTime, processingTime) => {
  if (!receiptDateTime || !processingTime) return null;
  const received = parseDate(receiptDateTime);
  if (!received) return null;
  const deadline = new Date(received.getTime() + Number(processingTime) * 86400000);
  const now        = new Date();
  const totalMs    = deadline - received;
  const remainingMs = deadline - now;
  const pct = Math.round((remainingMs / totalMs) * 100);

  if (remainingMs < 0)  return { label: "En retard",        color: "#DC2626", bg: "#FEF2F2", pct: 0,            overdue: true,  days: Math.ceil(-remainingMs / 86400000) };
  if (pct < 25)         return { label: "Critique",         color: "#D97706", bg: "#FFFBEB", pct,               overdue: false, days: Math.ceil(remainingMs / 86400000) };
  return                       { label: "Dans les délais",  color: "#059669", bg: "#ECFDF5", pct: Math.min(pct, 100), overdue: false, days: Math.ceil(remainingMs / 86400000) };
};

const fmtDate = (dt) => {
  if (!dt) return "—";
  const d = dt instanceof Date ? dt : parseDate(dt);
  if (!d) return "—";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
};

// ── Sous-composants ───────────────────────────────────────────────────────────

const KpiCard = ({ label, value, color, bg, icon }) => (
  <div style={{ flex: "1 1 150px", background: bg, borderRadius: 14, padding: "18px 20px", border: `1.5px solid ${color}22` }}>
    <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
      {icon}{label}
    </div>
    <div style={{ fontSize: 30, fontWeight: 800, color }}>{value}</div>
  </div>
);

const SlaBar = ({ pct, color }) => (
  <div style={{ width: "100%", height: 5, background: "#F1F5F9", borderRadius: 99, overflow: "hidden", marginTop: 4 }}>
    <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99 }} />
  </div>
);

const Badge = ({ label, color, bg }) => (
  <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, padding: "2px 9px", borderRadius: 20, whiteSpace: "nowrap" }}>
    {label}
  </span>
);

// ── Page principale ───────────────────────────────────────────────────────────

const ROWS_OPTIONS = [10, 20, 50, 100];

const SLA = () => {
  const [claims, setClaims]         = useState([]);
  const [denuns, setDenuns]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterSla, setFilterSla]   = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [page, setPage]             = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // ── Chargement des données ──
  const fetchData = React.useCallback((silent = false) => {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    };
    if (!silent) setLoading(true);
    Promise.allSettled([
      axios.get(`${HOST}api/v1/claim/list`, { headers }),
      axios.get(`${HOST}api/v1/denunciation/list`, { headers }),
    ])
      .then(([resClaims, resDenuns]) => {
        if (resClaims.status === "fulfilled")
          setClaims(resClaims.value.data?.content || []);
        if (resDenuns.status === "fulfilled")
          setDenuns(resDenuns.value.data?.content || []);
        if (resClaims.status === "rejected" && resDenuns.status === "rejected" && !silent)
          notify("Erreur lors du chargement des dossiers SLA", "error");
      })
      .finally(() => { if (!silent) setLoading(false); });
  }, []);

  useEffect(() => {
    fetchData(false);
    const interval = setInterval(() => fetchData(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── Enrichissement avec SLA ──
  const allItems = useMemo(() => {
    const enriched = (arr, type) =>
      arr
        .filter(i => i.status !== "TEMP_SAVED")
        .map(i => ({
          ...i,
          _type:      type,
          _typeInfo:  TYPE_MAP[type],
          _statusLabel: STATUS_LABEL[i.status] || i.status,
          _sla:       calcSla(i.receiptDateTime, i.objet?.processingTime),
          _deadline:  i.receiptDateTime && i.objet?.processingTime
            ? (() => { const r = parseDate(i.receiptDateTime); return r ? new Date(r.getTime() + Number(i.objet.processingTime) * 86400000) : null; })()
            : null,
        }));
    return [...enriched(claims, "CLAIM"), ...enriched(denuns, "DENUNCIACION")];
  }, [claims, denuns]);

  // ── Filtrage ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allItems.filter(item => {
      if (filterType !== "ALL" && item._type !== filterType) return false;
      if (filterStatus === "OPEN"   && !STATUTS_OUVERTS.includes(item.status)) return false;
      if (filterStatus === "CLOSED" &&  STATUTS_OUVERTS.includes(item.status)) return false;
      if (filterSla === "OVERDUE"  && !item._sla?.overdue) return false;
      if (filterSla === "CRITICAL" && (item._sla?.overdue || (item._sla?.pct ?? 100) >= 25)) return false;
      if (filterSla === "OK"       && (item._sla?.overdue || (item._sla?.pct ?? 100) < 25)) return false;
      if (filterSla === "NONE"     && item._sla !== null) return false;
      if (q) {
        return (
          (item.code || "").toLowerCase().includes(q) ||
          (item.clientFirstAndLastName || "").toLowerCase().includes(q) ||
          (item.objet?.libelle || "").toLowerCase().includes(q) ||
          (item._statusLabel || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allItems, filterType, filterStatus, filterSla, search]);

  // ── Sync badge menu ──
  useEffect(() => {
    const overdue = allItems.filter(i => i._sla?.overdue).length;
    sessionStorage.setItem("sla-overdue", overdue);
    window.dispatchEvent(new CustomEvent("sla-update", { detail: { overdue } }));
  }, [allItems]);

  // ── KPIs ──
  const kpis = useMemo(() => ({
    total:    allItems.length,
    overdue:  allItems.filter(i => i._sla?.overdue).length,
    critical: allItems.filter(i => !i._sla?.overdue && (i._sla?.pct ?? 100) < 25).length,
    ok:       allItems.filter(i => !i._sla?.overdue && (i._sla?.pct ?? 100) >= 25).length,
    noSla:    allItems.filter(i => !i._sla).length,
  }), [allItems]);

  // ── Pagination ──
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const resetPage = () => setPage(0);

  // ── Rendu ──
  return (
    <div style={{ padding: "28px clamp(16px, 4vw, 48px)", maxWidth: 1300, margin: "0 auto" }}>

      {/* En-tête */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Suivi SLA</div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
          Surveillance des délais de traitement ({allItems.length} dossier{allItems.length > 1 ? "s" : ""} chargé{allItems.length > 1 ? "s" : ""})
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
        <KpiCard label="Total" value={kpis.total} color="#0F4C81" bg="#EFF6FF"
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="#0F4C81"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>} />
        <KpiCard label="En retard" value={kpis.overdue} color="#DC2626" bg="#FEF2F2"
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="#DC2626"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>} />
        <KpiCard label="Critique" value={kpis.critical} color="#D97706" bg="#FFFBEB"
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="#D97706"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>} />
        <KpiCard label="Dans les délais" value={kpis.ok} color="#059669" bg="#ECFDF5"
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="#059669"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>} />
        <KpiCard label="Délai non défini" value={kpis.noSla} color="#64748B" bg="#F8FAFC"
          icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="#64748B"><path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/></svg>} />
      </div>

      {/* Filtres */}
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: "16px 20px", marginBottom: 20, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search} onChange={e => { setSearch(e.target.value); resetPage(); }}
          placeholder="Rechercher code, bénéficiaire, objet..."
          style={{ flex: "1 1 220px", padding: "9px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 13, outline: "none", color: "#0F172A", boxShadow: "none" }}
        />
        {[
          { value: filterType,   onChange: e => { setFilterType(e.target.value); resetPage(); },
            options: [["ALL","Tous les types"],["CLAIM","Réclamations"],["DENUNCIACION","Dénonciations"]] },
          { value: filterStatus, onChange: e => { setFilterStatus(e.target.value); resetPage(); },
            options: [["ALL","Tous statuts"],["OPEN","En cours"],["CLOSED","Clôturés"]] },
          { value: filterSla,    onChange: e => { setFilterSla(e.target.value); resetPage(); },
            options: [["ALL","Tous SLA"],["OVERDUE","En retard"],["CRITICAL","Critique"],["OK","Dans les délais"],["NONE","Non défini"]] },
        ].map((sel, i) => (
          <select key={i} value={sel.value} onChange={sel.onChange}
            style={{ padding: "9px 12px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 13, color: "#0F172A", cursor: "pointer", background: "#fff", outline: "none" }}>
            {sel.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: "auto" }}>
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Tableau */}
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 56, textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#94a3b8" }}>Chargement des dossiers...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 56, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
            Aucun dossier ne correspond aux critères
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    {["Code", "Bénéficiaire", "Type", "Statut", "Objet", "Reçu le", "Délai (j)", "Échéance", "Statut SLA"].map(h => (
                      <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "2px solid #E2E8F0", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((item, i) => {
                    const s = item._sla;
                    return (
                      <tr key={item.id ?? i}
                        style={{ borderBottom: "1px solid #F1F5F9", transition: "background 0.12s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "11px 14px", fontSize: 12.5, fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap" }}>
                          {item.codeClient || item.code || "—"}
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 12.5, color: "#334155", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.clientFirstAndLastName || "Anonyme"}
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <Badge label={item._typeInfo?.label || item._type} color={item._typeInfo?.color} bg={item._typeInfo?.bg} />
                        </td>
                        <td style={{ padding: "11px 14px" }}>
                          <span style={{ fontSize: 11.5, color: "#475569", background: "#F1F5F9", padding: "2px 8px", borderRadius: 20 }}>
                            {item._statusLabel}
                          </span>
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 12.5, color: "#475569", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.objet?.libelle || "—"}
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 12, color: "#64748B", whiteSpace: "nowrap" }}>
                          {fmtDate(item.receiptDateTime)}
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: "#334155", textAlign: "center" }}>
                          {item.objet?.processingTime ?? <span style={{ color: "#CBD5E1" }}>—</span>}
                        </td>
                        <td style={{ padding: "11px 14px", fontSize: 12, whiteSpace: "nowrap", color: s?.overdue ? "#DC2626" : "#64748B", fontWeight: s?.overdue ? 700 : 400 }}>
                          {item._deadline ? fmtDate(item._deadline) : "—"}
                        </td>
                        <td style={{ padding: "11px 14px", minWidth: 160 }}>
                          {s ? (
                            <div>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                                <Badge label={s.label} color={s.color} bg={s.bg} />
                                <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                  {s.overdue ? `${s.days}j dépassé` : `${s.days}j restant${s.days > 1 ? "s" : ""}`}
                                </span>
                              </div>
                              <SlaBar pct={s.pct} color={s.color} />
                            </div>
                          ) : (
                            <span style={{ fontSize: 11.5, color: "#CBD5E1" }}>Délai non configuré</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid #F1F5F9", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#64748B" }}>Lignes par page :</span>
                <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); resetPage(); }}
                  style={{ padding: "4px 8px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 12, outline: "none", cursor: "pointer" }}>
                  {ROWS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#64748B" }}>
                  {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, filtered.length)} / {filtered.length}
                </span>
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", background: "#fff", cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.4 : 1, fontSize: 13 }}>
                  ‹
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  style={{ padding: "5px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", background: "#fff", cursor: page >= totalPages - 1 ? "not-allowed" : "pointer", opacity: page >= totalPages - 1 ? 0.4 : 1, fontSize: 13 }}>
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SLA;
