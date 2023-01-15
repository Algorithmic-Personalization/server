import React from 'react';

import {Box, Typography} from '@mui/material';

export const ErrorsC: React.FC<{
	errors: string[];
}> = ({errors}) => {
	if (errors.length === 0) {
		return null;
	}

	const color = 'error.main';

	return (
		<Box sx={{
			mt: 2,
			mb: 2,
			p: 2,
			borderColor: color,
			color,
		}} border={1}>
			<Typography>Oops:</Typography>
			<ul>
				{errors.map((error, i) => (
					<li key={i}>
						<Typography>{error}</Typography>
					</li>
				))}
			</ul>
		</Box>
	);
};

export default ErrorsC;
