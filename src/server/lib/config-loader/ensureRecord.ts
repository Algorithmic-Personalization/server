export const ensureRecord = (x: unknown): x is Record<PropertyKey, unknown> => {
	if (typeof x !== 'object' || x === null) {
		throw new Error('Expected object');
	}

	return true;
};

export default ensureRecord;
