import { useEffect, useState } from "react";

// « La page charge » : vrai entre KTApp.blockPage() et KTApp.unblockPage(), le voile que toutes les pages posent
// pendant qu'elles chargent ou actualisent leurs données. Les cartes KPI s'en servent pour afficher un indicateur
// qui tourne au lieu d'un chiffre provisoire.
let enCours = false;
const abonnes = new Set();

export const signalerChargementPage = (valeur) => {
  if (enCours === valeur) return;
  enCours = valeur;
  abonnes.forEach((f) => f(valeur));
};

export const useChargementPage = () => {
  const [valeur, setValeur] = useState(enCours);
  useEffect(() => {
    abonnes.add(setValeur);
    setValeur(enCours);
    return () => abonnes.delete(setValeur);
  }, []);
  return valeur;
};
