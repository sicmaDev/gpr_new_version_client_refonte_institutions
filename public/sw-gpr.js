/*
 * Copie de l'application GPR sur l'appareil, pour qu'elle s'ouvre même sans internet (mode hors ligne).
 *
 * - Ne garde que les fichiers de l'application elle-même (page, scripts, styles, images, polices).
 * - Ne touche JAMAIS aux échanges avec le serveur GPR (API) ni aux autres sites : ils passent
 *   directement, sans copie. (L'ancien public/sw.js interceptait tout, y compris l'API, et cassait la connexion.)
 * - La page est d'abord demandée au réseau (toujours la dernière version en ligne) ; sans réseau, la copie sert.
 *
 * Changer le nom de CACHE vide les anciennes copies au prochain chargement.
 */
const CACHE = "gpr-app-v1";
const BASE = new URL("./", self.location).pathname; // dossier où l'application est publiée
const POLICES = ["https://fonts.googleapis.com", "https://fonts.gstatic.com"];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const fichiers = [BASE, BASE + "index.html", BASE + "manifest.json", BASE + "favicon.ico"];
    // Tous les fichiers produits par la construction de l'application (liste fournie par React)
    try {
      const reponse = await fetch(BASE + "asset-manifest.json", { cache: "no-store" });
      if (reponse.ok) {
        const manifeste = await reponse.json();
        Object.values(manifeste.files || {})
          .filter((f) => typeof f === "string" && !f.endsWith(".map"))
          .forEach((f) => fichiers.push(new URL(f, self.location.origin + BASE).pathname));
      }
    } catch (e) {
      // sans liste : les fichiers seront copiés au fil de leur utilisation
    }
    // Fichiers chargés directement par la page (dossier public : app-assets, styles, scripts)
    try {
      const page = await (await fetch(BASE + "index.html", { cache: "no-store" })).text();
      for (const lien of page.matchAll(/(?:href|src)="([^"#?]+)/g)) {
        const url = new URL(lien[1], self.location.origin + BASE);
        if (url.origin === self.location.origin) {
          fichiers.push(url.pathname);
        }
      }
    } catch (e) {
      // idem
    }
    // Un fichier manquant n'empêche pas l'installation
    await Promise.all([...new Set(fichiers)].map((f) => cache.add(f).catch(() => null)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const noms = await caches.keys();
    await Promise.all(noms.filter((n) => n !== CACHE).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const requete = event.request;
  if (requete.method !== "GET") {
    return;
  }
  const url = new URL(requete.url);
  const memeSite = url.origin === self.location.origin;
  // Serveur GPR (API), WhatsApp, rapports, autres sites : jamais interceptés
  if (!memeSite && !POLICES.includes(url.origin)) {
    return;
  }
  if (memeSite && (url.pathname.includes("/api/") || url.pathname.endsWith("/sw-gpr.js"))) {
    return;
  }

  // La page : le réseau d'abord (dernière version), la copie sans réseau
  if (requete.mode === "navigate") {
    event.respondWith(
      fetch(requete)
        .then((reponse) => {
          if (reponse.ok) {
            const copie = reponse.clone();
            caches.open(CACHE).then((cache) => cache.put(BASE + "index.html", copie));
          }
          return reponse;
        })
        .catch(async () => (await caches.match(BASE + "index.html")) || (await caches.match(BASE)) || Response.error())
    );
    return;
  }

  // Les fichiers : la copie tout de suite si elle existe, mise à jour en arrière-plan
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const copie = await cache.match(requete);
      const reseau = fetch(requete)
        .then((reponse) => {
          if (reponse.ok || reponse.type === "opaque") {
            cache.put(requete, reponse.clone());
          }
          return reponse;
        })
        .catch(() => copie || Response.error());
      return copie || reseau;
    })
  );
});
