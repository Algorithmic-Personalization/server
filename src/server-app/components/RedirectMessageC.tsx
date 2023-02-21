import React, {useEffect, useState} from 'react';

import NotificationsC, {type Message} from './NotificationsC';

export const RedirectMessageC: React.FC<{ignore?: boolean}> = ({ignore}) => {
	const [message, setMessage] = useState<Message>();

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const message = params.get('message');
		if (message) {
			setMessage({
				text: message,
				permanent: true,
			});
		}
	}, []);

	if (ignore) {
		return null;
	}

	return <NotificationsC message={message}/>;
};

export default RedirectMessageC;
