import React from 'react';

import {
	Box,
	Paper,
	Table,
	TableContainer,
	TableHead,
	TableRow,
	TableBody,
	TableCell,
	Typography,
} from '@mui/material';

import {styled} from '@mui/material/styles';

type Element = React.ReactNode;

export type ColumnDescriptor = Array<{
	key: string;
	element: Element;
}>;

export type RowDescriptor<T> = (item: T) => {
	key: string;
	elements: Element[];
};

export type TableDescriptor<T> = {
	headers: ColumnDescriptor;
	rows: RowDescriptor<T>;
};

const StyledRow = styled(TableRow)(({theme}) => ({
	'&:nth-of-type(odd)': {
		backgroundColor: theme.palette.action.hover,
	},
}));

const decorateHeader = (element: Element) => {
	if (typeof element === 'string') {
		return <Typography sx={{fontWeight: 'bold'}}>{element}</Typography>;
	}

	return element;
};

export function createTableComponent<T>(descriptor: TableDescriptor<T>): React.FC<{items: T[]}> {
	const TableComponent: React.FC<{items: T[]}> = ({items}) => {
		if (items.length === 0) {
			return <Typography variant='body1'>No items</Typography>;
		}

		const {headers} = descriptor;

		return (
			<>
				<Box
					sx={{
						display: {
							xs: 'none',
							lg: 'block',
						},
					}}
				>
					<TableContainer component={Paper}>
						<Table>
							<TableHead>
								<TableRow>
									{headers.map(({key, element}) => (
										<TableCell key={key}>
											{decorateHeader(element)}
										</TableCell>
									))}
								</TableRow>
							</TableHead>
							<TableBody>
								{items.map(item => {
									const {key, elements: values} = descriptor.rows(item);

									return (
										<StyledRow key={key}>
											{values.map((value, index) => (
												<TableCell key={headers[index].key}>
													{value}
												</TableCell>
											))}
										</StyledRow>
									);
								})}
							</TableBody>
						</Table>
					</TableContainer>
				</Box>
				<Box
					sx={{
						display: {
							xs: 'block',
							lg: 'none',
						},
					}}
				>
					{items.map(item => {
						const {key, elements} = descriptor.rows(item);

						return (
							<Box
								key={key}
								component={Paper}
								sx={{
									p: 2,
									mb: 2,
								}}
							>
								{elements.map((element, index) => (
									<Box
										key={headers[index].key}
										sx={{
											mb: 1,
										}}
									>
										{decorateHeader(headers[index].element)}
										<Box
											sx={{
												pl: 2,
											}}
										>
											{element}
										</Box>
									</Box>
								))}
							</Box>
						);
					})}
				</Box>
			</>
		);
	};

	return TableComponent;
}

export default createTableComponent;
