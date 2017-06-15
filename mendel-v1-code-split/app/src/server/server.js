import express from "express";
import compression from "compression";
import path from "path";
import fs from "fs";

var cache = true;

let MendelMiddleware = require("mendel-middleware");
if (process.env.NODE_ENV !== "production") {
    MendelMiddleware = require("mendel-development-middleware");
}

if (String(process.env.MENDEL_CACHE) === "false") {
    cache = false;
}

const app = express();
app.use(compression());

app.use(MendelMiddleware());

app.get("/service-worker.js", (req, res, next) => {
    res.set("Content-Type", "application/javascript");
    next();
});

app.get("/service-worker.js", (req, res, next) => {
    req.mendel.setVariations([]);
    res.set("Content-Type", "application/javascript");
    const assets = [`"${req.mendel.getURL("lazy").substr(1)}"`];
    const sw = ``;
    var contents = fs.readFileSync(
        path.join(__dirname, "../../service-worker-test/service-worker.js"),
        "utf8"
    );

    res.send(contents);
    res.end();
});

// app.get("/service-worker.js", (req, res, next) => {
//     req.mendel.setVariations([]);
//     res.set("Content-Type", "application/javascript");
//     const assets = [`"${req.mendel.getURL("lazy").substr(1)}"`];
//     const sw = ``;
//
//     res.send(sw);
//     res.end();
// });

app.get("/*", (req, res, next) => {
    req.mendel.setVariations([]);

    var html = [
        "<!DOCTYPE html>",
        `<html><head>
        <script>
        'use strict';

        if ('serviceWorker' in navigator) {
          // Delay registration until after the page has loaded, to ensure that our
          // precaching requests don't degrade the first visit experience.
          // See https://developers.google.com/web/fundamentals/instant-and-offline/service-worker/registration
          window.addEventListener('load', function() {
            // Your service-worker.js *must* be located at the top-level directory relative to your site.
            // It won't be able to control pages unless it's located at the same level or higher than them.
            // *Don't* register service worker file in, e.g., a scripts/ sub-directory!
            // See https://github.com/slightlyoff/ServiceWorker/issues/468
            navigator.serviceWorker.register('service-worker.js').then(function(reg) {
              // updatefound is fired if service-worker.js changes.
              reg.onupdatefound = function() {
                // The updatefound event implies that reg.installing is set; see
                // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
                var installingWorker = reg.installing;

                installingWorker.onstatechange = function() {
                  switch (installingWorker.state) {
                    case 'installed':
                      if (navigator.serviceWorker.controller) {
                        // At this point, the old content will have been purged and the fresh content will
                        // have been added to the cache.
                        // It's the perfect time to display a "New content is available; please refresh."
                        // message in the page's interface.
                        console.log('New or updated content is available.');
                      } else {
                        // At this point, everything has been precached.
                        // It's the perfect time to display a "Content is cached for offline use." message.
                        console.log('Content is now available offline!');
                      }
                      break;

                    case 'redundant':
                      console.error('The installing service worker became redundant.');
                      break;
                  }
                };
              };
            }).catch(function(e) {
              console.error('Error during service worker registration:', e);
            });
          });
      }</script>
        </head><body>`,
        '<div id="main"></div>',
        bundle(req, "vendor"),
        bundle(req, "main"),
        // The full example supports on-demand loading, lazy bundle
        // is only loaded client-side when a button is clicked in the
        // application
        entryMap(req, "lazy"),
        "</body></html>"
    ].join("\n");

    res.send(html);
    res.end();
});

var bundleCache = {};
var entryMapCache = {};

function bundle(req, bundle) {
    var key = bundle + ":" + req.mendel.variations.join(":");
    if (!cache || !bundleCache[key]) {
        var url = req.mendel.getURL(bundle);
        bundleCache[key] = '<script src="' + url + '"></script>';
    }
    return bundleCache[key];
}

function entryMap(req, bundle) {
    var key = bundle + ":" + req.mendel.variations.join(":");
    if (!cache || !entryMapCache[key]) {
        // `req.mendel.getBundleEntries` contains all bundles as keys and arrays
        // of entries that were used (normalized by variations) as values. This
        // allows apps to create a specific logic with their bundles in the
        // runtime.
        var bundles = req.mendel.getBundleEntries();

        // In this particular case, entryMap will be used to expose to the client
        // the URL for bundles based on modules that are "exposed", meaning, after
        // loading the bundle, you can `require('entryName.js')` for any entry.
        var entryMapScript = [
            "<script>",
            "   (function(){",
            '       var nameSpace = "_mendelEntryMap";',
            '       var url = "' + req.mendel.getURL(bundle) + '";',
            "       window[nameSpace] = window[nameSpace] || {};",
            "       " +
                bundles[bundle]
                    .map(function(entry) {
                        return (
                            'window[nameSpace]["' + entry + '"] = ' + " url;"
                        );
                    })
                    .join("\n       "),
            "   })()",
            "</script>"
        ];
        entryMapCache[key] = entryMapScript.join("\n");
    }
    return entryMapCache[key];
}

var port = process.env.PORT ? process.env.PORT : 3002;
var hostname = require("os").hostname();

app.listen(port, function() {
    console.log("listening at %s port %s", hostname, port);
});
