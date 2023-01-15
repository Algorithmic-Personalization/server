import React from 'react';

import {
	Box,
} from '@mui/material';

export const CardC: React.FC<{
	children: React.ReactElement | React.ReactElement[];
}> = ({children}) => (
	<Box sx={{
		borderRadius: 1,
		border: 1,
		borderColor: 'grey.300',
		padding: 2,
	}}>
		{children}
	</Box>
);

export default CardC;
