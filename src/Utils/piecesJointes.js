// Règles communes aux formulaires réclamation, dénonciation et suggestion.
// Revérifiées côté serveur (utils/PiecesJointes.java) : ces contrôles donnent un retour immédiat à l'agent.
const MAX_FILES_COUNT = 5;
const MAX_AUDIOS_COUNT = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo par fichier ou audio
const MAX_TOTAL_ATTACHMENTS_SIZE = 100 * 1024 * 1024; // 100 Mo cumulés

const TYPE_AUTORISE = /^(application\/pdf|application\/msword|application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.(spreadsheetml\.sheet|wordprocessingml\.document)|image\/(jpeg|png)|audio\/.+|video\/.+)$/i;
const EXTENSION_AUTORISEE = /\.(pdf|docx?|xlsx?|jpe?g|png|ogg|mp3|wav|m4a|aac|opus|mp4|webm|mov|avi)$/i;

export const EMAIL_VALIDE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export const messageDateReception = (date) => (date ? "La date de réception ne peut pas dépasser la date du jour" : "Champ incorrect");

const sumFilesSize = (arr) => Array.from(arr || []).reduce((s, f) => s + (f?.size || 0), 0);
const toMB = (bytes) => Math.round(bytes / (1024 * 1024));

// Valide la liste finale des fichiers (après ajout) + les audios déjà enregistrés.
// Retourne true si OK, sinon affiche un message et retourne false.
export const checkFilesConstraints = (finalFilesArr, audioRecordingsArr) => {
  if (finalFilesArr.length > MAX_FILES_COUNT) {
    window.alert(`Vous ne pouvez pas joindre plus de ${MAX_FILES_COUNT} fichiers.`);
    return false;
  }
  for (const file of finalFilesArr) {
    if (!TYPE_AUTORISE.test(file.type || "") && !EXTENSION_AUTORISEE.test(file.name || "")) {
      window.alert(`Le fichier "${file.name}" n'est pas d'un type autorisé (PDF, Word, Excel, image, audio ou vidéo).`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      window.alert(`Le fichier "${file.name}" dépasse la taille maximale autorisée (${toMB(MAX_FILE_SIZE)} Mo).`);
      return false;
    }
  }
  const totalSize = sumFilesSize(finalFilesArr) + sumFilesSize(audioRecordingsArr);
  if (totalSize > MAX_TOTAL_ATTACHMENTS_SIZE) {
    window.alert(`La taille totale des pièces jointes dépasse la limite autorisée (${toMB(MAX_TOTAL_ATTACHMENTS_SIZE)} Mo).`);
    return false;
  }
  return true;
};

// Valide un nouvel enregistrement audio par rapport à ceux déjà présents + aux fichiers.
export const checkNewAudioConstraints = (existingAudioRecordings, newAudioBlob, filesArr) => {
  if (existingAudioRecordings.length >= MAX_AUDIOS_COUNT) {
    window.alert(`Vous ne pouvez pas joindre plus de ${MAX_AUDIOS_COUNT} enregistrements audio.`);
    return false;
  }
  if (newAudioBlob.size > MAX_FILE_SIZE) {
    window.alert(`L'enregistrement audio dépasse la taille maximale autorisée (${toMB(MAX_FILE_SIZE)} Mo).`);
    return false;
  }
  const totalSize = sumFilesSize(filesArr) + sumFilesSize(existingAudioRecordings) + newAudioBlob.size;
  if (totalSize > MAX_TOTAL_ATTACHMENTS_SIZE) {
    window.alert(`La taille totale des pièces jointes dépasse la limite autorisée (${toMB(MAX_TOTAL_ATTACHMENTS_SIZE)} Mo).`);
    return false;
  }
  return true;
};
