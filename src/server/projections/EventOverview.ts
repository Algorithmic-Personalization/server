/* eslint-disable @typescript-eslint/consistent-type-definitions */

import type Event from '../../common/models/event';

import type RecommendationsList from './RecommendationsList';

interface EventDataBase {
	kind: 'watchtime' | 'recommendations';
}

export interface WatchtimeData extends EventDataBase {
	kind: 'watchtime';
	watchtime: number;
}

export interface RecommendationsData extends EventDataBase {
	kind: 'recommendations';
	recommendations: RecommendationsList;
}

export type EventData = WatchtimeData | RecommendationsData;

export type EventOverview = Event & {
	data?: EventData;
};

export default EventOverview;
