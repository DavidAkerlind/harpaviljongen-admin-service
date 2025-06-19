import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
	Container,
	Paper,
	Typography,
	Box,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Switch,
	Snackbar,
	CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { api } from '../../services/apiService';
import './wineListManager.css';

export const WineListManager = () => {
	const [wineLists, setWineLists] = useState([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	const loadWineLists = async () => {
		setLoading(true);
		try {
			const data = await api.getAllWineLists();
			let realData = data.data;
			setWineLists(Array.isArray(realData) ? realData : []);
		} catch (e) {
			setWineLists([]);
		}
		setLoading(false);
	};

	useEffect(() => {
		loadWineLists();
	}, []);

	return (
		<Container maxWidth="md">
			<Typography variant="h4" sx={{ mb: 2 }}>
				Winelists
			</Typography>
			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
					<CircularProgress />
				</Box>
			) : (
				<TableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Name</TableCell>
								<TableCell>How many wines</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{wineLists.map((list) => (
								<TableRow
									key={list._id}
									hover
									sx={{ cursor: 'pointer' }}
									onClick={() =>
										navigate(`/wine-lists/${list.id}`)
									}>
									<TableCell>{list.title}</TableCell>
									<TableCell>
										{Object.values(
											list.countries || {}
										).reduce(
											(sum, country) =>
												sum +
												(country.areas
													? country.areas.reduce(
															(areaSum, area) =>
																areaSum +
																(area.items
																	? area.items
																			.length
																	: 0),
															0
													  )
													: 0),
											0
										)}
									</TableCell>
									<TableCell>Edit</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}
		</Container>
	);
};
