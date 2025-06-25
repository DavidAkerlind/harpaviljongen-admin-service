import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
	Container,
	Typography,
	Paper,
	Box,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	CircularProgress,
	Switch,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog';

import { api } from '../../services/apiService';

export const WineListOverview = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [wineList, setWineList] = useState(null);
	const [loading, setLoading] = useState(true);
	const [deleteDialog, setDeleteDialog] = useState({
		open: false,
		wineId: null,
	});

	const fetchWineList = async () => {
		setLoading(true);
		try {
			const data = await api.getWineListById(id);
			setWineList(data.data ? data.data : data);
		} catch {
			setWineList(null);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchWineList();
	}, [id]);

	const handleToggleWine = async (wineId) => {
		await api.toggleWineActive(id, wineId);
		fetchWineList();
	};

	const handleDeleteWine = async (wineId) => {
		console.log(id, wineId);

		await api.deleteWine(id, wineId);
		fetchWineList();
	};

	return (
		<Container maxWidth="md">
			<Button sx={{ mb: 2 }} onClick={() => navigate('/wine-lists')}>
				Back to wine lists
			</Button>
			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
					<CircularProgress />
				</Box>
			) : wineList ? (
				<>
					<Typography variant="h4" sx={{ mb: 2 }}>
						{wineList.title}
					</Typography>
					<Button
						variant="contained"
						color="primary"
						sx={{ mb: 2 }}
						onClick={() => navigate(`/wine-lists/${id}/add-wine`)}>
						Add new wine
					</Button>
					{Object.values(wineList.countries || {}).map((country) => (
						<Box key={country.country} sx={{ mb: 3 }}>
							<Typography variant="h6">
								{country.country}
							</Typography>
							{country.areas && country.areas.length > 0 ? (
								country.areas.map((area) => (
									<Box key={area.area} sx={{ mb: 2, ml: 2 }}>
										<Typography variant="subtitle1">
											{area.area}
										</Typography>

										<TableContainer
											component={Paper}
											sx={{ mb: 2 }}>
											<Table>
												<TableHead>
													<TableRow>
														<TableCell>
															Name
														</TableCell>
														<TableCell>
															Price
														</TableCell>
														<TableCell>
															Active
														</TableCell>
														<TableCell>
															Edit
														</TableCell>
														<TableCell>
															Delete
														</TableCell>
													</TableRow>
												</TableHead>

												<TableBody>
													{(area.items || []).map(
														(wine) => (
															<TableRow
																key={wine.id}>
																<TableCell>
																	{wine.name}
																</TableCell>
																<TableCell>
																	{wine.price}{' '}
																	kr
																</TableCell>
																<TableCell>
																	<Switch
																		checked={
																			wine.active
																		}
																		onChange={() =>
																			handleToggleWine(
																				wine.id
																			)
																		}
																		color="primary"
																	/>
																</TableCell>
																<TableCell>
																	<Button
																		variant="outlined"
																		size="small"
																		onClick={() =>
																			navigate(
																				`/wine-lists/${id}/wine/${wine.id}`
																			)
																		}>
																		Edit
																	</Button>
																</TableCell>
																<TableCell>
																	<Button
																		variant="outlined"
																		color="error"
																		size="small"
																		onClick={(
																			e
																		) => {
																			e.stopPropagation();
																			setDeleteDialog(
																				{
																					open: true,
																					wineId: wine.id,
																				}
																			);
																		}}
																		startIcon={
																			<DeleteIcon />
																		}>
																		Delete
																	</Button>
																</TableCell>
															</TableRow>
														)
													)}
												</TableBody>
											</Table>
										</TableContainer>
									</Box>
								))
							) : (
								<Typography
									color="text.secondary"
									sx={{ ml: 2 }}>
									No areas
								</Typography>
							)}
						</Box>
					))}
					<ConfirmDialog
						open={deleteDialog.open}
						title="Delete Wine"
						message="Are you sure you want to delete this wine?"
						confirmText="Delete Wine"
						onConfirm={() => {
							handleDeleteWine(deleteDialog.wineId);
							setDeleteDialog({ open: false, wineId: null });
						}}
						onCancel={() =>
							setDeleteDialog({ open: false, wineId: null })
						}
						severity="error"
					/>
				</>
			) : (
				<Typography color="error">
					Could not fetch the lists.
				</Typography>
			)}
		</Container>
	);
};
