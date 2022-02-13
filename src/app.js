import React, { Fragment, useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	Navigate,
	useParams
} from "react-router-dom";
//import { hot } from "react-hot-loader/root";
import ReactDOM from "react-dom";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";

import reducer from "./reducers";
import { defaultSat } from "./consts";
import { Map, VisibleSatellites, Settings } from "./pages";
import { Header } from "./components";
import "./shared.css";
import styles from "./app.css";
import { BREAKPOINTS } from "./consts"
import { useWindowResize } from "./utils";;


const middleware = [ thunk ]
if (process.env.NODE_ENV !== 'production') {
  middleware.push(createLogger())
}

const store = createStore(
  reducer,
  applyMiddleware(...middleware)
)

function App() {
	const [{width, height, breakpoint}] = useWindowResize(BREAKPOINTS);
	document.documentElement.classList.remove("loading");

	useEffect(() => {
		// action - request geolocation
	}, []);

	return (
		<Provider store={store}>
			<Router>
				<React.StrictMode>
					<Header breakpoint={breakpoint} />
					<Routes>
						<Route path="/" element={<Navigate exact from="/" to={`/map/${defaultSat}`} />} />
						<Route path="/map" element={<Navigate exact from="/map" to={`/map/${defaultSat}`} />} />
						<Route path={`/map/:satellites`} element={<Map breakpoint={breakpoint} />} />
						<Route path="/visible-satellites-overhead" element={<VisibleSatellites breakpoint={breakpoint} />} />
						<Route path="/settings" element={<Settings breakpoint={breakpoint} />} />
					</Routes>
				</React.StrictMode>
			</Router>
		</Provider>
	);
}

export default App;
