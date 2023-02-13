"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
exports.__esModule = true;
exports.ParticipantPageC = void 0;
var react_1 = __importStar(require("react"));
var react_router_1 = require("react-router");
var material_1 = require("@mui/material");
var adminApiProvider_1 = require("../adminApiProvider");
var videoListItem_1 = require("../../server/models/videoListItem");
var event_1 = require("../../common/models/event");
var showDate = function (d) {
    var date = new Date(d);
    return "".concat(date.toLocaleDateString(), " ").concat(date.toLocaleTimeString());
};
var showWatchtimeOrContextUrl = function (e) {
    var _a, _b;
    if (((_a = e.data) === null || _a === void 0 ? void 0 : _a.kind) === 'watchtime') {
        return "".concat(e.data.watchtime, " seconds");
    }
    return (_b = e.context) !== null && _b !== void 0 ? _b : '';
};
var LinkC = function (_a) {
    var href = _a.href, label = _a.label;
    return (react_1["default"].createElement("a", { target: '_blank', rel: 'noreferrer', href: href, style: {
            textDecoration: 'none',
            color: 'inherit'
        } },
        react_1["default"].createElement(material_1.Typography, { variant: 'body1', color: 'blue' }, label)));
};
var UrlC = function (_a) {
    var _b, _c;
    var url = _a.url, prefix = _a.prefix;
    var withYtHostName = url.startsWith('/') ? "https://youtube.com".concat(url) : url;
    var p = prefix !== null && prefix !== void 0 ? prefix : '';
    try {
        var u = new URL(withYtHostName);
        if (u.pathname === '/results') {
            return react_1["default"].createElement(LinkC, { href: withYtHostName, label: "".concat(p, "search: ").concat((_b = u.searchParams.get('search_query')) !== null && _b !== void 0 ? _b : '') });
        }
        if (u.pathname === '/watch') {
            return react_1["default"].createElement(LinkC, { href: withYtHostName, label: "".concat(p, "video: ").concat((_c = u.searchParams.get('v')) !== null && _c !== void 0 ? _c : '') });
        }
        return react_1["default"].createElement(LinkC, { href: withYtHostName, label: "".concat(p).concat(u.pathname) });
    }
    catch (e) {
        return react_1["default"].createElement(react_1["default"].Fragment, null,
            p,
            url);
    }
};
var RecommendationsListC = function (_a) {
    var data = _a.data, details = _a.details;
    var getDetails = function (item) {
        if (!details) {
            return '';
        }
        if (item.source === videoListItem_1.VideoType.NON_PERSONALIZED) {
            return 'np: ';
        }
        if (item.source === videoListItem_1.VideoType.PERSONALIZED) {
            return 'p: ';
        }
        return 'm: ';
    };
    return (react_1["default"].createElement("ul", { style: { listStyle: 'none' } }, data.map(function (item) { return (react_1["default"].createElement("li", { key: item.id },
        react_1["default"].createElement(UrlC, { url: item.url, prefix: getDetails(item) }))); })));
};
var RecommendationsC = function (_a) {
    var data = _a.data;
    return (react_1["default"].createElement(material_1.Grid, { container: true, sx: { pl: 8, mb: 2 } },
        react_1["default"].createElement(material_1.Grid, { item: true, xs: 12, sm: 4, lg: 3 },
            react_1["default"].createElement(material_1.Typography, { variant: 'body1', color: 'grey' },
                "Non-Personalized (",
                data.nonPersonalized.length,
                ")"),
            react_1["default"].createElement(RecommendationsListC, { data: data.nonPersonalized })),
        react_1["default"].createElement(material_1.Grid, { item: true, xs: 12, sm: 4, lg: 3 },
            react_1["default"].createElement(material_1.Typography, { variant: 'body1', color: 'grey' },
                "Personalized (",
                data.personalized.length,
                ")"),
            react_1["default"].createElement(RecommendationsListC, { data: data.personalized })),
        react_1["default"].createElement(material_1.Grid, { item: true, xs: 12, sm: 4, lg: 3 },
            react_1["default"].createElement(material_1.Typography, { variant: 'body1', color: 'grey', sx: { position: { md: 'relative' } } },
                "Shown (",
                data.shown.length,
                ")",
                react_1["default"].createElement("small", { style: { position: 'absolute', left: 0, top: '1.2rem' } }, "p: personalized, np: non personalized, m: mixed")),
            react_1["default"].createElement(RecommendationsListC, { data: data.shown, details: true }))));
};
var LegendC = function (_a) {
    var label = _a.label;
    if (!label) {
        return null;
    }
    return (react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: {
            display: 'block',
            fontSize: '0.8rem',
            color: 'grey'
        } },
        react_1["default"].createElement("strong", null, label)));
};
var EventC = function (_a) {
    var _b;
    var overview = _a.data, position = _a.position;
    var contextLegend = function () {
        if (overview.type === event_1.EventType.WATCH_TIME) {
            return 'watchtime';
        }
        if (overview.type === event_1.EventType.PAGE_VIEW || overview.type === event_1.EventType.RECOMMENDATIONS_SHOWN) {
            return 'previous page';
        }
        return 'context';
    };
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(material_1.Grid, { container: true, sx: { pl: 4 } },
            react_1["default"].createElement(material_1.Grid, { item: true, xs: 12, md: 2 },
                react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                    react_1["default"].createElement("strong", null, position),
                    ") ",
                    showDate(overview.createdAt))),
            react_1["default"].createElement(material_1.Grid, { item: true, xs: 12, md: 3 },
                react_1["default"].createElement(LegendC, { label: 'event type' }),
                react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } }, overview.type)),
            react_1["default"].createElement(material_1.Grid, { item: true, xs: 12, md: 2 },
                react_1["default"].createElement(LegendC, { label: contextLegend() }),
                react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                    react_1["default"].createElement(UrlC, { url: showWatchtimeOrContextUrl(overview) }))),
            react_1["default"].createElement(material_1.Grid, { item: true, xs: 12, md: 2 },
                react_1["default"].createElement(LegendC, { label: 'url' }),
                react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                    react_1["default"].createElement(UrlC, { url: overview.url }))),
            react_1["default"].createElement(material_1.Grid, { item: true, xs: 12, md: 3 },
                react_1["default"].createElement(LegendC, { label: 'extension version' }),
                react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } }, overview.extensionVersion))),
        react_1["default"].createElement(material_1.Box, { sx: { display: 'flex', alignItems: 'center' } }, ((_b = overview === null || overview === void 0 ? void 0 : overview.data) === null || _b === void 0 ? void 0 : _b.kind) === 'recommendations' && react_1["default"].createElement(RecommendationsC, { data: overview.data.recommendations }))));
};
var EventsListC = function (_a) {
    var count = _a.count, sessionUuid = _a.sessionUuid;
    var api = (0, adminApiProvider_1.useAdminApi)();
    var _b = __read((0, react_1.useState)([]), 2), events = _b[0], setEvents = _b[1];
    var _c = __read((0, react_1.useState)(true), 2), folded = _c[0], setFolded = _c[1];
    (0, react_1.useEffect)(function () {
        if (folded) {
            return;
        }
        api.getEventOverviews(sessionUuid).then(function (data) {
            if (data.kind === 'Success') {
                setEvents(data.value);
            }
        })["catch"](console.error);
    }, [sessionUuid, folded]);
    if (count === 0) {
        return react_1["default"].createElement(material_1.Typography, { variant: 'body1' }, "No events");
    }
    if (folded) {
        return (react_1["default"].createElement(material_1.Button, { variant: 'outlined', color: 'primary', sx: {
                m: 1
            }, onClick: function () {
                setFolded(false);
            } },
            "Unfold ",
            count,
            " events"));
    }
    if (events.length === 0) {
        return react_1["default"].createElement(material_1.Typography, { variant: 'body1' }, "Loading events...");
    }
    return (react_1["default"].createElement(material_1.Box, null,
        react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2, fontWeight: 'bold' } }, "Events (latest first)"),
        events.map(function (event, index) { return react_1["default"].createElement(EventC, { key: event.id, data: event, position: events.length - index }); }),
        react_1["default"].createElement(material_1.Button, { variant: 'outlined', color: 'primary', sx: {
                m: 1
            }, onClick: function () {
                setFolded(true);
            } },
            "Fold back ",
            count,
            " events")));
};
var SessionC = function (_a) {
    var data = _a.data;
    return (react_1["default"].createElement(material_1.Paper, { component: 'section', sx: { mb: 4, ml: 2, p: 2 } },
        react_1["default"].createElement(material_1.Typography, { variant: 'h4', sx: { mb: 2 } },
            "Session #",
            data.id),
        react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
            "Started on: ",
            showDate(data.startedAt)),
        react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
            "Ended on: ",
            showDate(data.endedAt)),
        react_1["default"].createElement(EventsListC, { count: data.eventCount, sessionUuid: data.uuid })));
};
var OverviewC = function (_a) {
    var data = _a.data;
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(material_1.Paper, { component: 'section', sx: { mb: 4, p: 2 } },
            react_1["default"].createElement(material_1.Typography, { variant: 'h3', sx: { mb: 2 } }, "Basic info"),
            react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                react_1["default"].createElement("strong", null, "Email:"),
                " ",
                data.email),
            react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                react_1["default"].createElement("strong", null, "Code:"),
                " ",
                data.code),
            react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                react_1["default"].createElement("strong", null, "Added on:"),
                " ",
                showDate(data.createdAt)),
            react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                react_1["default"].createElement("strong", null, "Last seen:"),
                " ",
                showDate(data.latestSessionDate)),
            react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                react_1["default"].createElement("strong", null, "First seen:"),
                " ",
                showDate(data.firstSessionDate)),
            react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                react_1["default"].createElement("strong", null, "Number of sessions:"),
                " ",
                data.sessionCount)),
        react_1["default"].createElement(material_1.Box, { component: 'section', sx: { mb: 4 } },
            react_1["default"].createElement(material_1.Typography, { variant: 'h3', sx: { mb: 2 } }, "Sessions (most recent first)"),
            data.sessions.length === 0 ? 'No sessions' : data.sessions.map(function (session) { return react_1["default"].createElement(SessionC, { key: session.id, data: session }); }))));
};
var ParticipantPageC = function () {
    var email = (0, react_router_1.useParams)().email;
    var api = (0, adminApiProvider_1.useAdminApi)();
    var _a = __read((0, react_1.useState)(undefined), 2), overview = _a[0], setOverview = _a[1];
    (0, react_1.useEffect)(function () {
        if (!email) {
            console.error('No email provided');
            return;
        }
        api.getParticipantOverview(email).then(function (res) {
            if (res.kind === 'Success') {
                setOverview(res.value);
            }
        })["catch"](function (err) {
            console.error(err);
        });
    }, [email]);
    var ui = (react_1["default"].createElement(material_1.Box, { component: 'section', sx: { mb: 4 } },
        react_1["default"].createElement(material_1.Typography, { variant: 'h2', sx: { mb: 2 } },
            "Participant: ",
            email),
        overview === undefined ? 'Loading...' : react_1["default"].createElement(OverviewC, { data: overview })));
    return ui;
};
exports.ParticipantPageC = ParticipantPageC;
exports["default"] = exports.ParticipantPageC;
