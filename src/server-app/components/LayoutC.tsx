import React, {useState} from 'react';

import {
	AppBar,
	Box,
	Button,
	CssBaseline,
	Drawer,
	Toolbar,
	Typography,
	IconButton,
	Divider,
	List,
	ListItem,
	ListItemText,
	ListItemButton,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';

import {
	Routes,
	Route,
	useNavigate,
} from 'react-router-dom';

import HomeC from './HomeC';
import ParticipantsC from './ParticipantsC';
import ExperimentConfigC from './ExperimentConfigC';
import EventsC from './EventsC';
import NotFoundC from './NotFoundC';
import UserWidgetC from './UserWidgetC';

type NavItem = {
	label: string;
	link: string;
	component: React.FC;
};

const navItems: NavItem[] = [
	{
		label: 'Home',
		link: '/',
		component: HomeC,
	},
	{
		label: 'Participants',
		link: '/participants',
		component: ParticipantsC,
	},
	{
		label: 'Experiment Config',
		link: '/experiment-config',
		component: ExperimentConfigC,
	},
	{
		label: 'Events',
		link: '/events',
		component: EventsC,
	},
];

export const LayoutC: React.FC = () => {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const navigate = useNavigate();

	const handleDrawerToggle = () => {
		setDrawerOpen(!drawerOpen);
	};

	const drawerWidth = 240;

	const drawer = (
		<Box onClick={handleDrawerToggle} sx={{textAlign: 'center'}}>
			<Typography variant='h6' sx={{my: 2}}>
				YTDPNL
			</Typography>
			<Divider />
			<List>
				{navItems.map(item => (
					<ListItem key={item.link} disablePadding>
						<ListItemButton sx={{textAlign: 'center'}} onClick={() => {
							navigate(item.link);
							setDrawerOpen(false);
						}}>
							<ListItemText primary={item.label} />
						</ListItemButton>
					</ListItem>
				))}
			</List>
		</Box>
	);

	return (
		<Box sx={{display: 'flex'}}>
			<CssBaseline />
			<AppBar component='nav'>
				<Toolbar>
					<IconButton
						color='inherit'
						aria-label='open menu'
						edge='start'
						onClick={handleDrawerToggle}
						sx={{mr: 2, display: {sm: 'none'}}}
					>
						<MenuIcon />
					</IconButton>
					<Typography
						variant='h6'
						component='div'
						sx={{
							flexGrow: 1,
							display: {xs: 'none', sm: 'block'},
						}}
					>
						YTDPNL
					</Typography>
					<Box sx={{display: {xs: 'none', sm: 'block'}}}>
						{navItems.map(item => (
							<Button
								onClick={() => {
									navigate(item.link);
								}}
								key={item.link}
								sx={{color: 'primary.contrastText'}}
							>
								{item.label}
							</Button>
						))}
						<Box
							sx={{
								display: 'inline-block',
								ml: 2,
								color: 'primary.contrastText2',
							}}
						>
							<UserWidgetC />
						</Box>
					</Box>
				</Toolbar>
			</AppBar>
			<Box component='nav'>
				<Drawer
					variant='temporary'
					container={window.document.body}
					open={drawerOpen}
					onClose={handleDrawerToggle}
					ModalProps={{
						keepMounted: true,
					}}
					sx={{
						display: {xs: 'block', sm: 'none'},
						'& .MuiDrawer-paper': {boxSizing: 'border-box', width: drawerWidth},
					}}
				>
					{drawer}
				</Drawer>
			</Box>
			<Box component='main' sx={{p: 3, mt: 6, width: '100%'}}>
				<Routes>
					{navItems.map(item => (
						<Route element={<item.component />} key={item.link} path={item.link} />
					))}
					<Route element={<NotFoundC />} path='*' />
				</Routes>
			</Box>
		</Box>
	);
};

export default LayoutC;
