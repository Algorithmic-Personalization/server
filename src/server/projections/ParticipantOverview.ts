import type Participant from '../../common/models/participant';

export type ParticipantOverview = Participant & {
	sessionCount: number;
};

export default ParticipantOverview;
