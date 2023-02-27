/* eslint-disable no-await-in-loop */

import type {DataSource} from 'typeorm';
import type {LogFunction} from './logger';
import Participant from '../models/participant';
import Session from '../../common/models/session';
import Event from '../../common/models/event';
import WatchTime from '../models/watchTime';

import {inspect} from 'util';
import DailyActivityTime from '../models/dailyActivityTime';

class Counter {
	days = new Map<Date, number>();

	get(date: Date) {
		return this.days.get(date) ?? 0;
	}
}

class DayCounter extends Counter {
	add(date: Date, value: number) {
		const day = new Date(new Date(date).setHours(0, 0, 0, 0));
		const existingValue = this.days.get(day) ?? 0;
		this.days.set(date, existingValue + value);
	}
}

const mergeCounterKeys = (...counters: Counter[]): Set<Date> => {
	const keys = new Set<Date>();

	for (const counter of counters) {
		for (const key of counter.days.keys()) {
			keys.add(key);
		}
	}

	return keys;
};

export const timeSpentEventDiffLimit = 30 * 60 * 1000;

class TimeSpentCounter extends Counter {
	currentDay?: Date;
	latestDate?: Date;

	add(date: Date) {
		const day = new Date(new Date(date).setHours(0, 0, 0, 0));

		if (!this.currentDay || day > this.currentDay) {
			this.currentDay = day;
			return;
		}

		this.latestDate = date;

		const existingValue = this.days.get(day) ?? 0;
		const diff = Number(date) - Number(this.latestDate);

		if (diff > timeSpentEventDiffLimit) {
			return;
		}

		this.days.set(date, existingValue + (diff / 1000));
	}
}

export const updateCounters = async ({
	log,
	dataSource,
}: {
	log: LogFunction;
	dataSource: DataSource;
}) => {
	log('Updating counters...');

	const participants: Array<{id: number}> = await dataSource
		.getRepository(Participant)
		.createQueryBuilder('participant')
		.leftJoinAndSelect(
			'daily_activity_time',
			'dat',
			'dat.participant_id=participant.id and dat.participant_id=participant.id is null',
		)
		.select('distinct participant.id', 'id')
		.getRawMany();

	log(`Found ${inspect(participants)} participants to update`);

	for (const {id} of participants) {
		const participant = await dataSource
			.getRepository(Participant)
			.findOneByOrFail({id});

		const sessions = await dataSource
			.getRepository(Session)
			.find({
				where: {
					participantCode: participant.code,
				},
			});

		const pagesViewed = new DayCounter();
		const watchTimes = new DayCounter();
		const videoPagesViewed = new DayCounter();
		const timeSpent = new TimeSpentCounter();

		for (const session of sessions) {
			const events = await dataSource
				.getRepository(Event)
				.find({
					where: {
						sessionUuid: session.uuid,
					},
					order: {
						createdAt: 'ASC',
					},
				});

			for (const event of events) {
				if (event.type === 'PAGE_VIEW') {
					pagesViewed.add(event.createdAt, 1);

					// eslint-disable-next-line max-depth
					if (event.url.includes('/watch')) {
						videoPagesViewed.add(event.createdAt, 1);
					}
				}

				if (event.type === 'WATCH_TIME') {
					const repo = dataSource.getRepository(WatchTime);

					const watchTime = await repo.findOneOrFail({
						where: {
							eventId: event.id,
						},
					});

					watchTimes.add(event.createdAt, watchTime.secondsWatched);
				}

				timeSpent.add(event.createdAt);
			}
		}

		const days = mergeCounterKeys(
			pagesViewed,
			watchTimes,
			videoPagesViewed,
			timeSpent,
		);

		const atRepo = dataSource.getRepository(DailyActivityTime);
		const activityTimes: DailyActivityTime[] = [];

		for (const day of days) {
			const activity = new DailyActivityTime();
			activity.pagesViewed = pagesViewed.get(day);
			activity.videoTimeViewedSeconds = watchTimes.get(day);
			activity.videoPagesViewed = videoPagesViewed.get(day);
			activity.timeSpentOnYoutubeSeconds = timeSpent.get(day);
			activity.participantId = participant.id;
			activityTimes.push(activity);
		}

		await atRepo.save(activityTimes);
	}
};

export default updateCounters;
