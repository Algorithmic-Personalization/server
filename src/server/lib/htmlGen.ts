type Attributes = Record<string, string>;

const attrs = (attributes?: Attributes): string => {
	if (!attributes) {
		return '';
	}

	const list = Object.entries(attributes).map(([key, value]) => `${key}="${value}"`).join(' ');
	return ` ${list}`;
};

export const t = (tag: string, attributes?: Attributes) => (...body: string[]) => `<${tag} ${attrs(attributes)}>${body.join(' ')}</${tag}>`;

export default t;
