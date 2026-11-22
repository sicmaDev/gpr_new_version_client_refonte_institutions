// Après un traitement en session : retour à la liste de traitement de la page où l'on est.
// GPR range la page dans la partie « # » de l'adresse (avant, on lisait la partie fixe : la page
// du dossier était seulement rechargée et restait vide, le dossier étant traité).
export const retourListeTraitement = () => {
  const page = window.location.hash || "";
  if (page.includes("/reclamations/traitement")) rechargerSur("/reclamations/traitement/all");
  else if (page.includes("/denonciations/traitement")) rechargerSur("/denonciations/traitement/all");
  else window.location.reload();
};

// Après une déconnexion : rechargement complet de l'application, directement sur la page voulue.
// L'adresse est changée sans réafficher la page, puis on recharge : l'écran de connexion n'apparaît
// qu'une fois l'application rechargée. Avant, il s'affichait tout de suite, on commençait à le remplir,
// puis le rechargement arrivait et vidait le formulaire.
export const rechargerSur = (route = "/login") => {
  window.history.replaceState(null, "", window.location.pathname + window.location.search + "#" + route);
  // Pendant le rechargement, on ne peut plus cliquer sur l'ancienne page.
  document.body.style.pointerEvents = "none";
  document.body.style.opacity = "0.6";
  window.location.reload();
};
