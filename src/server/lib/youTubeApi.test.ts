import {isVideoAvailable} from './youTubeApi';

describe('isVideoAvailable', () => {
	it('should reply `true` for an available video', async () => {
		expect(await isVideoAvailable('Vg91dht58vE')).toBe(true);
	});

	it('should reply `false` for a private video', async () => {
		expect(await isVideoAvailable('mIbYcTuJOPo')).toBe(false);
	});

	it('should reply `false` for a deleted video', async () => {
		expect(await isVideoAvailable('0zLBgvymn74')).toBe(false);
	});
});
