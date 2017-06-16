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

app.get("*", (req, res, next) => {
    console.log(`----------- ${Date.now()} ------------`);
    console.log(req.path);
    next();
});

app.use(MendelMiddleware());

const bundleNames = fs
    .readdirSync(path.join(__dirname, "/client/base"))
    .map(file => file.replace(".js", ""));

const serviceWorkerFile = fs.readFileSync(
    path.join(__dirname, "../service-worker.js"),
    "utf8"
);

app.get("/service-worker.js", (req, res, next) => {
    req.mendel.setVariations([]);

    res.set("Content-Type", "application/javascript");

    res.send(
        serviceWorkerFile.replace(
            "PRE_CACHE_CONFIG",
            bundleNames.map(
                bundle => `"${req.mendel.getURL(bundle).substr(1)}"`
            )
        )
    );
    res.end();
});

app.get("/*", (req, res, next) => {
    req.mendel.setVariations([]);

    var html = [
        "<!DOCTYPE html>",
        `<html><head></head><body>`,
        '<div id="main"></div>',
        entryMap(req, "lazytwo"),
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
