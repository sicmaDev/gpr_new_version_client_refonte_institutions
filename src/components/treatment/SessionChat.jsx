import React, { useState } from "react";
import { Avatar } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SendIcon from "@mui/icons-material/Send";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SearchIcon from "@mui/icons-material/Search";

const COLORS = ["var(--gpr-primary, #005081)", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const avatarColor = (name) => COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];

/* ── Vote card ──────────────────────────────────────────────── */
const VoteCard = ({ chat, user, isUserOpenSession, showConfirmChooseSolution,
  onVote, onChooseVote, onChooseVoteConfirm }) => {
  const votes = chat?.voteDto?.userVote ?? [];
  const pourCount = votes.filter(v => v.voteType === "POUR").length;
  const contreCount = votes.filter(v => v.voteType === "CONTRE").length;
  const total = pourCount + contreCount;
  const pourPct = total ? Math.round((pourCount / total) * 100) : 0;
  const contrePct = total ? Math.round((contreCount / total) * 100) : 0;
  const myVote = votes.find(v => v.author.id === user.id)?.voteType ?? "";
  const pourWins = pourCount > contreCount;
  let content = {};
  try { content = JSON.parse(chat.content); } catch (_) { content = { contenu: chat.content, commentaire: "" }; }

  return (
    <div style={{
      background: 'white', border: '1.5px solid #e0e7ff', borderRadius: 14,
      overflow: 'hidden', boxShadow: '0 2px 12px rgba(99,102,241,0.08)',
    }}>
      {/* Header vote */}
      <div style={{ background: 'var(--gpr-primary, #005081)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <HowToVoteIcon style={{ color: 'white', fontSize: 18 }} />
        <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>Proposition de vote</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
          {chat.sender?.firstAndLastName}
        </span>
      </div>

      {/* Contenu */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gpr-primary, #005081)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Solution</div>
          <div style={{ fontSize: 13, color: '#1e293b', background: '#f8fafc', borderRadius: 8, padding: '8px 10px', borderLeft: '3px solid #6366f1' }}>
            {content.contenu}
          </div>
        </div>
        {content.commentaire && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Commentaire</div>
            <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>{content.commentaire}</div>
          </div>
        )}

        {/* Votes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          {[{ label: 'POUR', val: 'POUR', pct: pourPct, count: pourCount, color: '#10b981' },
            { label: 'CONTRE', val: 'CONTRE', pct: contrePct, count: contreCount, color: '#ef4444' }].map(opt => (
            <div key={opt.val}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={`vote-${chat.id}`}
                    value={opt.val}
                    checked={myVote === opt.val}
                    onChange={(e) => onVote(e, chat.id)}
                    style={{ accentColor: opt.color }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 600, color: opt.color }}>{opt.label}</span>
                </label>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{opt.count} vote{opt.count > 1 ? 's' : ''} · {opt.pct}%</span>
              </div>
              <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${opt.pct}%`, background: opt.color, borderRadius: 3, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Utiliser solution */}
        {pourWins && isUserOpenSession && (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
            {showConfirmChooseSolution ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Confirmer l'utilisation ?</span>
                <button onClick={onChooseVoteConfirm} style={btnSmall('#f1f5f9', '#64748b')}>Non</button>
                <button onClick={() => onChooseVote(chat.id)} style={btnSmall('#10b981', 'white')}>Oui</button>
              </div>
            ) : (
              <button onClick={onChooseVoteConfirm} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'linear-gradient(135deg,#10b981,#059669)',
                color: 'white', border: 'none', borderRadius: 8,
                padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(16,185,129,0.25)',
              }}>
                <CheckCircleIcon style={{ fontSize: 15 }} />
                Utiliser comme solution
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const btnSmall = (bg, color) => ({
  background: bg, color, border: 'none', borderRadius: 6,
  padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
});

/* ── Main component ─────────────────────────────────────────── */
const SessionChat = ({
  session, user, userData, publicChats, guests,
  codeClient, isCreator, isUserOpenSession, availableToInvite,
  showVoteField, showConfirmChooseSolution,
  propositionSolution, propositionCommentaire,
  propositionSolutionError, propositionCommentaireError,
  maDivRef, bottomRef,
  onSearchInvite, onInvite, onEject,
  onMessage, onSend,
  onToggleVoteField,
  onPropositionSolution, onPropositionCommentaire, onSendVote,
  onVote, onChooseVote, onChooseVoteConfirm,
}) => {
  const [showInviteSearch, setShowInviteSearch] = useState(false);

  if (!userData?.connected) return null;

  const members = session?.members ?? [];

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 500, background: '#f8fafc', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0' }}>

      {/* ── LEFT: Participants ──────────────────────────────── */}
      <div style={{ width: 220, flexShrink: 0, background: 'white', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
            Participants
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>
            {members.length + (guests?.length ?? 0)} en session
          </div>
        </div>

        {/* Liste participants */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>

          {/* Membres */}
          {members.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Membres</div>
              {members.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px', borderRadius: 8 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: 13, background: avatarColor(m.firstAndLastName) }}>
                      {m.firstAndLastName?.[0]}
                    </Avatar>
                    <span style={{ position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, background: '#10b981', border: '2px solid white', borderRadius: '50%' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.firstAndLastName}
                    </div>
                    {m.id === session?.createdBy?.id && (
                      <div style={{ fontSize: 10, color: 'var(--gpr-primary, #005081)', fontWeight: 600 }}>Animateur</div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Invités */}
          {guests?.length > 0 && guests[0].firstAndLastName && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '10px 0 6px' }}>Invités</div>
              {guests.map(g => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px', borderRadius: 8 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: 13, background: avatarColor(g.firstAndLastName) }}>
                      {g.firstAndLastName?.[0]}
                    </Avatar>
                    <span style={{ position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, background: '#f59e0b', border: '2px solid white', borderRadius: '50%' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {g.firstAndLastName}
                    </div>
                    <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 500 }}>Invité</div>
                  </div>
                  {isUserOpenSession && (
                    <IconButton size="small" onClick={(e) => onEject(e, g.id)}
                      sx={{ color: '#ef4444', p: 0.3, '&:hover': { background: '#fef2f2' } }}>
                      <PersonRemoveIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Inviter */}
          {isCreator && (
            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => setShowInviteSearch(!showInviteSearch)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', background: '#f8fafc', border: '1.5px dashed #e2e8f0', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: '#64748b', fontSize: 12, fontWeight: 500 }}
              >
                <AddCircleOutlineIcon style={{ fontSize: 16, color: 'var(--gpr-primary, #005081)' }} />
                Inviter un agent
              </button>

              {showInviteSearch && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ position: 'relative' }}>
                    <SearchIcon style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      onChange={onSearchInvite}
                      style={{ width: '100%', paddingLeft: 28, paddingRight: 8, paddingTop: 6, paddingBottom: 6, border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div ref={maDivRef} style={{ marginTop: 4, maxHeight: 150, overflowY: 'auto' }}>
                    {availableToInvite.map(m => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 4px', borderRadius: 6, cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Avatar sx={{ width: 26, height: 26, fontSize: 11, background: avatarColor(m.firstAndLastName) }}>
                          {m.firstAndLastName?.[0]}
                        </Avatar>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.firstAndLastName}</div>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>{m.posteDto?.libelle}</div>
                        </div>
                        <IconButton size="small" onClick={(e) => { onInvite(e, m.id); setShowInviteSearch(false); }}
                          sx={{ color: 'var(--gpr-primary, #005081)', p: 0.3 }}>
                          <AddCircleOutlineIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Proposer vote (bas sidebar) */}
        {isCreator && (
          <div style={{ padding: '12px 12px', borderTop: '1px solid #f1f5f9' }}>
            <button
              onClick={onToggleVoteField}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: '100%', padding: '8px 0',
                background: showVoteField ? '#fef3c7' : 'var(--gpr-primary, #005081)',
                color: showVoteField ? '#92400e' : 'white',
                border: 'none', borderRadius: 9, cursor: 'pointer',
                fontSize: 12, fontWeight: 600,
                boxShadow: showVoteField ? 'none' : '0 2px 8px rgba(99,102,241,0.3)',
              }}
            >
              <HowToVoteIcon style={{ fontSize: 16 }} />
              {showVoteField ? 'Annuler le vote' : 'Proposer un vote'}
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT: Discussion ───────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header discussion */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', background: 'white', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Discussion</span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>- {codeClient}</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#64748b', background: '#f1f5f9', borderRadius: 20, padding: '3px 10px' }}>
            {publicChats?.length ?? 0} message{(publicChats?.length ?? 0) > 1 ? 's' : ''}
          </span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(!publicChats || publicChats.length === 0) && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: 8, paddingTop: 40 }}>
              <div style={{ fontSize: 32 }}>💬</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Aucun message pour l'instant</div>
              <div style={{ fontSize: 12 }}>Démarrez la discussion</div>
            </div>
          )}

          {publicChats?.map((chat) => {
            const isMe = chat.sender?.id === user.id;
            if (chat.vote) {
              return (
                <div key={chat.id} style={{ maxWidth: '90%', alignSelf: 'center', width: '100%' }}>
                  <VoteCard
                    chat={chat} user={user}
                    isUserOpenSession={isUserOpenSession}
                    showConfirmChooseSolution={showConfirmChooseSolution}
                    onVote={onVote}
                    onChooseVote={onChooseVote}
                    onChooseVoteConfirm={onChooseVoteConfirm}
                  />
                </div>
              );
            }
            return (
              <div key={chat.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: 3 }}>
                {!isMe && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Avatar sx={{ width: 22, height: 22, fontSize: 10, background: avatarColor(chat.sender?.firstAndLastName) }}>
                      {chat.sender?.firstAndLastName?.[0]}
                    </Avatar>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{chat.sender?.firstAndLastName}</span>
                    <span style={{ fontSize: 10, color: '#cbd5e1' }}>{chat.createdAt}</span>
                  </div>
                )}
                <div style={{
                  maxWidth: '75%',
                  padding: '9px 13px',
                  borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: isMe ? 'var(--gpr-primary, #005081)' : 'white',
                  color: isMe ? 'white' : '#1e293b',
                  fontSize: 13,
                  boxShadow: isMe ? '0 2px 8px rgba(99,102,241,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
                  border: isMe ? 'none' : '1px solid #f1f5f9',
                }}>
                  {chat.content}
                </div>
                {isMe && (
                  <span style={{ fontSize: 10, color: '#cbd5e1' }}>{chat.createdAt}</span>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Zone de saisie */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', background: 'white' }}>
          {showVoteField ? (
            /* Mode proposition de vote */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gpr-primary, #005081)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <HowToVoteIcon style={{ fontSize: 15 }} />
                Proposition de vote
              </div>
              <input
                type="text"
                placeholder="Solution proposée *"
                value={propositionSolution}
                onChange={onPropositionSolution}
                style={{ padding: '8px 12px', border: propositionSolutionError ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13, outline: 'none' }}
              />
              {propositionSolutionError && <div style={{ fontSize: 11, color: '#ef4444' }}>{propositionSolutionError}</div>}
              <input
                type="text"
                placeholder="Commentaire (optionnel)"
                value={propositionCommentaire}
                onChange={onPropositionCommentaire}
                style={{ padding: '8px 12px', border: propositionCommentaireError ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13, outline: 'none' }}
              />
              {propositionCommentaireError && <div style={{ fontSize: 11, color: '#ef4444' }}>{propositionCommentaireError}</div>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button onClick={onToggleVoteField} style={btnSmall('#f1f5f9', '#64748b')}>Annuler</button>
                <button onClick={onSendVote} style={{
                  ...btnSmall('var(--gpr-primary, #005081)', 'white'),
                  padding: '7px 18px', boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                }}>
                  Soumettre au vote
                </button>
              </div>
            </div>
          ) : (
            /* Mode message normal */
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ flex: 1, background: '#f8fafc', borderRadius: 12, border: '1.5px solid #e2e8f0', overflow: 'hidden', transition: 'border-color 0.2s' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--gpr-primary, #005081)'}
                onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                <textarea
                  placeholder="Saisir un message..."
                  value={userData.message}
                  onChange={onMessage}
                  rows={1}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                  style={{
                    width: '100%', border: 'none', outline: 'none', background: 'transparent',
                    padding: '10px 14px', fontSize: 13, resize: 'none', display: 'block',
                    fontFamily: 'inherit', color: '#1e293b', boxSizing: 'border-box',
                  }}
                />
              </div>
              <button
                onClick={onSend}
                disabled={!userData.message}
                style={{
                  width: 42, height: 42, borderRadius: '50%', border: 'none', cursor: userData.message ? 'pointer' : 'not-allowed',
                  background: userData.message ? 'var(--gpr-primary, #005081)' : '#e2e8f0',
                  color: userData.message ? 'white' : '#94a3b8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: userData.message ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <SendIcon style={{ fontSize: 18 }} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionChat;
