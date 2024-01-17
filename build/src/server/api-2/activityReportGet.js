"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGetActivityReportDefinition = void 0;
const dailyActivityTime_1 = __importDefault(require("../models/dailyActivityTime"));
const util_1 = require("../../util");
exports.createGetActivityReportDefinition = {
    verb: 'get',
    path: '/api/activity-report',
    makeHandler: ({ createLogger, dataSource }) => (req) => __awaiter(void 0, void 0, void 0, function* () {
        const log = createLogger(req.requestId);
        log('Received get activity report request');
        const show = (0, util_1.showSql)(log);
        const activityRepo = dataSource.getRepository(dailyActivityTime_1.default);
        const latestActivity = yield activityRepo.find({
            order: {
                createdAt: 'DESC',
                updatedAt: 'DESC',
            },
            relations: ['participant'],
            take: 100,
        });
        const data = yield show(dataSource.createQueryBuilder()
            .from(dailyActivityTime_1.default, 'dat')
            .select('dat.created_at', 'day')
            .addSelect('avg(dat.pages_viewed)', 'avgPagesViewed')
            .addSelect('sum(dat.pages_viewed)', 'totalPagesViewed')
            .addSelect('avg(dat.video_pages_viewed)', 'avgVideoPagesViewed')
            .addSelect('sum(dat.video_pages_viewed)', 'totalVideoPagesViewed')
            .addSelect('avg(dat.video_time_viewed_seconds)', 'avgVideoTimeViewedSeconds')
            .addSelect('sum(dat.video_time_viewed_seconds)', 'totalVideoTimeViewedSeconds')
            .addSelect('avg(dat.time_spent_on_youtube_seconds)', 'avgTimeSpentOnYoutubeSeconds')
            .addSelect('sum(dat.time_spent_on_youtube_seconds)', 'totalTimeSpentOnYoutubeSeconds')
            .addSelect('avg(dat.sidebar_recommendations_clicked)', 'avgSidebarRecommendationsClicked')
            .addSelect('sum(dat.sidebar_recommendations_clicked)', 'totalSidebarRecommendationsClicked')
            .addSelect('count(distinct dat.participant_id)', 'nParticipants')
            .groupBy('dat.created_at')
            .orderBy('dat.created_at', 'DESC')
            .limit(15)).getRawMany();
        const n = (x) => {
            const v = Number(x);
            return Number.isNaN(v) ? 0 : v;
        };
        const d = (x) => {
            if (typeof x !== 'string' && !(x instanceof Date) && typeof x !== 'number') {
                return new Date(0);
            }
            const v = new Date(x);
            return Number.isNaN(v.getTime()) ? new Date(0) : v;
        };
        const averages = data.map((_a) => {
            var { day } = _a, rest = __rest(_a, ["day"]);
            return ({
                day: d(day),
                pagesViewed: Math.round(n(rest.avgPagesViewed)),
                videoPagesViewed: Math.round(n(rest.avgVideoPagesViewed)),
                videoTimeViewedSeconds: Math.round(n(rest.avgVideoTimeViewedSeconds)),
                timeSpentOnYoutubeSeconds: Math.round(n(rest.avgTimeSpentOnYoutubeSeconds)),
                sidebarRecommendationsClicked: Math.round(n(rest.avgSidebarRecommendationsClicked)),
                nParticipants: n(rest.nParticipants),
            });
        });
        const totals = data.map((_a) => {
            var { day } = _a, rest = __rest(_a, ["day"]);
            return ({
                day: d(day),
                pagesViewed: Math.round(n(rest.totalPagesViewed)),
                videoPagesViewed: Math.round(n(rest.totalVideoPagesViewed)),
                videoTimeViewedSeconds: Math.round(n(rest.totalVideoTimeViewedSeconds)),
                timeSpentOnYoutubeSeconds: Math.round(n(rest.totalTimeSpentOnYoutubeSeconds)),
                sidebarRecommendationsClicked: Math.round(n(rest.totalSidebarRecommendationsClicked)),
                nParticipants: n(rest.nParticipants),
            });
        });
        // D log('info', {averages, totals, data});
        return {
            serverNow: (0, util_1.localNow)(),
            latest: latestActivity,
            averages,
            totals,
        };
    }),
};
exports.default = exports.createGetActivityReportDefinition;
//# sourceMappingURL=activityReportGet.js.map