const CACHE_NAME = "ehs-bell-schedule-v3";

const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.webmanifest",
    "./icons/icon-192.png"
    // "./icons/icon-512.png"
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
                   immediately instead of waiting for
                   all old app tabs to close.
                */

                return self.skipWaiting();

            })

    );

});


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
                   Take control of the app immediately.
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
       Only handle requests belonging
       to this website/app.

       External requests are left alone.
    */

    const requestURL =
        new URL(event.request.url);

    if (
        requestURL.origin !== self.location.origin
    ) {

        return;

    }


    event.respondWith(

        /*
           IMPORTANT:

           NETWORK FIRST.

           Every time the app requests a file,
           we try GitHub/your hosted website FIRST.

           This means when you update index.html
           on GitHub, the phone can receive the
           updated version without reinstalling.
        */

        fetch(event.request)

            .then(response => {

                /*
                   Only cache successful responses.
                */

                if (
                    response &&
                    response.status === 200
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

                /*
                   Give the freshly downloaded
                   version to the app immediately.
                */

                return response;

            })

            .catch(() => {

                /*
                   No internet?

                   Use the cached version instead.

                   This is what keeps the PWA
                   working offline.
                */

                return caches.match(
                    event.request
                );

            })

    );

});
