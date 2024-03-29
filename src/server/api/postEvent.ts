
import {type RouteCreator} from '../lib/routeCreation';

import Participant from '../models/participant';
import Event, {EventType} from '../../common/models/event';
import {type RecommendationsEvent} from '../../common/models/recommendationsEvent';
import {type WatchTimeEvent} from '../../common/models/watchTimeEvent';
import ExperimentConfig from '../../common/models/experimentConfig';

import {has, validateExcept} from '../../common/util';
import type DailyActivityTime from '../models/dailyActivityTime';

import type TransitionSetting from '../models/transitionSetting';
import {OperatorType} from '../models/transitionSetting';
import TransitionEvent from '../models/transitionEvent';

import createUpdatePhase from './postEvent/updateParticipantPhase';
import createUpdateActivity from './postEvent/createUpdateActivity';
import createStoreWatchTime from './postEvent/storeWatchTime';
import createHandleExtensionInstalledEvent from './postEvent/handleExtensionInstalledEvent';

import storeRecommendationsShown, {storeHomeShownVideos} from '../lib/storeRecommendationsShown';
import AsyncLock from 'async-lock';
import type HomeShownEvent from '../../common/models/homeShownEvent';

import {updateIfNeededAndGetParticipantChannelSource} from '../api-2/channelSourceGetForParticipant';

const isLocalUuidAlreadyExistsError = (e: unknown): boolean =>
	has('code')(e) && has('constraint')(e)
	&& e.code === '23505'
	&& e.constraint === 'event_local_uuid_idx';

const isSessionUuidAlreadyExistsError = (e: unknown): boolean =>
	has('code')(e) && has('constraint')(e)
	&& e.code === '23503'
	&& e.constraint === 'event_session_uuid_fkey';

const activityMatches = (
	setting: TransitionSetting,
	activity: DailyActivityTime,
): boolean => {
	let criteriaOk = 0;
	const criteriaCount = 5;

	if (activity.timeSpentOnYoutubeSeconds >= setting.minTimeSpentOnYoutubeSeconds) {
		criteriaOk += 1;
	}

	if (activity.videoTimeViewedSeconds >= setting.minVideoTimeViewedSeconds) {
		criteriaOk += 1;
	}

	if (activity.pagesViewed >= setting.minPagesViewed) {
		criteriaOk += 1;
	}

	if (activity.videoPagesViewed >= setting.minVideoPagesViewed) {
		criteriaOk += 1;
	}

	if (activity.sidebarRecommendationsClicked >= setting.minSidebarRecommendationsClicked) {
		criteriaOk += 1;
	}

	if (setting.operator === OperatorType.ALL) {
		return criteriaOk === criteriaCount;
	}

	return criteriaOk > 0;
};

export const shouldTriggerPhaseTransition = (
	setting: TransitionSetting,
	activities: DailyActivityTime[],
): TransitionEvent | undefined => {
	let matchingDays = 0;
	const transition = new TransitionEvent();

	for (const activity of activities) {
		const matches = activityMatches(setting, activity);

		if (matches) {
			matchingDays += 1;
			transition.timeSpentOnYoutubeSeconds += activity.timeSpentOnYoutubeSeconds;
			transition.videoTimeViewedSeconds += activity.videoTimeViewedSeconds;
			transition.pagesViewed += activity.pagesViewed;
			transition.videoPagesViewed += activity.videoPagesViewed;
			transition.sidebarRecommendationsClicked += activity.sidebarRecommendationsClicked;
		}
	}

	transition.numDays = matchingDays;

	if (matchingDays >= setting.minDays) {
		return transition;
	}

	return undefined;
};

const summarizeForDisplay = (event: Event): Record<string, unknown> => {
	const summary: Record<string, unknown> = {
		...event,
	};

	if (event.type === EventType.RECOMMENDATIONS_SHOWN) {
		const e = event as RecommendationsEvent;
		summary.nonPersonalized = e.nonPersonalized.length;
		summary.personalized = e.personalized.length;
	}

	if (event.type === EventType.HOME_SHOWN) {
		const e = event as HomeShownEvent;
		summary.defaultRecommendations = e.defaultRecommendations.length;
		summary.replacementSource = e.replacementSource.length;
		summary.shown = e.shown?.length ?? 0;
	}

	return summary;
};

export const createPostEventRoute: RouteCreator = ({
	createLogger,
	dataSource,
	youTubeConfig,
	notifier,
}) => async (req, res) => {
	const log = createLogger(req.requestId);

	log('Received post event request');

	const {participantCode} = req;
	const lock = new AsyncLock();

	if (req.body.sessionUuid === undefined) {
		log('No session UUID found');
		res.status(500).json({kind: 'Failure', message: 'No session UUID found'});
		return;
	}

	if (typeof participantCode !== 'string' || !participantCode) {
		log('Invalid participant code');
		res.status(500).json({kind: 'Failure', message: 'No participant code found'});
		return;
	}

	const event = new Event();
	Object.assign(event, req.body);
	event.createdAt = new Date(event.createdAt);
	event.updatedAt = new Date(event.updatedAt);
	event.localZeroHour = event.localZeroHour ? new Date(event.localZeroHour) : undefined;

	const participantRepo = dataSource.getRepository(Participant);
	const eventRepo = dataSource.getRepository(Event);

	const updateActivity = createUpdateActivity({
		dataSource,
		notifier,
		log,
	});

	const updatePhase = createUpdatePhase({
		dataSource,
		notifier,
		log,
	});

	const storeWatchTime = createStoreWatchTime({
		dataSource,
		log,
	});

	const participant = await participantRepo.findOneBy({
		code: participantCode,
	});

	if (!participant) {
		log('no participant found');
		res.status(500).json({kind: 'Failure', message: 'No participant found'});
		return;
	}

	const handleInstall = createHandleExtensionInstalledEvent({
		dataSource,
		notifier: notifier.makeParticipantNotifier({
			participantCode,
			participantId: participant.id,
			isPaid: participant.isPaid,
		}),
		log,
	});

	if (event.type === EventType.PAGE_VIEW) {
		handleInstall(participant, event).catch(e => {
			log('error', 'failed to handle install event', e);
		});
	}

	event.arm = participant.arm;
	event.phase = participant.phase;

	if (!event.experimentConfigId) {
		const configRepo = dataSource.getRepository(ExperimentConfig);
		const config = await configRepo.findOneBy({
			isCurrent: true,
		});

		if (!config) {
			log('no current config found');
			res.status(500).json({kind: 'Failure', message: 'No current config found'});
			return;
		}

		event.experimentConfigId = config.id;
	}

	const errors = await validateExcept('id', 'tabActive')(event);

	if (errors.length > 0) {
		log('error', 'event validation failed', {errors, event});
		res.status(400).json({kind: 'Failure', message: `Event validation failed: ${errors.join(', ')}.`});
		return;
	}

	try {
		const e = await eventRepo.save(event);
		log('event saved', summarizeForDisplay(e));

		// Update the things the response doesn't depend upon in parallel
		lock.acquire(`participant-${participant.id}`, async () => {
			try {
				await updateActivity(participant, e);
				await updatePhase(participant, e);
			} catch (e) {
				log('error', 'activity update failed', e);
			}
		}).catch(e => {
			log('error', 'failed to acquire participant lock', e);
		});

		if (event.type === EventType.RECOMMENDATIONS_SHOWN) {
			storeRecommendationsShown({
				dataSource,
				youTubeConfig,
				event: event as RecommendationsEvent,
				log,
			}).catch(async err => {
				log('error', 'recommendations store failed', err);
			});
		} else if (event.type === EventType.WATCH_TIME) {
			storeWatchTime(event as WatchTimeEvent).catch(async err => {
				log('error', 'watch time store failed', err);
			});
		}

		if (event.type === EventType.HOME_SHOWN) {
			storeHomeShownVideos({
				dataSource,
				event: event as HomeShownEvent,
				log,
				youTubeConfig,
			}).catch(async err => {
				log('error', 'home shown store failed', err);
			});
		}

		if (event.type === EventType.HOME_INJECTED_TILE_CLICKED) {
			const postProcess = async () => {
				const qr = dataSource.createQueryRunner();

				try {
					await qr.connect();
					await qr.startTransaction();

					const participant = await qr.manager.getRepository(Participant).findOneOrFail({
						where: {
							code: participantCode,
						},
					});

					const update = updateIfNeededAndGetParticipantChannelSource(qr, log);
					await update(participant, true);

					await qr.commitTransaction();
				} catch (err) {
					if (qr.isTransactionActive) {
						await qr.rollbackTransaction();
					}

					console.error('error', 'failed to (maybe-) advance participant in its channel source', err);
				} finally {
					await qr.release();
				}
			};

			postProcess().catch(e => {
				log('error', 'failed to update participant channel source', e);
			});
		}

		res.send({kind: 'Success', value: e});
	} catch (e) {
		if (isLocalUuidAlreadyExistsError(e) || isSessionUuidAlreadyExistsError(e)) {
			res.status(200).json({kind: 'Failure', message: 'Event already exists', code: 'EVENT_ALREADY_EXISTS_OK'});
			return;
		}

		log('event save failed', e);

		res.status(500).json({kind: 'Failure', message: 'Event save failed'});
	}
};

export default createPostEventRoute;
