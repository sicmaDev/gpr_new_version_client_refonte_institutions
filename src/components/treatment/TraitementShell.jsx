import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import BoltIcon from "@mui/icons-material/Bolt";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import GroupsIcon from "@mui/icons-material/Groups";
import EditNoteIcon from "@mui/icons-material/EditNote";

import SidebarInfosClient from "./SidebarInfosClient";
import SidebarDetailsDossier from "./SidebarDetailsDossier";
import ActionsDisponibles from "./ActionsDisponibles";
import FichiersTab from "./FichiersTab";
import HistoriqueTimeline from "./HistoriqueTimeline";
import PreEnregistreesTab from "./PreEnregistreesTab";
import SessionChat from "./SessionChat";

import AffecterModal from "../../pages/Reclamations/modals/AffecterModal";
import ConvertirModal from "../../pages/Reclamations/modals/ConvertirModal";
import TransmettreModal from "../../pages/Reclamations/modals/TransmettreModal";
import ApprouverModal from "../../pages/Reclamations/modals/ApprouverModal";

import { formatDate, formatDate3 } from "../../Utils/utils";
import { LoadingButton } from "@mui/lab";
import SaveIcon from "@mui/icons-material/Save";

/**
 * Shared treatment detail shell: header + sidebar + tabs + modals.
 *
 * Props:
 *   Navigation:
 *     onBack          — called when the back button is clicked
 *
 *   Dossier identity:
 *     codeClient, status, risqueLevel
 *
 *   Sidebar — client info:
 *     lastname, phone, email, address, language, gender, dossierimf
 *
 *   Sidebar — dossier details:
 *     recorded_at, collect, subject, underSubject, product, unit,
 *     created_by, creationDate, content, extras, onAddContent
 *
 *   Sidebar — actions:
 *     visibleActions  — string[] of action keys to show
 *
 *   Fichiers tab:
 *     selectedItemFiles, selectedItemAudio, attachmentList, audioList,
 *     inputRef, onFilesChange, onAddAudio
 *
 *   Historique tab:
 *     recorded_at, created_by, transmitted, transmittedBy, transmittedTo,
 *     handled_by, assigned_by, assignedAt, solution
 *
 *   Traitement tab — sub-tabs:
 *     treatForm           — JSX for the "Classique" sub-tab form
 *     existingSolutions   — array for PreEnregistreesTab
 *     onModifyBeforeSend  — (content) => void
 *     onUseAndTreat       — (content) => void
 *     btnS                — JSX: session start/join button
 *     transmettre         — JSX: transmit button (optional)
 *     session             — session object (for collaboratif panel)
 *     onSwitchToChat      — () => void  (called when "Voir la discussion" clicked)
 *
 *   Chat tab:
 *     tchat               — <SessionChat ... /> or null
 *
 *   Modals:
 *     agentsOptions, onAgentChange, anonymat, onAnonymatChange
 *     onConfirmAffecter, isReaffect
 *     confirmOpen, convertionType, onSelectType, onConfirmClose, onSubmitConfirmation, loadingConversion
 *     onConfirmTransmettre, loadingTransmettre
 *     motif, onMotifChange, onApprove, onDisapprove, loadingApprove, loadingDisapprove
 *     modalErrors
 *     emailDialogSlot  — <EmailDialog .../> rendered by parent (has its own Redux connect)
 *
 *   Permissions:
 *     loading (props.etat), loading2 (props.etat2), loading3 (props.etat3)
 */
const TraitementShell = ({
  // Navigation
  onBack,

  // Identity
  codeClient, status, statusLabel, risqueLevel,

  // Sidebar — client
  lastname, phone, email, address, language, gender, dossierimf,

  // Sidebar — dossier
  recorded_at, collect, subject, underSubject, product, unit,
  created_by, creationDate, content, extras, onAddContent,

  // Sidebar — actions
  visibleActions = [],
  onActionOverride,

  // Custom tabs override — [{ key, label, content }]
  customTabs,

  // Fichiers
  selectedItemFiles, selectedItemAudio,
  attachmentList, audioList,
  inputRef, onFilesChange, onAddAudio,

  // Historique
  transmitted, transmittedBy, transmittedTo,
  handled_by, assigned_by, assignedAt, solution,

  // Traitement tab
  treatForm,
  onTreat,         // handler du bouton "Traiter"
  loadingTreat,    // boolean loading state
  canTreat,        // boolean — si false, boutons solutions grisés
  existingSolutions = [],
  onModifyBeforeSend,
  onUseAndTreat,
  btnS,
  transmettre,
  session,
  onSwitchToChat,

  // Chat
  tchat,

  // Modals
  agentsOptions = [], onAgentChange, anonymat, onAnonymatChange,
  onConfirmAffecter, isReaffect = false,
  confirmOpen, convertionType, onSelectType, onConfirmClose,
  onSubmitConfirmation, loadingConversion,
  onConfirmTransmettre, loadingTransmettre,
  motif, onMotifChange, onApprove, onDisapprove,
  loadingApprove, loadingDisapprove,
  modalErrors,
  emailDialogSlot,
  headerActions,
  conversionWarning,
  conversionTypes,
  dossierLabel,
  hideClientInfo = false,
}) => {
  const [activeTab, setActiveTab] = useState(customTabs ? customTabs[0]?.key : 'traitement');
  const [openAccordions, setOpenAccordions] = useState({ client: false, details: false, actions: true });
  const [treatSubTab, setTreatSubTab] = useState('classique');
  const [openModal, setOpenModal] = useState(null);

  const toggleAccordion = (key) =>
    setOpenAccordions(prev => ({ client: false, details: false, actions: false, [key]: !prev[key] }));

  const STATUS_MAP = {
    SAVED:             ['#e0f2fe', '#0369a1', 'A traiter'],
    TEMP_SAVED:        ['#ede9fe', '#6d28d9', 'Sauvegardée'],
    AFFECTED:          ['#fef9c3', '#854d0e', 'Affectée'],
    TO_APPROUVED:      ['#fef3c7', '#92400e', 'À approuver'],
    DESAPPROUVED:      ['#fee2e2', '#991b1b', 'Désapprouvée'],
    TREAT:             ['#dcfce7', '#166534', 'En traitement'],
    SATISFIED:         ['#dcfce7', '#166534', 'Satisfait'],
    CLASSED:           ['#f3e8ff', '#6b21a8', 'Classée'],
    UNSATISFIED:       ['#fee2e2', '#991b1b', 'Non satisfait'],
    PARTIAL_SATISFIED: ['#fef3c7', '#92400e', 'Part. satisfait'],
    LITIGATION:        ['#fef3c7', '#b45309', 'Contentieux'],
  };
  const GRAVITY_MAP = {
    MINEUR: ['#dcfce7', '#166534', 'Mineur'],
    MOYEN:  ['#fef9c3', '#854d0e', 'Moyen'],
    GRAVE:  ['#fee2e2', '#991b1b', 'Grave'],
  };

  const [bgS, colS, lblS_] = STATUS_MAP[status]  || ['#f1f5f9', '#64748b', status || ''];
  const lblS = statusLabel ?? lblS_;
  const [bgG, colG, lblG] = GRAVITY_MAP[risqueLevel] || [];

  const handleActionClick = (key) => {
    if (onActionOverride) { onActionOverride(key); } else { setOpenModal(key); }
  };

  return (
    <>
      <div className="flex flex-col h-screen overflow-hidden bg-[#f5f5f5]">

        {/* ════ HEADER DOSSIER ════ */}
        <div className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-2 flex-wrap flex-shrink-0">
          <IconButton size="small" onClick={onBack} sx={{ color: '#374151', mr: 0.5 }}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <span className="font-bold text-[15px] text-slate-900 tracking-wide font-mono">
            {codeClient}
          </span>
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600, background: bgS, color: colS }}>
            {lblS}
          </span>
          {risqueLevel && lblG && (
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600, background: bgG, color: colG }}>
              {lblG}
            </span>
          )}
          {headerActions && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              {headerActions}
            </div>
          )}
        </div>

        {/* ════ MAIN GRID ════ */}
        <div className="flex-1 overflow-hidden grid bg-[#f5f5f5] gap-0" style={{ gridTemplateColumns: '280px 1fr' }}>

          {/* ─── LEFT SIDEBAR ─── */}
          <div
            className="overflow-y-auto overflow-x-hidden flex flex-col gap-3 p-3 bg-[#f5f5f5]"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,0,0,0.1) transparent' }}
          >
            {!hideClientInfo && (
              <SidebarInfosClient
                isOpen={openAccordions.client}
                onToggle={() => toggleAccordion('client')}
                lastname={lastname}
                phone={phone}
                email={email}
                address={address}
                language={language}
                gender={gender}
                dossierimf={dossierimf}
              />
            )}

            <SidebarDetailsDossier
              isOpen={openAccordions.details}
              onToggle={() => toggleAccordion('details')}
              codeClient={codeClient}
              recorded_at={recorded_at}
              collect={collect}
              underSubject={underSubject}
              subject={subject}
              product={product}
              unit={unit}
              created_by={created_by}
              creationDate={creationDate}
              content={content}
              extras={extras}
              onAddContent={onAddContent}
              handled_by={handled_by}
              assigned_by={assigned_by}
              assignedAt={assignedAt}
              transmittedTo={transmittedTo}
              formatDate={formatDate}
              formatDate3={formatDate3}
              getStatusLabel={(s) => STATUS_MAP[s]?.[2] ?? s}
            />

            {visibleActions.length > 0 && (
              <ActionsDisponibles
                isOpen={openAccordions.actions}
                onToggle={() => toggleAccordion('actions')}
                visibleActions={visibleActions}
                onAction={handleActionClick}
              />
            )}
          </div>

          {/* ─── RIGHT: TABS ─── */}
          <div className="flex flex-col overflow-hidden bg-[#f5f5f5]">

            {/* Tab bar */}
            <div className="flex-shrink-0 px-3 pt-3">
              <div className="bg-white rounded-2xl px-2" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="flex">
                  {(customTabs || [
                    { key: 'traitement', label: 'Traitement' },
                    { key: 'fichiers',   label: 'Contenu & Médias' },
                    { key: 'historique', label: 'Historique' },
                    { key: 'chat',       label: 'Chat' },
                  ]).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-[18px] py-[13px] bg-transparent border-0 cursor-pointer text-[13px] transition-colors -mb-px ${
                        activeTab === tab.key
                          ? 'font-semibold text-[#005081] border-b-2 border-[#005081]'
                          : 'font-normal text-slate-500 border-b-2 border-transparent'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bannière conversion */}
            {conversionWarning && (
              <div className="flex-shrink-0 px-3 pt-2">
                <div style={{
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  borderLeft: '4px solid #f97316',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.82rem',
                  color: '#9a3412',
                  fontWeight: 500,
                }}>
                  {conversionWarning}
                </div>
              </div>
            )}

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto bg-[#f5f5f5]">

              {/* ── CUSTOM TABS ── */}
              {customTabs && customTabs.map((tab) => (
                activeTab === tab.key ? (
                  <div key={tab.key} className="p-3">{tab.content}</div>
                ) : null
              ))}

              {/* ── TRAITEMENT ── */}
              {!customTabs && activeTab === 'traitement' && (
                <div className="p-3">

                  {/* Sub-tab bar */}
                  <div className="flex gap-2.5 mb-5">
                    {[
                      { key: 'classique',        label: 'Classique',                   icon: <BoltIcon style={{ fontSize: 16 }} /> },
                      { key: 'pre_enregistrees', label: 'Solutions pré-enregistrées',  icon: <LightbulbIcon style={{ fontSize: 16 }} /> },
                      { key: 'collaboratif',     label: 'Collaboratif',                icon: <GroupsIcon style={{ fontSize: 16 }} /> },
                    ].map((sub) => {
                      const active = treatSubTab === sub.key;
                      return (
                        <button
                          key={sub.key}
                          onClick={() => setTreatSubTab(sub.key)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 7,
                            padding: '9px 16px', borderRadius: 10, cursor: 'pointer',
                            border: active ? '1.5px solid #3b82f6' : '1.5px solid #e5e7eb',
                            background: active ? 'white' : '#f8fafc',
                            fontSize: 13, fontWeight: active ? 700 : 500,
                            color: active ? '#1d4ed8' : '#6b7280',
                            boxShadow: active ? '0 1px 6px rgba(59,130,246,0.12)' : 'none',
                            transition: 'all 0.15s', whiteSpace: 'nowrap',
                          }}
                        >
                          {sub.icon}
                          {sub.label}
                        </button>
                      );
                    })}
                    {transmettre && <div style={{ marginLeft: 'auto' }}>{transmettre}</div>}
                  </div>

                  {/* Classique */}
                  {treatSubTab === 'classique' && treatForm && (
                    <div className="bg-white rounded-xl" style={{ border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <EditNoteIcon style={{ fontSize: 20, color: '#1d4ed8' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Proposition de solution</div>
                          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>Solution proposée pour résoudre ce dossier</div>
                        </div>
                        <button style={{ padding: '8px 18px', borderRadius: 9, background: '#2563eb', border: 'none', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}>
                          Sauvegarder
                        </button>
                      </div>
                      <div className="treat-form-modern" style={{ padding: '16px 18px' }}>
                        {treatForm}
                      </div>
                      {onTreat && (
                        <div style={{ padding: '12px 18px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                          <LoadingButton
                            onClick={onTreat}
                            loading={loadingTreat}
                            loadingPosition="end"
                            endIcon={<SaveIcon />}
                            variant="contained"
                            sx={{
                              background: 'linear-gradient(135deg, #10b981, #059669)',
                              textTransform: 'initial',
                              fontWeight: 700,
                              fontSize: 13,
                              borderRadius: 9,
                              px: 3,
                              boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                              '&:hover': { background: 'linear-gradient(135deg, #059669, #047857)' },
                            }}
                          >
                            Traiter
                          </LoadingButton>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pré-enregistrées */}
                  {treatSubTab === 'pre_enregistrees' && (
                    <PreEnregistreesTab
                      solutions={existingSolutions}
                      disabled={canTreat === false}
                      onModifyBeforeSend={(content) => {
                        onModifyBeforeSend?.(content);
                        setTreatSubTab('classique');
                      }}
                      onUseAndTreat={(content, id) => onUseAndTreat?.(content, id)}
                    />
                  )}

                  {/* Collaboratif */}
                  {treatSubTab === 'collaboratif' && (
                    <div className="flex flex-col gap-3.5">
                      <div className="bg-white rounded-xl border border-gray-200 py-9 px-5 text-center">
                        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3.5 text-[26px]">💬</div>
                        <div className="text-sm font-semibold text-slate-900 mb-1.5">Session collaborative</div>
                        <div style={{ fontSize: 12.5, color: '#94a3b8', marginBottom: 20, maxWidth: 340, margin: '0 auto 20px' }}>
                          Invitez des collègues et travaillez en équipe sur ce dossier en temps réel
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                          {btnS}
                          {session?.status === 'OPEN' && (
                            <button
                              onClick={() => { setActiveTab('chat'); onSwitchToChat?.(); }}
                              style={{ padding: '8px 16px', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}
                            >
                              Voir la discussion →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── FICHIERS ── */}
              {!customTabs && activeTab === 'fichiers' && (
                <FichiersTab
                  selectedItemFiles={selectedItemFiles}
                  selectedItemAudio={selectedItemAudio}
                  attachmentList={attachmentList}
                  audioList={audioList}
                  inputRef={inputRef}
                  onFilesChange={onFilesChange}
                  onAddAudio={onAddAudio}
                  content={content}
                  extras={extras}
                  onAddContent={onAddContent}
                />
              )}

              {/* ── HISTORIQUE ── */}
              {!customTabs && activeTab === 'historique' && (
                <div className="p-3">
                  <HistoriqueTimeline
                    recorded_at={recorded_at}
                    created_by={created_by}
                    transmitted={transmitted}
                    transmittedBy={transmittedBy}
                    transmittedTo={transmittedTo}
                    handled_by={handled_by}
                    assigned_by={assigned_by}
                    assignedAt={assignedAt}
                    solution={solution}
                    formatDate={formatDate}
                    formatDate3={formatDate3}
                  />
                </div>
              )}

              {/* ── CHAT — always mounted ── */}
              <div className={`flex-col p-3 min-h-full ${!customTabs && activeTab === 'chat' ? 'flex' : 'hidden'}`}>
                {tchat ? (
                  <div className="bg-white rounded-xl border border-gray-200 flex-1 overflow-hidden">
                    {tchat}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 flex-1 flex flex-col items-center justify-center p-10 min-h-[300px]">
                    <div className="text-[36px] mb-3.5">💬</div>
                    <div className="text-sm font-semibold text-slate-900 mb-1.5">Aucun message</div>
                    <div className="text-[12.5px] text-slate-400 text-center max-w-[280px]">
                      Démarrez la conversation pour collaborer sur ce dossier
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ════ MODALS ════ */}
      <AffecterModal
        open={openModal === 'affecter' || openModal === 'reaffecter'}
        onClose={() => setOpenModal(null)}
        isReaffect={openModal === 'reaffecter'}
        agentsOptions={agentsOptions}
        onAgentChange={onAgentChange}
        anonymat={anonymat}
        onAnonymatChange={onAnonymatChange}
        onConfirm={(e) => { e.preventDefault(); setOpenModal(null); onConfirmAffecter?.(e); }}
        loading={loadingApprove}
        errors={modalErrors}
      />

      <ConvertirModal
        open={openModal === 'convertir'}
        onClose={() => setOpenModal(null)}
        onSelectType={onSelectType}
        confirmOpen={confirmOpen}
        convertionType={convertionType}
        onConfirmClose={onConfirmClose}
        onSubmitConfirmation={onSubmitConfirmation}
        loading={loadingConversion}
        types={conversionTypes}
        dossierLabel={dossierLabel}
      />

      <TransmettreModal
        open={openModal === 'transmettre'}
        onClose={() => setOpenModal(null)}
        onConfirm={(e) => { setOpenModal(null); onConfirmTransmettre?.(e); }}
        loading={loadingTransmettre}
      />

      <ApprouverModal
        open={openModal === 'approuver'}
        onClose={() => setOpenModal(null)}
        solution={solution}
        motif={motif}
        onMotifChange={onMotifChange}
        onApprove={(e) => { setOpenModal(null); onApprove?.(e); }}
        onDisapprove={(e) => { setOpenModal(null); onDisapprove?.(e); }}
        loadingApprove={loadingApprove}
        loadingDisapprove={loadingDisapprove}
        errors={modalErrors}
      />

      {/* EmailDialog connecté Redux — rendu par le parent */}
      {emailDialogSlot}
    </>
  );
};

export default TraitementShell;
