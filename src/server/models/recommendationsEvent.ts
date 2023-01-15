import Event, {EventType} from './event';
import type Recommendation from '../../common/types/Recommendation';

export class RecommendationsEvent extends Event {
	constructor(
		public readonly nonPersonalized: Recommendation[],
		public readonly personalized: Recommendation[],
		public readonly shown: Recommendation[],
	) {
		super();
		this.type = EventType.RECOMMENDATIONS_SHOWN;
	}
}

export default RecommendationsEvent;
