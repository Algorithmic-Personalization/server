import {type Request} from 'express';

export type Page<T> = {
	results: T[];
	page: number;
	pageSize: number;
	pageCount: number;
};

export type PaginationRequest = {
	page: number;
	pageSize: number;
};

export const extractPaginationRequest = (req: Request, defaultPageSize = 15): PaginationRequest => {
	const {page} = req.params;
	const {pageSize} = req.query;

	const pageNumber = (page === undefined || !Number.isInteger(Number(page)))
		? 0 : Number(page);

	const pageSizeNumber = (pageSize === undefined || !Number.isInteger(Number(pageSize)))
		? defaultPageSize : Math.max(0, Math.min(Number(pageSize), defaultPageSize));

	return {
		page: pageNumber,
		pageSize: pageSizeNumber,
	};
};

export default Page;
