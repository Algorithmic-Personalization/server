import type Session from '../../common/models/session';

export type SessionOverview = Session & {
	startedAt: Date;
	endedAt: Date;
	eventCount: number;
};

export default SessionOverview;
