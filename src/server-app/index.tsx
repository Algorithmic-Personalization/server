import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';

import {ThemeProvider} from '@mui/material';

import {BrowserRouter} from 'react-router-dom';

import theme from './theme';
import AdminApiProvider, {serverUrl} from './adminApiProvider';
import {createAdminApi} from './adminApi';

import Server from './Server';
import LoginModalC from './components/LoginModalC';

const elt = document.getElementById('app');

if (!elt) {
	throw new Error('No element with id "app" found');
}

const App: React.FC = () => {
	const [loginModalOpen, setLoginModalOpen] = useState(false);

	return (<React.StrictMode>
		<ThemeProvider theme={theme}>
			<BrowserRouter>
				<AdminApiProvider value={createAdminApi(serverUrl, () => {
					setLoginModalOpen(true);
				})}>
					<LoginModalC
						open={loginModalOpen}
						setOpen={setLoginModalOpen}
					/>
					<Server />
				</AdminApiProvider>
			</BrowserRouter>
		</ThemeProvider>
	</React.StrictMode>);
};

createRoot(elt).render(<App />);
