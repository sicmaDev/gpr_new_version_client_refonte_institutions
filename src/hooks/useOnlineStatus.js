import { useEffect, useState } from "react";

// Détection live de la connectivité navigateur (navigator.onLine + events
// online/offline). Inexistant avant ce chantier — cf. audit "Offline — GPR"
// du 22/09/2026, section 4 : jusqu'ici l'app ne détectait jamais la perte de
// réseau en cours de session, seul un choix manuel à la connexion (app-mode)
// existait.
//
// navigator.onLine peut mentir (wifi connecté mais serveur injoignable) : ce
// hook donne seulement le signal navigateur. Le Sync Manager (Phase 5) fait sa
// propre vérification de connectivité réelle avant de synchroniser.
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};

export default useOnlineStatus;
