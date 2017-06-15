import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, browserHistory } from "react-router";

import Root from "./containers/Root";

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={Root} />
    </Router>,
    document.getElementById("main")
);
