// The users defined in this list will be allowed to create
// an admin account on the server.
// They'll need to confirm their email address before being
// able to log in.
const adminsWhitelist = new Set<string>([
	'some-user@provider.tld',
]);

export default adminsWhitelist;
