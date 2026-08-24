import React from "react";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import { LoadingButton } from "@mui/lab";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CheckCircleIcon    from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SaveOutlinedIcon   from "@mui/icons-material/SaveOutlined";
import ArrowForwardIcon   from "@mui/icons-material/ArrowForward";
import ArrowBackIcon      from "@mui/icons-material/ArrowBack";
import SendIcon           from "@mui/icons-material/Send";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import FolderCopyOutlinedIcon from "@mui/icons-material/FolderCopyOutlined";
import ChevronRightIcon   from "@mui/icons-material/ChevronRight";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

/**
 * Wizard multi-step form layout.
 *
 * Props:
 *   title, subtitle        - page header text
 *   onBack                 - back button handler
 *   hasDraft               - boolean - shows "Brouillon en cours" badge
 *   draftCount             - number of saved drafts
 *   activeTab              - "new" | "drafts"
 *   onTabChange            - (tab) => void
 *   steps                  - [{ key, label, sublabel, icon: ReactNode }]
 *   currentStep            - 0-based index
 *   completionPercent      - 0-100, drives the progress bar
 *   apercu                 - { [label]: value } object for live preview
 *   onSaveDraft            - () => void
 *   onNext                 - () => void
 *   onPrev                 - () => void
 *   isLastStep             - boolean
 *   onSubmit               - () => void
 *   loadingSave            - boolean
 *   loadingSubmit          - boolean
 *   children               - current step content
 *   draftsContent          - JSX shown in "Brouillons" tab
 */
const WizardLayout = ({
  title = "Dossier",
  subtitle = "",
  onBack,
  hasDraft = false,
  draftCount = 0,
  activeTab = "new",
  onTabChange,
  steps = [],
  currentStep = 0,
  completionPercent,
  apercu = {},
  onSaveDraft,
  onNext,
  onPrev,
  isLastStep = false,
  onSubmit,
  loadingSave = false,
  loadingSubmit = false,
  children,
  draftsContent,
}) => {
  const step = steps[currentStep] ?? {};
  const pct  = completionPercent ?? Math.round((currentStep / Math.max(steps.length - 1, 1)) * 100);

  const TABS = [
    { key: "new",    label: "Nouveau dossier", Icon: NoteAddOutlinedIcon },
    { key: "drafts", label: "Brouillons",       Icon: FolderCopyOutlinedIcon, count: draftCount },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>

      {/* ── Top header ────────────────────────────────────────── */}
      <div style={{
        background: "white", borderBottom: "1px solid #e5e7eb",
        padding: "14px 24px", display: "flex", alignItems: "center", gap: 12,
        flexShrink: 0,
      }}>
        <IconButton size="small" onClick={onBack} sx={{ color: "#374151", mr: 0.5 }}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>{subtitle}</div>}
        </div>
        {hasDraft && (
          <span style={{
            fontSize: 11, fontWeight: 600, color: "#d97706",
            background: "#fef3c7", border: "1px solid #fde68a",
            borderRadius: 20, padding: "4px 12px",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
            Brouillon en cours
          </span>
        )}
      </div>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "0 24px" }}>
        <div style={{ display: "flex" }}>
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange?.(tab.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "12px 18px", border: "none", background: "transparent",
                  cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? "#005081" : "#64748b",
                  borderBottom: active ? "2px solid #005081" : "2px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <tab.Icon style={{ fontSize: 17, opacity: active ? 1 : 0.6 }} />
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    background: active ? "#c5e4f3" : "#f1f5f9",
                    color: active ? "#004068" : "#64748b",
                    borderRadius: 20, padding: "1px 7px",
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────── */}
      {activeTab === "drafts" ? (
        <div style={{ flex: 1, padding: 24 }}>
          {draftsContent ?? (
            <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
              <FolderCopyOutlinedIcon style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>Aucun brouillon</div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "280px 1fr", gap: 0, overflow: "hidden" }}>

          {/* ── LEFT SIDEBAR ─── */}
          <div style={{
            background: "white", borderRight: "1px solid #e5e7eb",
            padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20,
            overflowY: "auto",
          }}>

            {/* Progression label + progress bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.2px", color: "#94a3b8", textTransform: "uppercase" }}>
                  Progression
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700,
                  color: pct === 100 ? "#16a34a" : "#005081",
                }}>
                  {pct}%
                </div>
              </div>
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                  borderRadius: 4, height: 6, marginBottom: "12px",
                  backgroundColor: "#e5e7eb",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    background: pct >= 100
                      ? "linear-gradient(90deg, #16a34a, #22c55e)"
                      : "linear-gradient(90deg, #005081, #0073b7)",
                    transition: "background 0.3s",
                  },
                }}
              />

              {/* Steps list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {steps.map((s, i) => {
                  const done   = i < currentStep;
                  const active = i === currentStep;
                  const locked = i > currentStep;
                  return (
                    <div
                      key={s.key}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", borderRadius: 12,
                        background: active ? "#e8f4fc" : "transparent",
                        border: active ? "1.5px solid #99cde8" : "1.5px solid transparent",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: done ? "#dcfce7" : active ? "#005081" : "#f1f5f9",
                      }}>
                        {done
                          ? <CheckCircleIcon style={{ fontSize: 18, color: "#16a34a" }} />
                          : active
                            ? React.cloneElement(s.icon ?? <AssignmentOutlinedIcon />, { style: { fontSize: 18, color: "white" } })
                            : React.cloneElement(s.icon ?? <RadioButtonUncheckedIcon />, { style: { fontSize: 17, color: "#cbd5e1" } })
                        }
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                          fontSize: 13, fontWeight: active ? 700 : done ? 600 : 500,
                          color: active ? "#004068" : done ? "#166534" : locked ? "#94a3b8" : "#374151",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {s.label}
                        </div>
                        {s.sublabel && (
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                            {s.sublabel}
                          </div>
                        )}
                      </div>
                      {active && (
                        <ChevronRightIcon style={{ fontSize: 16, color: "#005081", flexShrink: 0 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Aperçu live */}
            {Object.keys(apercu).length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.2px", color: "#94a3b8", textTransform: "uppercase", marginBottom: 10 }}>
                  Aperçu
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {Object.entries(apercu).filter(([, v]) => v).map(([label, value]) => (
                    <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", marginTop: 2, minWidth: 60 }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", wordBreak: "break-word" }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Step content ─── */}
          <div style={{ display: "flex", flexDirection: "column", overflowY: "auto" }}>

            {/* Step header card */}
            <div style={{ padding: "24px 28px 0" }}>
              <div style={{
                background: "white", borderRadius: 16, padding: "16px 22px",
                border: "1px solid #e5e7eb", marginBottom: 20,
                display: "flex", alignItems: "center", gap: 14,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: "linear-gradient(135deg, #e8f4fc, #c5e4f3)",
                  border: "1.5px solid #99cde8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {step.icon
                    ? React.cloneElement(step.icon, { style: { fontSize: 22, color: "#005081" } })
                    : <AssignmentOutlinedIcon style={{ fontSize: 22, color: "#005081" }} />
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{step.label}</div>
                  {step.sublabel && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{step.sublabel}</div>}
                </div>
                <div style={{
                  fontSize: 11, color: "#64748b", background: "#f1f5f9",
                  borderRadius: 20, padding: "3px 10px", fontWeight: 600,
                }}>
                  {currentStep + 1} / {steps.length}
                </div>
              </div>
            </div>

            {/* Step form content */}
            <div style={{ flex: 1, padding: "0 28px 24px" }}>
              <style>{`
                .wz-content label { font-weight: 600; color: #374151; }
                .wz-content .react-select__placeholder { color: #9ca3af; font-weight: 400; }
                .wz-content .react-select__single-value { font-weight: 600; }
                .wz-content textarea, .wz-content input[type="text"],
                .wz-content input[type="email"] { font-weight: 500; }
              `}</style>
              <div className="wz-content" style={{
                background: "white", borderRadius: 16, padding: "24px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                minHeight: 300,
              }}>
                {children}
              </div>
            </div>

            {/* ── Footer actions ── */}
            <div style={{
              background: "white", borderTop: "1px solid #e5e7eb",
              padding: "20px 32px", display: "flex", alignItems: "center",
              gap: 12, flexShrink: 0,
            }}>
              <LoadingButton
                onClick={onSaveDraft}
                loading={loadingSave}
                loadingPosition="start"
                startIcon={<SaveOutlinedIcon />}
                variant="outlined"
                sx={{
                  textTransform: "initial", borderRadius: 2.5, fontSize: 13,
                  borderColor: "#e5e7eb", color: "#374151",
                  "&:hover": { borderColor: "#94a3b8", background: "#f8fafc" },
                }}
              >
                Sauvegarder brouillon
              </LoadingButton>

              <div style={{ flex: 1 }} />

              {currentStep > 0 && (
                <button
                  onClick={onPrev}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "9px 18px", borderRadius: 10,
                    border: "1.5px solid #e5e7eb", background: "white",
                    color: "#374151", fontSize: 13, fontWeight: 500, cursor: "pointer",
                  }}
                >
                  <ArrowBackIcon style={{ fontSize: 16 }} />
                  Précédent
                </button>
              )}

              {isLastStep ? (
                <LoadingButton
                  onClick={onSubmit}
                  loading={loadingSubmit}
                  loadingPosition="end"
                  endIcon={<SendIcon />}
                  variant="contained"
                  sx={{
                    textTransform: "initial", borderRadius: 2.5, fontSize: 13, fontWeight: 700,
                    background: "linear-gradient(135deg, #005081, #004068)",
                    color: "white !important",
                    "& .MuiLoadingButton-loadingIndicator": { color: "white" },
                    boxShadow: "0 2px 8px rgba(0,80,129,0.3)", px: 3,
                    "&:hover": { background: "linear-gradient(135deg, #004068, #003a5c)", color: "white" },
                    "&.Mui-disabled": { background: "linear-gradient(135deg, #005081, #004068)", opacity: 0.7, color: "white !important" },
                  }}
                >
                  Soumettre le dossier
                </LoadingButton>
              ) : (
                <button
                  onClick={onNext}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "9px 22px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, #005081, #004068)",
                    color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,80,129,0.25)",
                  }}
                >
                  Suivant
                  <ArrowForwardIcon style={{ fontSize: 16 }} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WizardLayout;
