import {randomToken} from '../server/lib/crypto';

const count = process.argv[2] ? Number(process.argv[2]) : 1000;

if (isNaN(count)) {
	console.error('Invalid count');
	process.exit(1);
}

console.log('email,code,arm');

for (let i = 0; i < count; i++) {
	const email = `${randomToken(10)}@example.com`;
	const code = randomToken(32);
	const arm = Math.random() < 0.5 ? 'control' : 'treatment';

	console.log(`${email},${code},${arm}`);
}
