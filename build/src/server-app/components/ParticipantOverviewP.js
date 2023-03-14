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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.ParticipantPageC = void 0;
var react_1 = __importStar(require("react"));
var react_router_1 = require("react-router");
var material_1 = require("@mui/material");
var adminApiProvider_1 = require("../adminApiProvider");
var videoListItem_1 = require("../../server/models/videoListItem");
var event_1 = require("../../common/models/event");
var NotificationsC_1 = __importDefault(require("./shared/NotificationsC"));
var util_1 = require("./shared/util");
var showWatchtimeOrContextUrl = function (e) {
    var _a, _b;
    if (((_a = e.data) === null || _a === void 0 ? void 0 : _a.kind) === 'watchtime') {
        return "".concat(e.data.watchtime, " seconds");
    }
    return (_b = e.context) !== null && _b !== void 0 ? _b : '';
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
        react_1["default"].createElement(util_1.UrlC, { url: item.url, prefix: getDetails(item) }))); })));
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
                    (0, util_1.showDate)(overview.createdAt))),
            react_1["default"].createElement(material_1.Grid, { item: true, xs: 12, md: 3 },
                react_1["default"].createElement(LegendC, { label: 'event type' }),
                react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } }, overview.type)),
            react_1["default"].createElement(material_1.Grid, { item: true, xs: 12, md: 2 },
                react_1["default"].createElement(LegendC, { label: contextLegend() }),
                react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                    react_1["default"].createElement(util_1.UrlC, { url: showWatchtimeOrContextUrl(overview) }))),
            react_1["default"].createElement(material_1.Grid, { item: true, xs: 12, md: 2 },
                react_1["default"].createElement(LegendC, { label: 'url' }),
                react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                    react_1["default"].createElement(util_1.UrlC, { url: overview.url }))),
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
            "Session UUID: ",
            data.uuid),
        react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
            "Started on: ",
            (0, util_1.showDate)(data.startedAt)),
        react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
            "Ended on: ",
            (0, util_1.showDate)(data.endedAt)),
        react_1["default"].createElement(EventsListC, { count: data.eventCount, sessionUuid: data.uuid })));
};
var OverviewC = function (_a) {
    var data = _a.data;
    var _b = __read((0, react_1.useState)(data.phase), 2), phase = _b[0], setPhase = _b[1];
    var _c = __read((0, react_1.useState)(), 2), message = _c[0], setMessage = _c[1];
    var api = (0, adminApiProvider_1.useAdminApi)();
    var handlePhaseChange = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var targetPhase, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    targetPhase = parseInt(e.target.value, 10);
                    setPhase(targetPhase);
                    return [4 /*yield*/, api.updateParticipantPhase(data.email, targetPhase)];
                case 1:
                    result = _a.sent();
                    if (result.kind === 'Success') {
                        setMessage({ severity: 'success', text: 'Phase updated' });
                        return [2 /*return*/];
                    }
                    setMessage({ severity: 'error', text: 'Failed to update phase' });
                    return [2 /*return*/];
            }
        });
    }); };
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(material_1.Paper, { component: 'section', sx: { mb: 4, p: 2 } },
            react_1["default"].createElement(NotificationsC_1["default"], { message: message }),
            react_1["default"].createElement(material_1.Typography, { variant: 'h3', sx: { mb: 2 } }, "Basic info"),
            react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                react_1["default"].createElement("strong", null, "Email:"),
                " ",
                data.email),
            react_1["default"].createElement(material_1.FormControl, { sx: { mb: 2 } },
                react_1["default"].createElement(material_1.InputLabel, { id: 'phase-label' }, "Phase"),
                react_1["default"].createElement(material_1.Select, { labelId: 'phase-label', value: phase, label: 'Phase', onChange: handlePhaseChange },
                    react_1["default"].createElement(material_1.MenuItem, { value: 0 }, "Pre-Experiment"),
                    react_1["default"].createElement(material_1.MenuItem, { value: 1 }, "Experiment"),
                    react_1["default"].createElement(material_1.MenuItem, { value: 2 }, "Post-Experiment Observation"))),
            react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                react_1["default"].createElement("strong", null, "Code:"),
                " ",
                data.code),
            react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                react_1["default"].createElement("strong", null, "Added on:"),
                " ",
                (0, util_1.showDate)(data.createdAt)),
            react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                react_1["default"].createElement("strong", null, "Last seen:"),
                " ",
                (0, util_1.showDate)(data.latestSessionDate)),
            react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                react_1["default"].createElement("strong", null, "First seen:"),
                " ",
                (0, util_1.showDate)(data.firstSessionDate)),
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
