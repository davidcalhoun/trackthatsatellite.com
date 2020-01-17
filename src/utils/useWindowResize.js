import { useState, useEffect } from "react";

export default function useWindowResize(breakpoints = {}) {
	const [{ width, height, breakpoint }, setDimensions] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
		breakpoint: getBreakpoint(window.innerWidth)
	});

	function getBreakpoint(screenWidth) {
		if (Object.keys(breakpoints).length > 0) {
			const points = Object.entries(breakpoints).sort(([name1, width1], [name2, width2]) => width2 < width1);

			return points.reduce((accum, [breakpoint, width]) => {
				if (screenWidth >= width) {
					return breakpoint;
				}

				return accum;
			}, "");
		}

		return "";
	}

	function handleResize() {
		// todo debounce

		setDimensions({ width: window.innerWidth, height: window.innerHeight, breakpoint: getBreakpoint(window.innerWidth) });
	}

	function set() {
		window.addEventListener("resize", handleResize);
	}

	function unset() {
		window.removeEventListener("resize", handleResize);
	}

	return [
		{ width, height, breakpoint },
		{ addResizeListener: set, removeResizeListener: unset }
	];
}
