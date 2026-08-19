const CACHE_NAME = "ehs-bell-schedule-v2";
const CACHE_NAME = "ehs-bell-schedule-v3";

const APP_FILES = [
    "./",
    self.addEventListener("install", event => {
            })
            .then(() => {

                /*
                   Activate the new service worker
                   as soon as installation finishes.
                */

                return self.skipWaiting();

            })
    self.addEventListener("install", event => {
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
    self.addEventListener("activate", event => {
    self.addEventListener("fetch", event => {

    /*
       The bell schedule is completely
       client-side, so cached files can
       be served without internet.
       Only handle GET requests.
    */

    if (event.request.method !== "GET") {

        return;

    }


    /*
       For navigations (opening/reloading the app),
       try the network FIRST.

       This is important because your app lives
       on GitHub Pages and you want new versions
       to be detected without reinstalling.
    */

    if (
        event.request.mode ===
        "navigate"
    ) {

        event.respondWith(

            fetch(event.request)

                .then(response => {

                    /*
                       Save the newest index.html
                       in the cache.
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
                                    "./index.html",
                                    responseClone
                                );

                            });

                    }

                    return response;

                })

                .catch(() => {

                    /*
                       If there is no internet,
                       use the cached application.
                    */

                    return caches.match(
                        "./index.html"
                    );

                })

        );

        return;

    }


    /*
       For other files, use cache first.

       If the file isn't cached yet, fetch it
       from GitHub Pages and cache it.
    */

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
                    .then(response => {

                        if (
                            response &&
                                self.addEventListener("fetch", event => {
                        return response;

                    })

                    .catch(() => {

                        /*
                           If navigation fails while offline,
                           return the cached application.
                           Nothing was cached and the
                           network is unavailable.
                        */

                        if (
                            event.request.mode ===
                            "navigate"
                        ) {

                            return caches.match(
                                "./index.html"
                            );

                        }
                        return undefined;

                    });
