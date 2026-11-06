// Contrôle du mot de passe en mode Offline, sans serveur : à chaque connexion en ligne réussie, le
// navigateur garde une empreinte du mot de passe (PBKDF2-SHA256 salé), jamais le mot de passe lui-même.
// Le calcul utilise l'outil de chiffrement du navigateur, disponible seulement en https ou sur localhost.
const CLE = "app-offline-verif";
const ITERATIONS = 210000;

export const CLE_EMPREINTE_OFFLINE = CLE;

const enBase64 = (octets) => btoa(String.fromCharCode(...new Uint8Array(octets)));
const depuisBase64 = (texte) => Uint8Array.from(atob(texte), (c) => c.charCodeAt(0));
const normaliser = (email) => String(email || "").trim().toLowerCase();

const calculer = async (motDePasse, sel, iterations) => {
  const cle = await crypto.subtle.importKey("raw", new TextEncoder().encode(motDePasse), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: sel, iterations }, cle, 256);
  return enBase64(bits);
};

const lire = () => {
  try {
    return JSON.parse(localStorage.getItem(CLE));
  } catch (e) {
    return null;
  }
};

export const memoriserMotDePasse = async (email, motDePasse) => {
  try {
    const sel = crypto.getRandomValues(new Uint8Array(16));
    const empreinte = await calculer(motDePasse, sel, ITERATIONS);
    localStorage.setItem(CLE, JSON.stringify({ email: normaliser(email), sel: enBase64(sel), iterations: ITERATIONS, empreinte }));
  } catch (e) {
    // Sans empreinte à jour, le mode Offline reste refusé : une ancienne empreinte ne doit pas rester valable.
    localStorage.removeItem(CLE);
  }
};

export const aUneEmpreinte = (email) => lire()?.email === normaliser(email);

export const verifierMotDePasse = async (email, motDePasse) => {
  const donnees = lire();
  if (!donnees || donnees.email !== normaliser(email)) return false;
  try {
    return (await calculer(motDePasse, depuisBase64(donnees.sel), donnees.iterations)) === donnees.empreinte;
  } catch (e) {
    return false;
  }
};
