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
import { api } from '../../services/apiService';

export const WineListOverview = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [wineList, setWineList] = useState(null);
	const [loading, setLoading] = useState(true);

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
													</TableRow>
												</TableHead>
												<TableBody>
													{(area.items || []).map(
														(wine) => (
															<TableRow
																key={wine._id}>
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
																				wine._id
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
				</>
			) : (
				<Typography color="error">
					Could not fetch the lists.
				</Typography>
			)}
		</Container>
	);
};
