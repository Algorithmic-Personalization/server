import {has} from '../../common/util';

export type ParticipantRecord = {
	email: string;
	code: string;
	arm: 'control' | 'treatment';
};

export const isParticipantRecord = (record: Record<string, string>): record is ParticipantRecord =>
	has('code')(record)
	&& has('arm')(record)
	&& typeof record.code === 'string'
	&& record.code.length > 0
	&& (record.arm === 'control' || record.arm === 'treatment');
