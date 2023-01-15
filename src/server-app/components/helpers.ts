import type React from 'react';

export const takeValue = <T, U extends HTMLInputElement>(fn: (value: T) => void) =>
	(e: React.ChangeEvent<U>) => {
		fn(e.target.value as unknown as T);
	};

export const bind = <T>(value: T, setValue: (value: T) => void) => ({
	value,
	onChange: takeValue(setValue),
});
