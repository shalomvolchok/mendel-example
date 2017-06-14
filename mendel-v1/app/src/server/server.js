import express from "express";
import compression from "compression";

let MendelMiddleware = require("mendel-middleware");
if (process.env.NODE_ENV !== "production") {
    MendelMiddleware = require("mendel-development-middleware");
}

const app = express();
app.use(compression());

app.use(MendelMiddleware());

app.get("/*", (req, res, next) => {
    req.mendel.setVariations([]);

    const html = `
        <!doctype html>
        <html class="no-js" lang="">
        <head></head>
        <body>
          <div id="app"></div>
          <script src="${req.mendel.getURL("main")}"></script>
        </body>
        </html>
        `;
    res.send(html);
    res.end();
});

var port = process.env.PORT ? process.env.PORT : 3000;
var hostname = require("os").hostname();

app.listen(port, function() {
    console.log("listening at %s port %s", hostname, port);
});
