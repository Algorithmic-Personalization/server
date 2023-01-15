import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import {type Maybe, has} from '../../common/util';

export const randomToken = (size = 128) => crypto.randomBytes(size).toString('hex');

export const hashPassword = async (password: string): Promise<string> => new Promise((resolve, reject) => {
	bcrypt.hash(password, 10, (err, hash) => {
		if (err) {
			reject(err);
			return;
		}

		resolve(hash);
	});
});

export const checkPassword = async (password: string, hash: string): Promise<boolean> => new Promise((resolve, reject) => {
	bcrypt.compare(password, hash, (err, result) => {
		if (err) {
			reject(err);
			return;
		}

		resolve(result);
	});
});

export type TokenTools = {
	sign: (expiresIn: string, adminId: number) => string;
	verify: (token: string) => Maybe<{adminId: number}>;
};

export const createTokenTools = (secretKey: string): TokenTools => ({
	sign: (expiresIn, adminId) => jwt.sign({adminId}, secretKey, {expiresIn, algorithm: 'RS256'}),
	verify(token) {
		try {
			const json = jwt.verify(token, secretKey, {algorithms: ['RS256']}) as Record<string, unknown>;

			if (!has('iat')(json) || !has('exp')(json) || typeof json.iat !== 'number' || typeof json.exp !== 'number') {
				return {
					kind: 'Failure',
					message: 'Invalid token contents',
				};
			}

			if (!has('adminId')(json) || typeof json.adminId !== 'number') {
				return {
					kind: 'Failure',
					message: 'Missing adminId in token',
				};
			}

			const iat = new Date(json.iat * 1000);
			const exp = new Date(json.exp * 1000);

			if (iat > exp) {
				return {
					kind: 'Failure',
					message: 'Token expired',
				};
			}

			const {adminId} = json;
			return {kind: 'Success', value: {adminId}};
		} catch (err) {
			return {
				kind: 'Failure',
				message: 'Invalid token',
			};
		}
	},
});

