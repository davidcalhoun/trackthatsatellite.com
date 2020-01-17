import React, { Fragment, useEffect } from "react";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	Redirect,
	useRouteMatch,
	useParams
} from "react-router-dom";
import { hot } from "react-hot-loader/root";
import ReactDOM from "react-dom";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";

import reducer from "./reducers";
import { defaultSat } from "./consts";
import { Map, VisibleSatellites, Settings } from "./pages";
import { Header } from "./components";
import styles from "./app.css";

const middleware = [ thunk ]
if (process.env.NODE_ENV !== 'production') {
  middleware.push(createLogger())
}

const store = createStore(
  reducer,
  applyMiddleware(...middleware)
)

function App() {
	document.documentElement.classList.remove("loading");

	useEffect(() => {
		// action - request geolocation
	});

	return (
		<Provider store={store}>
			<Router>
				<React.StrictMode>
					<Header />
					<Switch>
						<Redirect exact from="/" to={`/map/${defaultSat}`} />
						<Redirect exact from="/map" to={`/map/${defaultSat}`} />
						<Route path={`/map/:satellites`}>
							<Map />
						</Route>
						<Route path="/visible-satellites-overhead">
							<VisibleSatellites />
						</Route>
						<Route path="/settings">
							<Settings />
						</Route>
					</Switch>
				</React.StrictMode>
			</Router>
		</Provider>
	);
}

export default hot(App);
