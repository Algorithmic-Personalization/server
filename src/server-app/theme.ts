import {createTheme} from '@mui/material';

export const theme = createTheme({});

theme.typography.h1 = {
	fontSize: '1.5rem',
	[theme.breakpoints.up('sm')]: {
		fontSize: '2.5rem',
	},
};

theme.typography.h2 = {
	fontSize: '1.2rem',
	[theme.breakpoints.up('sm')]: {
		fontSize: '1.5rem',
	},
};

theme.typography.h3 = {
	fontSize: '1.1rem',
	[theme.breakpoints.up('sm')]: {
		fontSize: '1.2rem',
	},
};

theme.typography.h4 = {
	fontSize: '1rem',
	[theme.breakpoints.up('sm')]: {
		fontSize: '1.2rem',
	},
};

export default theme;
