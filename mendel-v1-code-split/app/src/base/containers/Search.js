import React from "react";
import createInstantSearch
    from "react-instantsearch/src/core/createInstantSearch";
import Hits from "react-instantsearch/src/widgets/Hits";
import SearchBox from "react-instantsearch/src/widgets/SearchBox";
import algoliasearch from "algoliasearch/lite";

const InstantSearch = createInstantSearch(algoliasearch, {
    Root: "div"
});

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
