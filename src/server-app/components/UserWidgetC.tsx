import React, {useState, useEffect} from 'react';

import {Typography} from '@mui/material';

import {useAdminApi} from '../adminApiProvider';

import type Admin from '../../common/models/admin';

export const UserWidgetC: React.FC = () => {
	const api = useAdminApi();

	const [admin, setAdmin] = useState<Admin>();
	const [error, setError] = useState<string | undefined>();

	useEffect(() => {
		(async () => {
			const res = await api.getAuthTest();

			if (res.kind === 'Success') {
				setAdmin(res.value);
			} else {
				setError(res.message);
			}
		})();
	}, []);

	if (error) {
		return <Typography color='error.main'>{error}</Typography>;
	}

	if (!admin) {
		return null;
	}

	return <Typography>{admin.email}</Typography>;
};

export default UserWidgetC;
