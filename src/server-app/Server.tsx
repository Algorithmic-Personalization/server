import React, {useState} from 'react';
import {Route, Routes} from 'react-router-dom';

import Protect from './components/RequireAuthC';
import LoginC from './components/LoginC';
import RegisterC from './components/RegisterC';
import LayoutC from './components/LayoutC';

export const Server = () => {
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');

	return (
		<Routes>
			<Route path='*' element={<Protect><LayoutC /></Protect>} />
			<Route path='/login' element={<LoginC {...{email, setEmail, password, setPassword}} />} />
			<Route path='/register' element={<RegisterC {...{email, setEmail, password, setPassword}} />} />
		</Routes>
	);
};

export default Server;
