// Mémoire, pour la page de traitement, de ce que l'agent a fait des propositions de l'IA :
// sert à marquer la solution comme « proposée par l'IA » et à envoyer le retour de l'agent.
import { envoyerRetourIa } from "../../apis/IA/IaApi";

const memoire = {};
const sansEspaces = (s) => String(s || "").replace(/\s+/g, " ").trim().toLowerCase();

/** L'IA a proposé des solutions pour ce dossier. */
export const noterPropositionsIa = (claimId, { options = [], raisonnement = "", categorie, motif, urgence } = {}) => {
  if (!claimId) return;
  memoire[claimId] = { ...(memoire[claimId] || {}), propose: options.length > 0, raisonnement, categorie, motif, urgence };
};

/** L'agent a appliqué une solution de l'IA au formulaire officiel. */
export const noterSolutionAppliqueeIa = (claimId, { solution, commentaire }) => {
  if (!claimId) return;
  memoire[claimId] = { ...(memoire[claimId] || {}), applique: { solution, commentaire } };
};

/**
 * À l'envoi du traitement : champs à ajouter à la solution (solution venue de l'IA ou non),
 * et envoi du retour de l'agent (validée telle quelle, corrigée, ou propositions écartées).
 */
export const infosSolutionIa = (claimId, solutionFinale, { categorieFinale, motifFinal, nature } = {}) => {
  const m = memoire[claimId];
  if (!m || (!m.applique && !m.propose)) return {};
  let statut = "REJECTED";
  if (m.applique) statut = sansEspaces(m.applique.solution) === sansEspaces(solutionFinale) ? "VALIDATED" : "CORRECTED";
  if (nature !== "SUGGESTION") {
    envoyerRetourIa(claimId, {
      status: statut,
      finalCategory: categorieFinale || null,
      finalMotif: motifFinal || null,
      finalUrgency: m.urgence || null,
      retainedSolution: solutionFinale || null,
    });
  }
  return m.applique
    ? { isAiProposed: true, aiSelectedSolution: m.applique.solution, aiReasoning: m.raisonnement || null }
    : {};
};
