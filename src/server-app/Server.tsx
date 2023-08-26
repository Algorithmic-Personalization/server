import React, {useState} from 'react';
import {Route, Routes} from 'react-router-dom';

import Protect from './components/shared/RequireAuthC';
import LayoutP from './components/LayoutP';
import LoginP from './components/LoginP';
import RegisterP from './components/RegisterP';
import ForgotP from './components/ForgotP';

export const Server = () => {
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');

	return (
		<Routes>
			<Route path='*' element={<Protect><LayoutP /></Protect>} />
			<Route path='/login' element={<LoginP {...{email, setEmail, password, setPassword}} />} />
			<Route path='/register' element={<RegisterP {...{email, setEmail, password, setPassword}} />} />
			<Route path='/forgot' element={<ForgotP {...{email, setEmail, password, setPassword}} />} />
		</Routes>
	);
};

export default Server;
