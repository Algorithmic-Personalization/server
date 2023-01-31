/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type Event from '../../common/models/event';

import type RecommendationsList from './RecommendationsList';

export interface EventData {
	kind: 'watchtime' | 'recommendations';
}

export interface WatchtimeData extends EventData {
	kind: 'watchtime';
	watchtime: number;
}

export interface RecommendationsData extends EventData {
	kind: 'recommendations';
	recommendations: RecommendationsList;
}

export type EventOverview = Event & {
	data?: EventData;
};

export default EventOverview;
