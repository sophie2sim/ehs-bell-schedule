const CACHE_NAME = "ehs-bell-schedule-v1";

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
                            return caches.delete(name);
                        })

                );

            })
            .then(() => {

                return self.clients.claim();

            })

    );

});


/* =========================
   FETCH
   ========================= */

self.addEventListener("fetch", event => {

    /*
       The bell schedule is completely
       client-side, so cached files can
       be served without internet.
    */

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        caches.match(event.request)
            .then(cachedResponse => {

                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then(response => {

                        /*
                           Cache successful same-origin
                           responses for future offline use.
                        */

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
                           If navigation fails while offline,
                           return the cached application.
                        */

                        if (
                            event.request.mode ===
                            "navigate"
                        ) {

                            return caches.match(
                                "./index.html"
                            );

                        }

                    });

            })

    );

});
