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

	test('antarctica', () => {
		const result = isInSunlight(1580081052020, [-88.491108, -82.801708]);
		expect(result).toBe(null);
	});

	test('arctic', () => {
		const result = isInSunlight(1580081052020, [-94.295244, 82.340691]);
		expect(result).toBe(null);
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
	
});

describe('extendsOverTerminator', () => {
	test('1', () => {
		const result = extendsOverTerminator(1580081052020, [-89.920624, 29.635978], [-85.689761, 30.444933]);
		expect(result).toBe(true);
	});

	test('2', () => {
		const result = extendsOverTerminator(1580085122132, [-69.628562, -78.157803], [-63.607043, -40.533248]);
		expect(result).toBe(true);
	});

	test('3', () => {
		const result = extendsOverTerminator(1580084524343, [-86.312530, -82.801708], [-84.906731, -78.617716]);
		expect(result).toBe(null);
	});

	test('4', () => {
		const result = extendsOverTerminator(1580087591239, [0, -71.25], [0, -70]);
		expect(result).toBe(false);
	});
});