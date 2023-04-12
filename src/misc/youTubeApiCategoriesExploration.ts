import {join} from 'path';
import {readFile} from 'fs/promises';

import {parse} from 'yaml';

import {findPackageJsonDir} from '../common/util';
import getYouTubeConfig from '../server/lib/config-loader/getYouTubeConfig';
import makeCreateYouTubeApi, {type CategoryListItem} from '../server/lib/youTubeApi';

const main = async () => {
	const root = await findPackageJsonDir(__dirname);
	const configJson = await readFile(join(root, 'config.yaml'), 'utf-8');
	const config = parse(configJson) as unknown;
	const youTubeConfig = getYouTubeConfig(config);

	const createApi = makeCreateYouTubeApi();
	const api = createApi(youTubeConfig, console.log);

	const compareCategoriesOfTwoRegions = async (regionA: string, regionB: string) => {
		type CategoriesMap = Map<string, CategoryListItem>;

		const [categoriesA, categoriesB] = await Promise.all([
			api.getCategoriesFromRegionCode(regionA),
			api.getCategoriesFromRegionCode(regionB),
		]);

		const toMap = (categories: CategoryListItem[]): CategoriesMap => {
			const map: CategoriesMap = new Map();

			for (const category of categories) {
				map.set(category.id, category);
			}

			return map;
		};

		const mapA = toMap(categoriesA);
		const mapB = toMap(categoriesB);

		if (mapA.size !== mapB.size) {
			console.log(
				`Categories of ${regionA} and ${regionB} differ in size,`,
				`region ${regionA} has ${mapA.size} categories,`,
				`while region ${regionB} has ${mapB.size} categories.`,
			);
		}

		for (const [id, categoryA] of mapA) {
			const categoryB = mapB.get(id);

			if (!categoryB) {
				console.log(
					`Category ${categoryA.snippet.title} (${id})`,
					`is only available in region ${regionA},`,
					`but not in region ${regionB}.`,
				);
			}
		}

		for (const [id, categoryB] of mapB) {
			const categoryA = mapA.get(id);

			if (!categoryA) {
				console.log(
					`Category ${categoryB.snippet.title} (${id})`,
					`is only available in region ${regionB},`,
					`but not in region ${regionA}.`,
				);
			}
		}

		for (const [id, categoryA] of mapA) {
			const categoryB = mapB.get(id);

			if (!categoryB) {
				continue;
			}

			if (categoryA.snippet.title !== categoryB.snippet.title) {
				console.log(
					`Category ${categoryA.snippet.title} (${id})`,
					`is called ${categoryB.snippet.title} in region ${regionB}.`,
				);
			}
		}
	};

	const regionA = 'US';
	const regionBs = ['FR', 'DE', 'GB', 'CA', 'AU', 'IT', 'JP', 'GR'];

	for (const regionB of regionBs) {
		// eslint-disable-next-line no-await-in-loop
		await compareCategoriesOfTwoRegions(regionA, regionB);
	}
};

main().catch(console.error);

