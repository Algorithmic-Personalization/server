import React from 'react';

import {type RequestLog} from '../../server/models/requestLog';

export const RequestLogC: React.FC<{
	entries: RequestLog[];
}> = ({entries}) => {
	const ui = (
		<div>{entries.length} entries</div>
	);

	return ui;
};

export default RequestLogC;
