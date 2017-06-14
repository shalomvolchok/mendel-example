import React from "react";
import { InstantSearch, Hits, SearchBox } from "react-instantsearch/dom";

class Root extends React.Component {
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

export default Root;
