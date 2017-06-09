/* Copyright 2015, Yahoo Inc.
   Copyrights licensed under the MIT License.
   See the accompanying LICENSE file for terms. */

import React from "react";
import { InstantSearch, Hits, SearchBox } from "react-instantsearch/dom";

class Lazy extends React.Component {
    render() {
        return (
            <InstantSearch
                appId={"latency"}
                apiKey={"3d9875e51fbd20c7754e65422f7ce5e1"}
                indexName={"bestbuy"}
            >
                <SearchBox />
                <Hits />
            </InstantSearch>
        );
    }
}

export default Lazy;
