import {type RouteCreator} from '../lib/routeCreation';

import {type Page, extractPaginationRequest} from '../lib/pagination';

import Participant, {isValidPhase} from '../models/participant';
import {type FindOptionsWhere, Like} from 'typeorm';

const translateExtensionInstalledFilter = (extensionInstalled: unknown): boolean | undefined => {
	if (extensionInstalled === 'yes') {
		return true;
	}

	if (extensionInstalled === 'no') {
		return false;
	}

	return undefined;
};

export const createGetParticipantsRoute: RouteCreator = ({createLogger, dataSource}) => async (req, res) => {
	const log = createLogger(req.requestId);
	log('Received participants request');

	const {page, pageSize} = extractPaginationRequest(req);
	const {codeLike, phase, extensionInstalled} = req.query;

	const participantRepo = dataSource.getRepository(Participant);

	const where: FindOptionsWhere<Participant> = {
		code: (typeof codeLike === 'string') ? Like(`%${codeLike}%`) : undefined,
		phase: isValidPhase(Number(phase)) ? Number(phase) : undefined,
		extensionInstalled: translateExtensionInstalledFilter(extensionInstalled),
	};

	try {
		const participants = await participantRepo
			.find({
				skip: page * pageSize,
				take: pageSize,
				order: {
					createdAt: 'DESC',
				},
				where,
			});

		const count = await participantRepo.count({where});

		const data: Page<Participant> = {
			results: participants,
			page,
			pageSize,
			pageCount: Math.ceil(count / pageSize),
			count,
		};

		res.status(200).json({kind: 'Success', value: data});
	} catch (error) {
		log('Error getting participants', error);

		res.status(500).json({kind: 'Error', message: 'Error getting participants'});
	}
};

export default createGetParticipantsRoute;
