import {
	type DataSource,
	type Entity,
	type FindOptionsWhere,
} from 'typeorm';

import type Model from '../../common/lib/model';

export const saveAndUpdate = <E extends typeof Entity & Model>(dataSource: DataSource, constructor: E) => {
	const repo = dataSource.getRepository(constructor);

	return async (where: FindOptionsWhere<E>) =>
		async <F extends Partial<E>>(data: F) =>
			repo.update(
				{where},
				{...data},
			);
};
