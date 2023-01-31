import type Participant from '../../common/models/participant';

export type ParticipantOverview = Participant & {
	sessionCount: number;
	firstSessionDate: Date;
	latestSessionDate: Date;
};

export default ParticipantOverview;