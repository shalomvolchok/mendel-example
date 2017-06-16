import React from "react";
import loadAsyncModule from "../loadAsyncModule";

let LazySearch;
let LazyTwo;

class Root extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            lazytwo: false
        };
        this.handleClick = this.handleClick.bind(this);
        this.loadLazyTwo = this.loadLazyTwo.bind(this);
    }

    componentDidMount() {
        require("./RegisterServiceWorker");
        this.loadLazyTwo();
    }

    handleClick() {
        var self = this;
        if (!this.state.loaded) {
            loadAsyncModule(
                function inputRequire() {
                    return require("./Search");
                },
                function success(module) {
                    LazySearch = module.default;
                    self.setState({
                        loaded: true
                    });
                },
                function failure() {
                    alert("Something went wrong");
                }
            );
        }
    }

    loadLazyTwo() {
        var self = this;
        if (!this.state.lazytwo) {
            loadAsyncModule(
                function inputRequire() {
                    return require("./LazyTwo");
                },
                function success(module) {
                    LazyTwo = module.default;
                    self.setState({
                        lazytwo: true
                    });
                },
                function failure() {
                    alert("Something went wrong");
                }
            );
        }
    }

    render() {
        let extras;

        if (this.state.loaded) {
            extras = <LazySearch />;
        } else {
            extras = <button onClick={this.handleClick}>Load Search</button>;
        }

        return (
            <div>
                Hello world from Root
                {extras}
                {this.state.lazytwo ? <LazyTwo /> : <div>Loading...</div>}
            </div>
        );
    }
}

export default Root;
