import { useCallback, useEffect, useState } from "react";
import { slaForClaim } from "../../apis/Sla/SlaApi";

// Lit le suivi des délais d'une plainte sur le serveur (jamais de calcul de date côté navigateur).
// Renvoie { sla, refresh } ; sla vaut null si le SLA n'est pas actif, si la plainte n'est pas dans le périmètre
// de l'utilisateur, ou en cas d'erreur : l'écran reste alors identique à celui d'avant.
export default function useClaimSla(claimType, claimId) {
  const [sla, setSla] = useState(null);

  const refresh = useCallback(() => {
    if (!claimType || !claimId || claimType === "SUGGESTION") {
      setSla(null);
      return Promise.resolve();
    }
    return slaForClaim(claimType, claimId)
      .then((info) => setSla(info && info.state ? info : null))
      .catch(() => setSla(null));
  }, [claimType, claimId]);

  useEffect(() => {
    refresh();
    // l'échéance évolue avec le temps : relecture chaque minute
    const id = setInterval(refresh, 60 * 1000);
    return () => clearInterval(id);
  }, [refresh]);

  return { sla, refresh };
}
