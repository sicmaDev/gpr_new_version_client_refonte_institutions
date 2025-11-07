import { useEffect } from "react";

/**
 * Hook pour scroller automatiquement un élément vers le bas ou le haut.
 * @param {Object} ref - le ref React de l’élément à scroller
 * @param {Array} deps - tableau de dépendances pour déclencher le scroll
 * @param {string} position - "bottom" ou "top"
 */
export const useAutoScroll = (ref, deps = [], position = "bottom") => {
  useEffect(() => {
    if (!ref.current) return;

    if (position === "bottom") {
      ref.current.scrollIntoView({ behavior: "smooth", block: "end" });
    } else if (position === "top") {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, deps);
};
