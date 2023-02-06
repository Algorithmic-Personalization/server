import React from 'react';

import {Navigate, useLocation} from 'react-router-dom';

import {useAdminApi} from '../adminApiProvider';

export const RequireAuthC: React.FC<{
	children?: React.ReactNode;
}> = ({children}) => {
	const api = useAdminApi();
	const location = useLocation();

	if (!api.isLoggedIn()) {
		console.log('not logged in, redirecting to /login');
		return <Navigate to='/login' state={{from: location}} replace />;
	}

	return <>{children}</>;
};

export default RequireAuthC;
