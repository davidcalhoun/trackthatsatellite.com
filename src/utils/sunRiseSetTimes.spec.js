// import { isInSunlight, extendsOverTerminator } from "./sunRiseSetTimes";

import { isInSunlight, extendsOverTerminator } from "./sunRiseSetTimes";


describe('isInSunlight', () => {
	test('1', () => {
		const result = isInSunlight(1579807582968, [-60.414294, 53.311008]);
		expect(result).toBe(true);
	});

	test('2', () => {
		const result = isInSunlight(1579860000000, [-60.414294, 53.311008]);
		expect(result).toBe(false);
	});

	test('3', () => {
		const result = isInSunlight(1579870800000, [-60.414294, 53.311008]);
		expect(result).toBe(true);
	});

	test('5', () => {
		const result = isInSunlight(1580081052020, [-66.080800, -36.921343]);
		expect(result).toBe(true);
	});

	test('6', () => {
		const result = isInSunlight(1580081052020, [-48.373043, -7.075265]);
		expect(result).toBe(false);
	});

	test('7', () => {
		const result = isInSunlight(1580081052020, [-77.656337, 35.384426]);
		expect(result).toBe(false);
	});

	test('kansas', () => {
		const result = isInSunlight(1580081052020, [-98.406698, 37.942856]);
		expect(result).toBe(true);
	});

	test('8', () => {
		const result = isInSunlight(1580085495467, [178, -70]);
		expect(result).toBe(true);
	});

	test('8', () => {
		const result = isInSunlight(1580085495467, [178, -70]);
		expect(result).toBe(true);
	});

	test('9', () => {
		const result = isInSunlight(1580087591239, [-71.25, 0]);
		expect(result).toBe(false);
	});

	test('12', () => {
		const result = isInSunlight(1580163005594, [-149.144400, 65.036903]);
		expect(result).toBe(true);
	});

	test('arctic winter', () => {
		const result = isInSunlight(1613106000000, [1, 90]);
		expect(result).toBe(null);
	});

	test('arctic winter', () => {
		const result = isInSunlight(1613106000000, [1, 75]);
		expect(result).toBe(null);
	});

	test('antarctic winter', () => {
		const result = isInSunlight(1594785600000, [1, -90]);
		expect(result).toBe(null);
	});
});

describe('extendsOverTerminator', () => {
	const caryCoords = [-78.8878605, 35.561203];
	const indiaCoords = [77.5001132, 18.4467642];

	test('1', () => {
		const result = extendsOverTerminator(1599936624781, caryCoords, indiaCoords);
		expect(result).toBe(true);
	});

	test('2', () => {
		const result = extendsOverTerminator(1599936624781, [-20.9735549, 21.6970831], indiaCoords);
		expect(result).toBe(true);
	});

	test('3', () => {
		const result = extendsOverTerminator(1599936624781, [-20.9735549, 21.6970831], [15.5907279, 16.8859513]);
		expect(result).toBe(true);
	});

	test('antarctic summer', () => {
		const result = extendsOverTerminator(1613106000000, [1, -89], [-2, -88]);
		expect(result).toBe(null);
	});

	test('antarctic winter', () => {
		const result = extendsOverTerminator(1594785600000, [1, -89], [-2, -88]);
		expect(result).toBe(null);
	});

	test('arctic winter', () => {
		const result = extendsOverTerminator(1613106000000, [1, 89], [-2, 88]);
		expect(result).toBe(null);
	});

	test('arctic summer', () => {
		const result = extendsOverTerminator(1594785600000, [1, 89], [-2, 88]);
		expect(result).toBe(null);
	});
// 
// 	test('arctic equinox', () => {
// 		const result = extendsOverTerminator(1600747200000, [1, 89], [-2, 88]);
// 		expect(result).toBe(null);
// 	});
// 
// 	test('antarctic equinox', () => {
// 		const result = extendsOverTerminator(1600747200000, [1, 89], [-2, 88]);
// 		expect(result).toBe(null);
// 	});

	test('cary sunset', () => {
		const result = extendsOverTerminator(1599952800000, caryCoords, [-76.4181202, 35.8902675]);
		expect(result).toBe(true);
	});
});