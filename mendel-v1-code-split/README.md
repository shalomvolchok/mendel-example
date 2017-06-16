dev
`npm run build-dev && npm run development`

production
`npm run build && npm run production`

This is a very rough work in progress, attempting to combine Mendel code-splitting with service worker pre-loading and caching.

In this example we utilize `sw-precache` to load all our bundles with a service worker and to serve them from the service worker, if they are available.

Since the service worker loads all modules in the background, any bundles that we are loading asynchronously (in this example on a button click), will be available almost immediately when clicking on the button.

When the server first starts, we parse the mendel output folder to get the list of bundles:
```js
const bundleNames = fs
    .readdirSync(path.join(__dirname, "/client/base"))
    .map(file => file.replace(".js", ""));
```

When the server starts we also load our service worker template. On each request, we set the variations and then calculate the mendel urls for each bundle. We then pass this into our template so they can be loaded and cached by our service worker.

```js
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
```

We register our service worker in `componentDidMount()` of our Root module.

```js
componentDidMount() {
    require("./RegisterServiceWorker");
}
```

Given that Mendel creates a unique hash url, based on bundle content. Our service worker should fetch new content whenever our bundles change, as our `service-worker.js` file will be updated with the new urls.
