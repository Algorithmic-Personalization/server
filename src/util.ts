type AsyncFn = () => Promise<void>;

type Lock = {
	running?: Promise<void>;
	queue: AsyncFn[];
};

const locks = new Map<string, Lock>();

const unstackLock = async (id: string) => {
	const stack = locks.get(id);

	if (!stack) {
		return;
	}

	if (stack.queue.length === 0) {
		return;
	}

	if (!stack.running) {
		const fn = stack.queue.shift();
		if (fn) {
			stack.running = fn();
			await stack.running;
			stack.running = undefined;
			await unstackLock(id);
			const newStack = locks.get(id);
			if (newStack && newStack.queue.length === 0) {
				locks.delete(id);
			}
		}
	}
};

export const withLock = (id: string) => async (fn: AsyncFn): Promise<void> => {
	if (!locks.has(id)) {
		locks.set(id, {running: undefined, queue: []});
	}

	const lock = locks.get(id);

	if (!lock) {
		// Never happens but makes TS happy
		throw new Error('Lock is not defined');
	}

	lock.queue.push(fn);

	return unstackLock(id);
};

export const daysElapsed = (fromDate: Date, toDate: Date): number => {
	const from = new Date(fromDate);
	const to = new Date(toDate);
	from.setHours(0, 0, 0, 0);
	to.setHours(0, 0, 0, 0);
	return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
};
