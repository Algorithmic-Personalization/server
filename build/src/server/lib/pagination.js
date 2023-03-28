"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPaginationRequest = void 0;
const extractPaginationRequest = (req, defaultPageSize = 15) => {
    const { page } = req.params;
    const { pageSize } = req.query;
    const pageNumber = (page === undefined || !Number.isInteger(Number(page)))
        ? 0 : Number(page);
    const pageSizeNumber = (pageSize === undefined || !Number.isInteger(Number(pageSize)))
        ? defaultPageSize : Math.max(0, Math.min(Number(pageSize), defaultPageSize));
    return {
        page: pageNumber,
        pageSize: pageSizeNumber,
    };
};
exports.extractPaginationRequest = extractPaginationRequest;
//# sourceMappingURL=pagination.js.map