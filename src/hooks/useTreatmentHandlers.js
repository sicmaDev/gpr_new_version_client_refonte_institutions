import { notify } from "../Utils/alert";
import {
  affectClaimApi,
  approveClaimSolutionApi,
  transmissionClaimApi,
  treatClaimApi,
  unapproveClaimSolutionApi,
} from "../apis/Reclamations/ReclamationsApi";

/**
 * Encapsulates all treatment action handlers. Works for both Réclamations and Dénonciations
 * by injecting the domain-specific API functions via the `apis` parameter.
 *
 * @param {{
 *   props: object,
 *   user: object,
 *   anonymat: boolean,
 *   maxDelai: number,
 *   onSuccess: (e: Event) => void,
 *   apis?: {
 *     affectApi?: Function,
 *     treatApi?: Function,
 *     approveApi?: Function,
 *     unapproveApi?: Function,
 *     transmitApi?: Function,
 *   }
 * }} params
 *
 * `onSuccess` is called after a successful API call (replaces handleCancel + handleClose).
 * `apis` defaults to Réclamations APIs if omitted.
 */
const useTreatmentHandlers = ({
  props,
  user,
  anonymat,
  maxDelai,
  onSuccess,
  apis = {},
}) => {
  const affectApi   = apis.affectApi   ?? affectClaimApi;
  const treatApi    = apis.treatApi    ?? treatClaimApi;
  const approveApi  = apis.approveApi  ?? approveClaimSolutionApi;
  const unapproveApi = apis.unapproveApi ?? unapproveClaimSolutionApi;
  const transmitApi = apis.transmitApi  ?? transmissionClaimApi;

  let errors = {};

  // ── Validation ────────────────────────────────────────────────────────────

  const handleValidation = () => {
    let isValid = true;
    const hasExisting = props.solutionExistant && props.solutionExistant !== "";
    if (!hasExisting && (!props.solution || props.solution.length === 0)) {
      isValid = false;
      errors["solution"] = "Champ incorrect";
      notify("Veuillez renseigner la solution", "error");
    }
    if (!hasExisting && (!props.comment || props.comment === "")) {
      isValid = false;
      errors["comment"] = "Champ incorrect";
      notify("Veuillez renseigner le commentaire", "error");
    }
    return isValid;
  };

  const handleReValidation = () => {
    let isValid = true;
    const hasExisting = props.solutionExistant && props.solutionExistant !== "";
    if (!hasExisting && (!props.new_solution || props.new_solution.length === 0)) {
      isValid = false;
      errors["new_solution"] = "Champ incorrect";
      notify("Veuillez renseigner la solution", "error");
    }
    if (!hasExisting && (!props.new_comment || props.new_comment === "")) {
      isValid = false;
      errors["new_comment"] = "Champ incorrect";
      notify("Veuillez renseigner le commentaire", "error");
    }
    return isValid;
  };

  const handleValidationForAssign = () => {
    let isValid = true;
    if (!props.handled_by) {
      isValid = false;
      errors["handled_by"] = "Champ incorrect";
    }
    if (props.handled_delai <= 0 || props.handled_delai > maxDelai) {
      isValid = false;
      errors["handled_delai"] = `Le delai doit etre compris entre ${1} à ${maxDelai}`;
    }
    return isValid;
  };

  const handleValidationForReAssign = () => {
    let isValid = true;
    if (!props.reaffect) {
      isValid = false;
      errors["handled_by"] = "Champ incorrect";
    }
    if (props.handled_delai <= 0 || props.handled_delai > maxDelai) {
      isValid = false;
      errors["handled_delai"] = `Le delai doit etre compris entre ${1} à ${maxDelai}`;
    }
    return isValid;
  };

  const handleValidationForDisapproval = () => {
    let isValid = true;
    if (!props.motif) {
      isValid = false;
      errors["motif"] = "Champ incorrect";
    }
    return isValid;
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const prepareBeforeAssign = (e) => {
    e.preventDefault();
    e.stopPropagation();
    props.handledShowModalChanged(true);
  };

  const handleAssign = (e) => {
    e.preventDefault();
    if (handleValidationForAssign()) {
      const claim = {
        claimId: props.id,
        affectToId: props.handled_by,
        affectorId: user.id,
        affectedAnonymous: anonymat,
        message: props.handled_message,
        delai: props.handled_delai,
      };
      props.etatChanged(true);
      affectApi(claim, props).then(() => onSuccess(e));
    }
    props.claimHandleErrors(errors);
  };

  const handleReAssign = (e) => {
    e.preventDefault();
    if (handleValidationForReAssign()) {
      const claim = {
        claimId: props.id,
        affectToId: props.reaffect,
        affectorId: user.id,
        affectedAnonymous: anonymat,
        message: props.handled_message,
        delai: props.handled_delai,
      };
      props.etatChanged(true);
      affectApi(claim, props).then(() => onSuccess(e));
    }
    props.claimHandleErrors(errors);
  };

  const handleAssignOrReassign = (e) => {
    if (props.reaffect) {
      handleReAssign(e);
    } else {
      handleAssign(e);
    }
  };

  const handleSolve = (e) => {
    e.preventDefault();
    if (handleValidation()) {
      const claim = {
        claimId: props.id,
        treatorId: user.id,
        solution: props.solution && typeof props.solution === "string" ? props.solution : "",
        commentaire: props.comment,
        existingId: props.solutionExistant,
        isExisting: props.solutionExistant !== "",
      };
      props.etat2Changed(true);
      treatApi(claim, props)
        .then(() => onSuccess(e))
        .catch(() => {
          props.etat2Changed(false);
          notify("Erreur lors du traitement", "error");
        });
    }
    props.claimHandleErrors(errors);
  };

  const handleReSolve = (e) => {
    e.preventDefault();
    if (handleReValidation()) {
      const claim = {
        claimId: props.id,
        treatorId: user.id,
        solution: props.new_solution,
        commentaire: props.new_comment,
        existingId: props.solutionExistant,
        isExisting: props.solutionExistant !== "",
      };
      props.etat2Changed(true);
      treatApi(claim, props)
        .then(() => onSuccess(e))
        .catch(() => {
          props.etat2Changed(false);
          notify("Erreur lors du traitement", "error");
        });
    }
    props.claimHandleErrors(errors);
  };

  const handleApprove = (e) => {
    e.preventDefault();
    const claim = {
      solutionId: props.solutionId,
      claimId: props.id,
      approuverId: user.id,
    };
    props.etat2Changed(true);
    approveApi(claim, props).then(() => onSuccess(e));
    props.claimHandleErrors(errors);
  };

  const handleDisapprove = (e) => {
    e.preventDefault();
    if (handleValidationForDisapproval()) {
      const claim = {
        solutionId: props.solutionId,
        claimId: props.id,
        unApprouverId: user.id,
        motifDesaprobation: props.motif,
      };
      props.etatChanged(true);
      unapproveApi(claim, props).then(() => onSuccess(e));
    }
    props.claimHandleErrors(errors);
  };

  const handleTransmission = (e) => {
    e.preventDefault();
    const info = { claimId: props.id };
    props.etat3Changed(true);
    transmitApi(info, props).then(() => onSuccess(e));
  };

  /**
   * Traite immédiatement sans passer par le formulaire.
   * Utilisé par "Utiliser et traiter" dans PreEnregistreesTab.
   * @param {string} content  — texte de la solution
   * @param {string|number} [existingId=''] — id de la solution pré-enregistrée si applicable
   * @param {string} [commentaire='']
   */
  const handleSolveImmediate = (content, existingId = '', commentaire = '') => {
    const claim = {
      claimId: props.id,
      treatorId: user.id,
      solution: existingId ? '' : (typeof content === 'string' ? content : ''),
      commentaire,
      existingId,
      isExisting: existingId !== '',
    };
    props.etat2Changed(true);
    treatApi(claim, props).then(() => onSuccess({ preventDefault: () => {} }));
  };

  return {
    errors,
    prepareBeforeAssign,
    handleAssign,
    handleReAssign,
    handleAssignOrReassign,
    handleSolve,
    handleReSolve,
    handleSolveImmediate,
    handleApprove,
    handleDisapprove,
    handleTransmission,
  };
};

export default useTreatmentHandlers;
