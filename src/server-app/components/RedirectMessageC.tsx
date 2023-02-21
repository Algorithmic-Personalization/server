import React, {useEffect, useState} from 'react';

import MessageC from './MessageC';

export const RedirectMessageC: React.FC<{ignore?: boolean}> = ({ignore}) => {
	const [message, setMessage] = useState<string | undefined>();

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const message = params.get('message');
		if (message) {
			setMessage(message);
		}
	}, []);

	if (ignore) {
		return null;
	}

	return <MessageC message={message} type='success' />;
};

export default RedirectMessageC;
