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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipantPageC = void 0;
const react_1 = __importStar(require("react"));
const react_router_1 = require("react-router");
const material_1 = require("@mui/material");
const adminApiProvider_1 = require("../adminApiProvider");
const videoListItem_1 = require("../../server/models/videoListItem");
const event_1 = require("../../common/models/event");
const NotificationsC_1 = __importDefault(require("./shared/NotificationsC"));
const util_1 = require("./shared/util");
const showWatchtimeOrContextUrl = (e) => {
    var _a, _b;
    if (((_a = e.data) === null || _a === void 0 ? void 0 : _a.kind) === 'watchtime') {
        return `${e.data.watchtime} seconds`;
    }
    return (_b = e.context) !== null && _b !== void 0 ? _b : '';
};
const RecommendationsListC = ({ data, details }) => {
    const getDetails = (item) => {
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
    return (react_1.default.createElement("ul", { style: { listStyle: 'none' } }, data.map(item => (react_1.default.createElement("li", { key: item.id },
        react_1.default.createElement(util_1.UrlC, { url: item.url, prefix: getDetails(item) }))))));
};
const RecommendationsC = ({ data }) => (react_1.default.createElement(material_1.Grid, { container: true, sx: { pl: 8, mb: 2 } },
    react_1.default.createElement(material_1.Grid, { item: true, xs: 12, sm: 4, lg: 3 },
        react_1.default.createElement(material_1.Typography, { variant: 'body1', color: 'grey' },
            "Non-Personalized (",
            data.nonPersonalized.length,
            ")"),
        react_1.default.createElement(RecommendationsListC, { data: data.nonPersonalized })),
    react_1.default.createElement(material_1.Grid, { item: true, xs: 12, sm: 4, lg: 3 },
        react_1.default.createElement(material_1.Typography, { variant: 'body1', color: 'grey' },
            "Personalized (",
            data.personalized.length,
            ")"),
        react_1.default.createElement(RecommendationsListC, { data: data.personalized })),
    react_1.default.createElement(material_1.Grid, { item: true, xs: 12, sm: 4, lg: 3 },
        react_1.default.createElement(material_1.Typography, { variant: 'body1', color: 'grey', sx: { position: { md: 'relative' } } },
            "Shown (",
            data.shown.length,
            ")",
            react_1.default.createElement("small", { style: { position: 'absolute', left: 0, top: '1.2rem' } }, "p: personalized, np: non personalized, m: mixed")),
        react_1.default.createElement(RecommendationsListC, { data: data.shown, details: true }))));
const LegendC = ({ label }) => {
    if (!label) {
        return null;
    }
    return (react_1.default.createElement(material_1.Typography, { variant: 'body1', sx: {
            display: 'block',
            fontSize: '0.8rem',
            color: 'grey',
        } },
        react_1.default.createElement("strong", null, label)));
};
const EventC = ({ data: overview, position }) => {
    var _a;
    const contextLegend = () => {
        if (overview.type === event_1.EventType.WATCH_TIME) {
            return 'watchtime';
        }
        if (overview.type === event_1.EventType.PAGE_VIEW || overview.type === event_1.EventType.RECOMMENDATIONS_SHOWN) {
            return 'previous page';
        }
        return 'context';
    };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(material_1.Grid, { container: true, sx: { pl: 4 } },
            react_1.default.createElement(material_1.Grid, { item: true, xs: 12, md: 2 },
                react_1.default.createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                    react_1.default.createElement("strong", null, position),
                    ") ",
                    (0, util_1.showDate)(overview.createdAt))),
            react_1.default.createElement(material_1.Grid, { item: true, xs: 12, md: 3 },
                react_1.default.createElement(LegendC, { label: 'event type' }),
                react_1.default.createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } }, overview.type)),
            react_1.default.createElement(material_1.Grid, { item: true, xs: 12, md: 2 },
                react_1.default.createElement(LegendC, { label: contextLegend() }),
                react_1.default.createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                    react_1.default.createElement(util_1.UrlC, { url: showWatchtimeOrContextUrl(overview) }))),
            react_1.default.createElement(material_1.Grid, { item: true, xs: 12, md: 2 },
                react_1.default.createElement(LegendC, { label: 'url' }),
                react_1.default.createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                    react_1.default.createElement(util_1.UrlC, { url: overview.url }))),
            react_1.default.createElement(material_1.Grid, { item: true, xs: 12, md: 3 },
                react_1.default.createElement(LegendC, { label: 'extension version' }),
                react_1.default.createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } }, overview.extensionVersion))),
        react_1.default.createElement(material_1.Box, { sx: { display: 'flex', alignItems: 'center' } }, ((_a = overview === null || overview === void 0 ? void 0 : overview.data) === null || _a === void 0 ? void 0 : _a.kind) === 'recommendations' && react_1.default.createElement(RecommendationsC, { data: overview.data.recommendations }))));
};
const EventsListC = ({ count, sessionUuid }) => {
    const api = (0, adminApiProvider_1.useAdminApi)();
    const [events, setEvents] = (0, react_1.useState)([]);
    const [folded, setFolded] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        if (folded) {
            return;
        }
        api.getEventOverviews(sessionUuid).then(data => {
            if (data.kind === 'Success') {
                setEvents(data.value);
            }
        }).catch(console.error);
    }, [sessionUuid, folded]);
    if (count === 0) {
        return react_1.default.createElement(material_1.Typography, { variant: 'body1' }, "No events");
    }
    if (folded) {
        return (react_1.default.createElement(material_1.Button, { variant: 'outlined', color: 'primary', sx: {
                m: 1,
            }, onClick: () => {
                setFolded(false);
            } },
            "Unfold ",
            count,
            " events"));
    }
    if (events.length === 0) {
        return react_1.default.createElement(material_1.Typography, { variant: 'body1' }, "Loading events...");
    }
    return (react_1.default.createElement(material_1.Box, null,
        react_1.default.createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2, fontWeight: 'bold' } }, "Events (latest first)"),
        events.map((event, index) => react_1.default.createElement(EventC, { key: event.id, data: event, position: events.length - index })),
        react_1.default.createElement(material_1.Button, { variant: 'outlined', color: 'primary', sx: {
                m: 1,
            }, onClick: () => {
                setFolded(true);
            } },
            "Fold back ",
            count,
            " events")));
};
const SessionC = ({ data }) => (react_1.default.createElement(material_1.Paper, { component: 'section', sx: { mb: 4, ml: 2, p: 2 } },
    react_1.default.createElement(material_1.Typography, { variant: 'h4', sx: { mb: 2 } },
        "Session #",
        data.id),
    react_1.default.createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
        "Session UUID: ",
        data.uuid),
    react_1.default.createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
        "Started on: ",
        (0, util_1.showDate)(data.startedAt)),
    react_1.default.createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
        "Ended on: ",
        (0, util_1.showDate)(data.endedAt)),
    react_1.default.createElement(EventsListC, { count: data.eventCount, sessionUuid: data.uuid })));
const OverviewC = ({ data }) => {
    const [phase, setPhase] = (0, react_1.useState)(data.phase);
    const [message, setMessage] = (0, react_1.useState)();
    const api = (0, adminApiProvider_1.useAdminApi)();
    const handlePhaseChange = (e) => __awaiter(void 0, void 0, void 0, function* () {
        const targetPhase = parseInt(e.target.value, 10);
        setPhase(targetPhase);
        const result = yield api.updateParticipantPhase(data.code, targetPhase);
        if (result.kind === 'Success') {
            setMessage({ severity: 'success', text: 'Phase updated' });
            return;
        }
        setMessage({ severity: 'error', text: 'Failed to update phase' });
    });
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(material_1.Paper, { component: 'section', sx: { mb: 4, p: 2 } },
            react_1.default.createElement(NotificationsC_1.default, { message: message }),
            react_1.default.createElement(material_1.Typography, { variant: 'h3', sx: { mb: 2 } }, "Basic info"),
            react_1.default.createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                react_1.default.createElement("strong", null, "Code:"),
                " ",
                data.code),
            react_1.default.createElement(material_1.FormControl, { sx: { mb: 2 } },
                react_1.default.createElement(material_1.InputLabel, { id: 'phase-label' }, "Phase"),
                react_1.default.createElement(material_1.Select, { labelId: 'phase-label', value: phase, label: 'Phase', onChange: handlePhaseChange },
                    react_1.default.createElement(material_1.MenuItem, { value: 0 }, "Pre-Experiment"),
                    react_1.default.createElement(material_1.MenuItem, { value: 1 }, "Experiment"),
                    react_1.default.createElement(material_1.MenuItem, { value: 2 }, "Post-Experiment Observation"))),
            react_1.default.createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                react_1.default.createElement("strong", null, "Added on:"),
                " ",
                (0, util_1.showDate)(data.createdAt)),
            react_1.default.createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                react_1.default.createElement("strong", null, "Last seen:"),
                " ",
                (0, util_1.showDate)(data.latestSessionDate)),
            react_1.default.createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                react_1.default.createElement("strong", null, "First seen:"),
                " ",
                (0, util_1.showDate)(data.firstSessionDate)),
            react_1.default.createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
                react_1.default.createElement("strong", null, "Number of sessions:"),
                " ",
                data.sessionCount)),
        react_1.default.createElement(material_1.Box, { component: 'section', sx: { mb: 4 } },
            react_1.default.createElement(material_1.Typography, { variant: 'h3', sx: { mb: 2 } }, "Sessions (most recent first)"),
            data.sessions.length === 0 ? 'No sessions' : data.sessions.map(session => react_1.default.createElement(SessionC, { key: session.id, data: session })))));
};
const ParticipantPageC = () => {
    const { code } = (0, react_router_1.useParams)();
    const api = (0, adminApiProvider_1.useAdminApi)();
    const [overview, setOverview] = (0, react_1.useState)(undefined);
    (0, react_1.useEffect)(() => {
        if (!code) {
            console.error('No email provided');
            return;
        }
        api.getParticipantOverview(code).then(res => {
            if (res.kind === 'Success') {
                setOverview(res.value);
            }
        }).catch(err => {
            console.error(err);
        });
    }, [code]);
    const ui = (react_1.default.createElement(material_1.Box, { component: 'section', sx: { mb: 4 } },
        react_1.default.createElement(material_1.Typography, { variant: 'h2', sx: { mb: 2 } },
            "Participant: ",
            code),
        overview === undefined ? 'Loading...' : react_1.default.createElement(OverviewC, { data: overview })));
    return ui;
};
exports.ParticipantPageC = ParticipantPageC;
exports.default = exports.ParticipantPageC;
//# sourceMappingURL=ParticipantOverviewP.js.map