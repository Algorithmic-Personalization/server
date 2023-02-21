import React, {useEffect, useState} from 'react';

import {Box, Fade, Typography} from '@mui/material';

export type Severity = 'error' | 'success' | 'info' | 'warning';
export type Color = 'error.main' | 'success.main' | 'info.main' | 'warning.main';

const defaultSeverity: Severity = 'info';

export type Message = {
	text: string | string[];
	severity?: Severity;
	permanent?: boolean;
};

type MessageWithId = {
	text: string;
	severity: Severity;
	permanent?: boolean;
	displayForMs: number;
	id: number;
};

const getColor = (severity: Severity): Color => {
	switch (severity) {
		case 'error':
			return 'error.main';
		case 'success':
			return 'success.main';
		case 'info':
			return 'info.main';
		case 'warning':
			return 'warning.main';
		default:
			return 'info.main';
	}
};

const displayDuration = (_severity: Severity): number => 10000;

export const FadeC: React.FC<{
	displayForMs: number;
	children: React.ReactElement;
	permanent?: boolean;
}> = ({displayForMs, children, permanent}) => {
	const [show, setShow] = useState(true);
	const timeout = 1000;

	useEffect(() => {
		if (permanent) {
			return;
		}

		setTimeout(() => {
			setShow(false);
		}, displayForMs - timeout);
	}, [children]);

	return <Fade in={show} timeout={timeout}>{children}</Fade>;
};

export const NotificationsC: React.FC<{
	message?: Message;
}> = ({message}) => {
	const [messages, setMessages] = useState<MessageWithId[]>([]);
	const [maxId, setMaxId] = useState<number>(0);
	const [toKill, setToKill] = useState<number[]>([]);

	const getId = (): number => {
		const id = maxId + 1;
		setMaxId(id);
		return id;
	};

	useEffect(() => {
		if (!message) {
			return;
		}

		const newMessages = [...messages];

		const severity = message.severity ?? defaultSeverity;

		const base = {
			severity,
			displayForMs: displayDuration(severity),
			permanent: message.permanent,
		};

		const newIds: number[] = [];

		if (typeof message.text === 'string') {
			const id = getId();

			newMessages.push({
				...base,
				text: message.text,
				id,
			});

			newIds.push(id);
		} else {
			for (const text of message.text) {
				const id = getId();

				newMessages.push({
					...base,
					text,
					id,
				});

				newIds.push(id);
			}
		}

		setMessages(newMessages);

		setTimeout(() => {
			setToKill([...toKill, ...newIds]);
		}, base.displayForMs);
	}, [message]);

	useEffect(() => {
		if (toKill.length === 0) {
			return;
		}

		setMessages(messages.filter(m => !toKill.includes(m.id)));
		setToKill([]);
	}, [toKill]);

	if (messages.length === 0) {
		return null;
	}

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'stretch',
				gap: 1,
				my: 2,
			}}
		>
			{messages.map(m => (
				<FadeC key={m.id} displayForMs={m.displayForMs} permanent={m.permanent}>
					<Typography
						variant='body2'
						color={getColor(m.severity)}
						sx={{
							border: 1,
							borderColor: getColor(m.severity),
							borderRadius: 1,
							p: 2,
						}}
					>
						{m.text}
					</Typography>
				</FadeC>
			))}
		</Box>
	);
};

export default NotificationsC;
