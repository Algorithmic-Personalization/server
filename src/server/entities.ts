import Admin from '../common/models/admin';
import Token from './models/token';
import Participant from './models/participant';
import ExperimentConfig from '../common/models/experimentConfig';
import Session from '../common/models/session';
import Event from '../common/models/event';
import Video from './models/video';
import WatchTime from './models/watchTime';
import VideoListItem from './models/videoListItem';
import DailyActivityTime from './models/dailyActivityTime';
import TransitionEvent from './models/transitionEvent';
import TransitionSetting from './models/transitionSetting';
import VideoMetadata from './models/videoMetadata';
import VideoCategory from './models/videoCategory';
import YouTubeRequestLatency from './models/youTubeRequestLatency';
import RequestLog from './models/requestLog';
import Voucher from './models/voucher';
import ResetPasswordToken from './models/resetPasswordToken';

// Add classes used by typeorm as models here
// so that typeorm can extract the metadata from them.

export const entities = [
	Admin,
	Token,
	Participant,
	ExperimentConfig,
	Session,
	Event,
	Video,
	VideoListItem,
	WatchTime,
	DailyActivityTime,
	TransitionEvent,
	TransitionSetting,
	VideoMetadata,
	VideoCategory,
	YouTubeRequestLatency,
	RequestLog,
	Voucher,
	ResetPasswordToken,
];

export default entities;
