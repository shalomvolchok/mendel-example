const express = require("express");
const compression = require("compression");
const path = require("path");

const app = express();

app.use(compression());

// Serve static files
app.use(`/js`, express.static(path.join(__dirname, "docs/js")));
app.use(`/*`, express.static(path.join(__dirname, "docs/js")));

var port = process.env.PORT ? process.env.PORT : 3000;
var hostname = require("os").hostname();

app.listen(port, function() {
    console.log("listening at %s port %s", hostname, port);
});
