"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The users defined in this list will be allowed to create
// an admin account on the server.
// They'll need to confirm their email address before being
// able to log in.
const adminsWhitelist = new Set([
    'some-user@provider.tld',
]);
exports.default = adminsWhitelist;
//# sourceMappingURL=adminsWhitelist.dist.js.map