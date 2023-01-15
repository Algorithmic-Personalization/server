"use strict";
exports.__esModule = true;
exports.extractPaginationRequest = void 0;
var extractPaginationRequest = function (req, defaultPageSize) {
    if (defaultPageSize === void 0) { defaultPageSize = 15; }
    var page = req.params.page;
    var pageSize = req.query.pageSize;
    var pageNumber = (page === undefined || !Number.isInteger(Number(page)))
        ? 0 : Number(page);
    var pageSizeNumber = (pageSize === undefined || !Number.isInteger(Number(pageSize)))
        ? defaultPageSize : Math.max(0, Math.min(Number(pageSize), defaultPageSize));
    return {
        page: pageNumber,
        pageSize: pageSizeNumber
    };
};
exports.extractPaginationRequest = extractPaginationRequest;
