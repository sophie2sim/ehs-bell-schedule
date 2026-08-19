const CACHE_NAME = "ehs-bell-schedule-v3";

const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.webmanifest",
    "./icons/icon-192-2.png"
];


/* =========================
   INSTALL
   ========================= */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(async cache => {

                for (const file of APP_FILES) {

                    try {

                        await cache.add(file);

                        console.log(
                            "Cached:",
                            file
                        );

                    } catch (error) {

                        console.error(
                            "Could not cache:",
                            file,
                            error
                        );

                    }

                }

            })
            .then(() => {

                /*
                   Activate the new service worker
                   as soon as installation finishes.
                */

                return self.skipWaiting();

            })

    );

});


/* =========================
   MESSAGE
   ========================= */

self.addEventListener(
    "message",
    event => {

        /*
           Allows the page to tell a newly installed
           service worker to activate immediately.
        */

        if (
            event.data &&
            event.data.type === "SKIP_WAITING"
        ) {

            self.skipWaiting();

        }

    }
);


/* =========================
   ACTIVATE
   ========================= */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(name => {

                            return (
                                name !== CACHE_NAME
                            );

                        })
                        .map(name => {

                            console.log(
                                "Deleting old cache:",
                                name
                            );

                            return caches.delete(name);

                        })

                );

            })
            .then(() => {

                /*
                   Take control of all currently
                   open pages immediately.
                */

                return self.clients.claim();

            })

    );

});


/* =========================
   FETCH
   ========================= */

self.addEventListener("fetch", event => {

    /*
       Only handle GET requests.
    */

    if (event.request.method !== "GET") {

        return;

    }


    /*
       For navigations (opening/reloading the app),
       try the network FIRST.

       If GitHub is available, the newest version
       will be loaded and cached.

       If GitHub is unavailable, the previously
       cached version will be used.
    */

    if (
        event.request.mode ===
        "navigate"
    ) {

        event.respondWith(

            fetch(event.request)

                .then(response => {

                    if (
                        response &&
                        response.status === 200
                    ) {

                        const responseClone =
                            response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {

                                cache.put(
                                    "./index.html",
                                    responseClone
                                );

                            });

                    }

                    return response;

                })

                .catch(() => {

                    /*
                       No internet.

                       Use the last successfully
                       cached version.
                    */

                    return caches.match(
                        "./index.html"
                    );

                })

        );

        return;

    }


    /*
       For other files:

       1. Use the cached version if available.
       2. Otherwise fetch from GitHub Pages.
       3. Cache the successful response.
    */

    event.respondWith(

        caches.match(event.request)

            .then(cachedResponse => {

                if (cachedResponse) {

                    return cachedResponse;

                }


                return fetch(event.request)

                    .then(response => {

                        if (
                            response &&
                            response.status === 200 &&
                            response.type === "basic"
                        ) {

                            const responseClone =
                                response.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {

                                    cache.put(
                                        event.request,
                                        responseClone
                                    );

                                });

                        }

                        return response;

                    })

                    .catch(() => {

                        /*
                           Nothing was cached and
                           the network is unavailable.
                        */

                        return undefined;

                    });

            })

    );

});
