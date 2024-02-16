let cacheData = "appV1";
this.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(cacheData).then((cache) => {
            cache.addAll([
                '/static/js/main.chunk.js',
                '/static/js/0.chunk.js',
                '/static/js/bundle.js',
                '/static/css/main.chunk.css',
                '/bootstrap.min.css',
                '/index.html',
                '/',
                "/users",
                "/app-assets/fonts/fontawesome/css/fontawesome.min.css",
                "/app-assets/css/pages/data-tables.css",
                "/app-assets/vendors/data-tables/css/jquery.dataTables.min.css",
                "/app-assets/vendors/vendors.min.css",
                "/app-assets/vendors/data-tables/extensions/responsive/css/responsive.dataTables.min.css",
                "/app-assets/vendors/data-tables/css/select.dataTables.min.css",
                "/app-assets/js/vendors.js",
                "/app-assets/vendors/formatter/jquery.formatter.min.js",
                "/app-assets/js/plugins.js",
                "/app-assets/js/search.js",
                "/app-assets/js/custom/custom-script.js",
                "/app-assets/plugins/jquery.blockUI.js",
                "/app-assets/js/gauge.min.js",
                "/static/js/2.chunk.js",
                "/static/media/login_photo.b6d48ae7.png",
                "/static/media/pdf.8db9c70b.svg",
                "/static/media/excel.a476f2dd.svg",
                "/static/media/logo_gpr.b951fbe8.jpg",
                "/app-assets/data/locales/en.json",
    
            ])
        })
    )
})
this.addEventListener("fetch", (event) => {


    // console.warn("url",event.request.url)


    if (!navigator.onLine) {
        if (event.request.url === "http://localhost:3000/static/js/main.chunk.js") {
            event.waitUntil(
                this.registration.showNotification("Internet", {
                    body: "Pas d'accès à internet",
                })
            )
        }
        event.respondWith(
            caches.match(event.request).then((resp) => {
                if (resp) {
                    return resp
                }
                let requestUrl = event.request.clone();
                fetch(requestUrl)
            })
        )
    }
}) 