import type Session from '../../common/models/session';

import type EventOverview from './EventOverview';

export type SessionOverview = Session & {
	startedAt: Date;
	endedAt: Date;
	eventCount: number;
	events: EventOverview[];
};

export default SessionOverview;
