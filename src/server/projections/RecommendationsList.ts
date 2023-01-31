import type {VideoType} from '../models/videoListItem';
import type Video from '../models/video';

export type VideoItem = Video & {
	source: VideoType;
};

export type RecommendationsList = {
	nonPersonalized: VideoItem[];
	personalized: VideoItem[];
	shown: VideoItem[];
};

export default RecommendationsList;
