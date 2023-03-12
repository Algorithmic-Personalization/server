export class NotFoundError extends Error {
	public readonly name: string;
	public readonly code: number;

	constructor(message: string) {
		super(message);
		this.name = 'NotFoundError';
		this.code = 404;
	}
}

export default NotFoundError;
