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
| 7 | **Tableaux récapitulatifs faux après un filtrage.** Sur `/report/filtered`, les méthodes `StatsClaim` / `StatsDenun` reçoivent toutes le **même** objet filtre et le modifient (`request.setEtats(...)`). Chaque calcul hérite donc des états imposés par le précédent. Mesuré sur la base locale, sans aucun filtre choisi : « Nombre de réclamations traitées » = 6 (c'est le nombre de satisfaites) au lieu de 38 ; « Nombre de dénonciations Enregistrées » = 11 au lieu de 45 (les cartes KPI, elles, affichent bien 45). | Serveur : `ReportController.generateFilterReport()` (construction de `StatisticReport`) ; `StatsClaim`, `StatsDenun` (`setEtats` sur le filtre reçu) | Les tableaux récapitulatifs (et l'export Excel qui les reprend) sont faux dès que la page passe par `/report/filtered`, c'est-à-dire après tout filtrage et, pour un RA ou un agent, dès l'ouverture. La carte ne réutilise pas cet enchaînement (une copie du filtre par calcul) : ses chiffres sont justes et peuvent donc différer de ces tableaux. |
| 8 | Le « Taux de satisfaction(%) » du tableau récapitulatif divise les réclamations satisfaites **du filtre** par **toutes** les réclamations clôturées de l'institution (dénominateur jamais filtré). | Serveur : `StatsClaim.tauxSatisfaction()` | Sous un filtre (agence, période, objet), le taux est sous-estimé. |
| 9 | Lignes de gravité du tableau après filtrage : la requête renvoie une ligne **par objet**, le tableau gardait la dernière au lieu de les additionner (ex. Grave 1 au lieu de 15, Mineur 3 au lieu de 82). | Serveur : `StatsClaim` / `StatsDenun.totalByGravity()` | Gravités fausses dès que la page passe par `/report/filtered`. |
| 10 | « Dénonciations Faible non traitées » repartait du compteur de la ligne « Moyen » (erreur de copie) : 8 au lieu de 30. | Serveur : `StatsDenun.totalUnTreatByGravity()` | Ligne fausse, y compris sans filtre. |
| 11 | Suggestions sous un filtre par objet : le tableau affichait un nombre alors qu'une suggestion n'a pas d'objet (la section Suggestions, elle, est vidée). | Serveur : `StatsSuggest` ; interface : `sugTableStat` | Chiffre trompeur. |
| 12 | Avec un filtre par état, une fois le constat 7 corrigé, « Pourcentage réel » et « dans le délai » prenaient « tout sauf l'état choisi », brouillons compris (sans objet) : le rapport plantait (erreur 500). | Serveur : `StatsClaim.pourcentageReelReclamationsTraitees()` / `...DansDelai()` | À reporter **avec** la correction du constat 7, sinon le rapport plante sous un filtre par état. |
| 13 | **Non corrigé.** Les trois « taux de résolution » (`tauxResolutionObj`, `...Claim`, `...Denun`) remettent les états du filtre partagé à `null`. Tous les graphiques calculés après le 7e graphique de la vue d'ensemble ignorent donc le filtre par état (mesuré : filtre « Satisfaite », 6 réclamations en base ; les graphiques des onglets Réclamations, Dénonciations, Suggestions et les tableaux par agence affichent 117 / 45 / 40, comme sans filtre). | Serveur : `ReportServiceImpl` (3 `request.setEtats(null)`) ; ordre des appels dans `ReportController` | Graphiques faux sous un filtre par état. |
| 14 | **Non corrigé.** « Pourcentage des réclamations traitées dans le délai (%) » vaut toujours 0 : le calcul plante dès qu'une réclamation n'a pas de mesure de satisfaction, et l'erreur est avalée (`try/catch`). | Serveur : `StatsClaim.pourcentageReclamationsTraiteesDansDelai()` | Ligne toujours à 0. |
| 15 | **Non corrigé.** Le tableau des suggestions n'affiche que la première valeur de chaque bloc : « Prises en compte » et « Non prises en compte » arrivent ensemble, une seule des deux est affichée. | Interface : `sugTableStat` (`for ... return` sur la première clé) | Une ligne manque. |

Constats 7 à 12 corrigés sur la branche `fix/rapport-tableaux-recapitulatifs` (serveur `5e99711`, interface `39bd6f1`),
intégrée dans `feature/rapport-global-powerbi`.

## Corrections à reporter dans les autres projets

Vérifié en lecture seule le 2026-10-30, rien n'a été modifié dans ces projets. À traiter projet par projet après la
refonte, **en commençant par ceux qui sont en production**. Reprendre les commits serveur `5e99711` et interface `39bd6f1`
(les fichiers sont proches mais pas identiques : à adapter, pas à copier).

| Défaut | GPR Classique (`GPR\gpr_server_sicma_new_version`, `feature/deploy/sicma`) | RCPB (`GPR\GPR_RCPB\gpr_server_new_version-feature-deploy-rcpb`) | SAAS (`GPR SAAS\gpr_saas_server`, `develop`) | GPR Banque |
|---|---|---|---|---|
| 7. Filtre partagé modifié par les tableaux | oui (`/global` et `/filtered`) | oui (`/filtered`) | oui (`/filtered`) | à vérifier |
| 8. Taux de satisfaction non filtré | oui, identique | oui, pire : divise par toutes les réclamations enregistrées | en partie : filtré par agence seulement | à vérifier |
| 9. Gravité : dernier chiffre au lieu de la somme | oui | oui | oui | à vérifier |
| 10. « Faible non traitées » | oui | oui | oui | à vérifier |
| 11. Suggestions sous filtre par objet | oui | oui | oui | à vérifier |
| 12. Plantage sous filtre par état | à reporter avec le 7 | à reporter avec le 7 si le calcul y est le même | idem | à vérifier |
| 13. Taux de résolution qui effacent les états | oui (3 appels) | oui (3 appels) | oui (3 appels) | à vérifier |

Dossier de GPR Banque à confirmer.

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

## Export Power BI : limites connues (phase 5)

- **Format interne non documenté** : le fichier `.pbit` reprend le format que Power BI Desktop 2.159 (octobre 2026) écrit
  lui-même (ancien format « Layout », données saisies dans les requêtes Power Query). Microsoft ne documente pas ce format
  pour la génération : une version future de Power BI Desktop peut demander des ajustements. Testé sur cette version seulement.
- **Rendus sans équivalent exact** dans les visuels natifs : total au centre des anneaux, courbes lissées et ligne de moyenne
  du taux mensuel, coins arrondis des barres, valeurs masquées sous 8 % dans les barres empilées. Les chiffres sont les mêmes.
- **Carte** : nuage de points longitude / latitude sur une image des départements du Bénin (pas de fond OpenStreetMap, pour
  rester lisible hors connexion). Position des points approximative sur le fond. Hors Bénin : points sans fond.
- **Carte de chaleur** (objet × agence) : tableau croisé coloré ; les agences y sont dans l'ordre alphabétique.
- **Légende des barres empilées** : ordre alphabétique des séries (Power BI), et non l'ordre de la page.
