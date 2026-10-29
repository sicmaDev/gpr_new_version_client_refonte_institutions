# Constats annexes — rapport Global

Relevés pendant l'analyse du rapport Global (phase 1 de la refonte visuelle + export Power BI, branche
`feature/rapport-global-powerbi`). **Volontairement non corrigés** : la refonte ne touche pas à la logique.
Chaque point attend une décision.

| N° | Constat | Où | Effet |
|---|---|---|---|
| 1 | La jauge « Taux de résolution des plaintes » reçoit une prop `colors` qu'elle ignore : elle applique ses propres couleurs, dans l'ordre inverse (vert, jaune, rouge au lieu de rouge, jaune, vert). | `src/Utils/MyGaugeChart.js` ; appel dans `src/pages/Rapports/Global.js` (`reportMixteChart`) | Les couleurs affichées ne sont pas celles voulues par l'appel. |
| 2 | Le tableau récapitulatif des dénonciations n'a pas ses lignes dans le même ordre selon l'appel : `/report/global` commence par le total enregistré, `/report/filtered` par la répartition par gravité. | Serveur : `ReportController.java`, `DenunStatsAndValue` de `generatReport()` et de `generateFilterReport()` | Le tableau change d'ordre après un premier filtrage. |
| 3 | L'impression PDF/Word inclut trois graphiques même s'ils ont été retirés du modèle de rapport : évolution annuelle par agence, taux de satisfaction par agence, respect du délai des réclamations par agence (testés sur l'existence du graphique, pas sur la clé du modèle). | `Global.js`, `prepareToPrint()` | Un graphique retiré du modèle réapparaît dans le PDF/Word. |
| 4 | Pendant un rechargement du rapport, le message « Aucune réclamation (dénonciation, suggestion) ne correspond aux critères de tri » s'affiche brièvement : les données sont remises à `[]` avant l'appel (`cleanForm2`). | `Global.js`, `genereReport()` / `cleanForm2()` | Message trompeur pendant le chargement. |
| 5 | L'export Excel envoie les chiffres du rapport à un serveur externe (`REPORT_HOST` = `api.rapport.gprserver.com`) qui fabrique le fichier. | `src/apis/Rapports/GlobalsApi.js`, `reportNewVersionExport()` | Les données agrégées sortent vers ce serveur ; à garder en tête pour la sécurité de l'export Power BI. |
| 6 | « Évolution annuelle des réclamations, dénonciations, suggestions par agence » n'affiche que la **première série** envoyée par le serveur (`datasets[0]`) : le serveur renvoie une série par année, les autres années ne sont pas affichées. La refonte garde ce comportement à l'identique. | `Global.js` (`evolutionObjByYearAndAgence`) ; serveur `ReportServiceImpl.evolutionObjBySpAndYear()` | Si la période couvre plusieurs années, une seule année est visible (laquelle dépend de l'ordre renvoyé par la requête). |

## Décision à respecter avant un déploiement plus large

**Fond de la carte : serveur public OpenStreetMap réservé à la phase pilote.**
La cartographie du rapport Global utilise le serveur public de tuiles OpenStreetMap (`tile.openstreetmap.org`).
Sa politique d'usage n'autorise qu'un trafic modéré et impose la mention « © contributeurs OpenStreetMap » (toujours affichée).
**Avant un déploiement à plusieurs institutions, ce serveur devra être remplacé** par notre propre serveur de tuiles
(ou un fournisseur sous contrat). L'adresse du fond est un paramètre de configuration : le changement se fait sans redéveloppement.

## Proposition pour plus tard : identité GPR sur toute l'application (option C)

Le rapport Global adopte une identité plus sobre : cartes sur fond blanc avec fine bordure grise et couleur seulement
en accent, chiffres `#1E293B`, libellés `#64748B`, couleurs de section fixes (dénonciations `#B45309`, suggestions `#0F766E`,
taux et satisfaction `#5B4B8A`, délais `#2C7A9B`), couleurs de sens adoucies (`#2F855A`, `#C05621`, `#C53030`), et couleur
principale = couleur choisie par l'institution (`getPagePrimary`, corrigée si elle est trop claire ou trop proche d'une couleur de section).
**Le reste de l'application n'a pas été modifié** : il garde la palette par défaut de Tailwind (`#3B82F6`, `#F59E0B`, `#10B981`,
`#8B5CF6`, environ 40 fichiers) et des cartes à fond pastel (Réclamations, Dénonciations, Suggestions, Alertes, SLA…).
Proposition : appliquer plus tard cette identité à toute l'application, pour que le rapport et les autres écrans se ressemblent.
À décider et planifier séparément (hors chantier du rapport Global).
