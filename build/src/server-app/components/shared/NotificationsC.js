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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsC = exports.FadeC = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const defaultSeverity = 'info';
const getColor = (severity) => {
    switch (severity) {
        case 'error':
            return 'error.main';
        case 'success':
            return 'success.main';
        case 'info':
            return 'info.main';
        case 'warning':
            return 'warning.main';
        default:
            return 'info.main';
    }
};
const displayDuration = (_severity) => 10000;
const FadeC = ({ displayForMs, children, permanent }) => {
    const [show, setShow] = (0, react_1.useState)(true);
    const timeout = 1000;
    (0, react_1.useEffect)(() => {
        if (permanent) {
            return;
        }
        setTimeout(() => {
            setShow(false);
        }, displayForMs - timeout);
    }, [children]);
    return react_1.default.createElement(material_1.Fade, { in: show, timeout: timeout }, children);
};
exports.FadeC = FadeC;
const NotificationsC = ({ message }) => {
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [maxId, setMaxId] = (0, react_1.useState)(0);
    const [toKill, setToKill] = (0, react_1.useState)([]);
    const getId = () => {
        const id = maxId + 1;
        setMaxId(id);
        return id;
    };
    (0, react_1.useEffect)(() => {
        var _a;
        if (!message) {
            return;
        }
        const newMessages = [...messages];
        const severity = (_a = message.severity) !== null && _a !== void 0 ? _a : defaultSeverity;
        const base = {
            severity,
            displayForMs: displayDuration(severity),
            permanent: message.permanent,
        };
        const newIds = [];
        if (typeof message.text === 'string') {
            const id = getId();
            newMessages.push(Object.assign(Object.assign({}, base), { text: message.text, id }));
            newIds.push(id);
        }
        else {
            for (const text of message.text) {
                const id = getId();
                newMessages.push(Object.assign(Object.assign({}, base), { text,
                    id }));
                newIds.push(id);
            }
        }
        setMessages(newMessages);
        setTimeout(() => {
            setToKill([...toKill, ...newIds]);
        }, base.displayForMs);
    }, [message]);
    (0, react_1.useEffect)(() => {
        if (toKill.length === 0) {
            return;
        }
        setMessages(messages.filter(m => !toKill.includes(m.id)));
        setToKill([]);
    }, [toKill]);
    if (messages.length === 0) {
        return null;
    }
    return (react_1.default.createElement(material_1.Box, { sx: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 1,
            my: 2,
        } }, messages.map(m => (react_1.default.createElement(exports.FadeC, { key: m.id, displayForMs: m.displayForMs, permanent: m.permanent },
        react_1.default.createElement(material_1.Typography, { variant: 'body2', color: getColor(m.severity), sx: {
                border: 1,
                borderColor: getColor(m.severity),
                borderRadius: 1,
                p: 2,
            } }, m.text))))));
};
exports.NotificationsC = NotificationsC;
exports.default = exports.NotificationsC;
//# sourceMappingURL=NotificationsC.js.map