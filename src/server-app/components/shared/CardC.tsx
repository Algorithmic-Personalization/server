import React from 'react';

import {
	Box,
} from '@mui/material';

import type {SxProps} from '@mui/system';

export const CardC: React.FC<{
	children: React.ReactElement | React.ReactElement[];
	sx?: SxProps;
}> = ({children, sx}) => (
	<Box sx={{
		borderRadius: 1,
		border: 1,
		borderColor: 'grey.300',
		padding: 2,
		...sx,
	}}>
		{children}
	</Box>
);

export default CardC;
