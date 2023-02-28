import React from 'react';

import {Typography} from '@mui/material';

export const showDate = (d: Date | string): string => {
	const date = new Date(d);
	return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

export const LinkC: React.FC<{href: string; label: string}> = ({href, label}) => (
	<a
		target='_blank'
		rel='noreferrer'
		href={href}
		style={{
			textDecoration: 'none',
			color: 'inherit',
		}}
	>
		<Typography variant='body1' color='blue'>{label}</Typography>
	</a>
);

export const UrlC: React.FC<{url: string; prefix?: string}> = ({url, prefix}) => {
	const withYtHostName = url.startsWith('/') ? `https://youtube.com${url}` : url;

	const p = prefix ?? '';

	try {
		const u = new URL(withYtHostName);

		if (u.pathname === '/results') {
			return <LinkC href={withYtHostName} label={`${p}search: ${u.searchParams.get('search_query') ?? ''}`} />;
		}

		if (u.pathname === '/watch') {
			return <LinkC href={withYtHostName} label={`${p}video: ${u.searchParams.get('v') ?? ''}`} />;
		}

		return <LinkC href={withYtHostName} label={`${p}${u.pathname}`} />;
	} catch (e) {
		return <>{p}{url}</>;
	}
};
