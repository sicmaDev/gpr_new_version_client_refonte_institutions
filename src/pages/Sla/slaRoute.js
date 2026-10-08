import { loadItemFromSessionStorage } from "../../Utils/utils";

// Où ouvrir une plainte depuis le suivi des délais ou les alertes, et si la personne a le droit de le faire.
// Mêmes conditions que le menu : traitement, mesure de satisfaction et listes.

const LIST_STATUSES = ["SATISFIED", "LITIGATION"];
const MEASURE_STATUSES = ["TREAT", "TO_APPROUVED"];
// une dénonciation n'a pas de mesure de satisfaction : « traitée » vaut clôture
const DENUNCIATION_LIST_STATUSES = ["SATISFIED", "LITIGATION", "TREAT"];

const hasAny = (hbt, codes) => codes.some((c) => hbt.includes(c));

/**
 * @param item  { type, status, code, collectorId? }
 * @returns { url, allowed }   allowed = false : le bouton doit être grisé (la plainte ne concerne pas la personne)
 */
export const claimTarget = ({ type, status, code, collectorId }, user = loadItemFromSessionStorage("app-user")) => {
  const hbt = (user?.posteDto?.habilitations || "").split(",").map((s) => s.trim());
  const role = user?.additionalRole;
  const senior = role === "PILOTE" || role === "DE" || !!(user?.isRa || user?.ra);
  const registeredByMe = collectorId != null && user?.id != null && Number(collectorId) === Number(user.id);

  const allow = (ok) => ok || registeredByMe;
  const canSeeLists = hasAny(hbt, ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10", "H14"]);
  const canTreat = hasAny(hbt, ["H2", "H3", "H4", "H6"]) || senior;
  const canMeasure = hbt.includes("H5") || senior;

  if (type === "DENUNCIACION") {
    if (DENUNCIATION_LIST_STATUSES.includes(status)) {
      return { url: "/denonciations/liste/" + code, allowed: allow(canSeeLists) };
    }
    return { url: "/denonciations/traitement/" + code, allowed: allow(canTreat) };
  }
  if (LIST_STATUSES.includes(status)) {
    return { url: "/reclamations/liste/" + code, allowed: allow(canSeeLists) };
  }
  if (MEASURE_STATUSES.includes(status)) {
    return { url: "/reclamations/mesure/" + code, allowed: allow(canMeasure) };
  }
  return { url: "/reclamations/traitement/" + code, allowed: allow(canTreat) };
};

export const NOT_CONCERNED = "Cette plainte ne vous concerne pas";
