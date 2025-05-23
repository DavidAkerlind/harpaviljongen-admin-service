import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton } from '../BackButton/BackButton';
import { formatDateTime } from '../../utils/formatDateTime';
import {
	Container,
	Paper,
	TextField,
	Button,
	Typography,
	Box,
	Alert,
	Grid,
	Card,
	CardContent,
	useTheme,
	useMediaQuery,
} from '@mui/material';
import { Update as UpdateIcon } from '@mui/icons-material';
import { api } from '../../services/apiService';

const weekDays = [
	'Måndag',
	'Tisdag',
	'Onsdag',
	'Torsdag',
	'Fredag',
	'Lördag',
	'Söndag',
];

export const OpeningHoursEditor = () => {
	const navigate = useNavigate();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const [openingHours, setOpeningHours] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	const [editedHours, setEditedHours] = useState({});

	useEffect(() => {
		loadOpeningHours();
	}, []);

	const loadOpeningHours = async () => {
		try {
			setLoading(true);
			const response = await api.getOpeningHours();
			setOpeningHours(response.data || []);
			// Initialize edited hours from response
			const initialHours = {};
			response.data?.forEach((day) => {
				initialHours[day.day] = day.hours;
			});
			setEditedHours(initialHours);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleUpdate = async (day) => {
		try {
			setLoading(true);
			setError(null);
			await api.updateOpeningHours(
				day,
				editedHours[day] || { from: '', to: '' }
			);
			setSuccess(`Updated ${day}'s hours successfully`);
			await loadOpeningHours();
			setTimeout(() => setSuccess(null), 3000);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (day, field, value) => {
		setEditedHours((prev) => ({
			...prev,
			[day]: {
				...prev[day],
				[field]: value,
			},
		}));
	};

	const handleUpdateAll = async () => {
		try {
			setLoading(true);
			setError(null);
			// Update each day sequentially
			for (const day of weekDays) {
				if (editedHours[day]) {
					await api.updateOpeningHours(
						day,
						editedHours[day] || { from: '', to: '' }
					);
				}
			}
			setSuccess('Updated all opening hours successfully');
			await loadOpeningHours();
			setTimeout(() => setSuccess(null), 3000);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container maxWidth="md">
			<BackButton />
			<Paper sx={{ p: 3, mt: 3 }}>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						mb: 3,
					}}>
					<Typography variant="h5">Opening Hours</Typography>
					<Button
						variant="contained"
						startIcon={<UpdateIcon />}
						onClick={loadOpeningHours}
						disabled={loading}>
						Refresh
					</Button>
				</Box>

				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				{success && (
					<Alert severity="success" sx={{ mb: 2 }}>
						{success}
					</Alert>
				)}

				<Grid container spacing={2}>
					{weekDays.map((day) => {
						const dayHours = editedHours[day] || {
							from: '',
							to: '',
						};
						return (
							<Grid item xs={12} key={day}>
								<Card>
									<CardContent>
										<Box
											sx={{
												display: 'flex',
												flexDirection: isMobile
													? 'column'
													: 'row',
												alignItems: isMobile
													? 'stretch'
													: 'center',
												gap: 2,
											}}>
											<Typography
												sx={{
													minWidth: isMobile
														? 'auto'
														: 100,
													mb: isMobile ? 1 : 0,
													fontWeight: 500,
												}}>
												{day}
											</Typography>

											<Box
												sx={{
													display: 'flex',
													flexDirection: isMobile
														? 'column'
														: 'row',
													gap: 2,
													flex: 1,
												}}>
												<TextField
													label="From"
													value={dayHours.from}
													onChange={(e) =>
														handleInputChange(
															day,
															'from',
															e.target.value
														)
													}
													placeholder="e.g. 11:00"
													fullWidth={isMobile}
													size="small"
												/>
												<TextField
													label="To"
													value={dayHours.to}
													onChange={(e) =>
														handleInputChange(
															day,
															'to',
															e.target.value
														)
													}
													placeholder="e.g. 22:00"
													fullWidth={isMobile}
													size="small"
												/>
												<Button
													variant="contained"
													onClick={() =>
														handleUpdate(day)
													}
													disabled={loading}
													size="small">
													Update
												</Button>
											</Box>
										</Box>
									</CardContent>
								</Card>
							</Grid>
						);
					})}
				</Grid>

				<Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
					<Button variant="outlined" onClick={() => navigate('/')}>
						Back to Dashboard
					</Button>
					<Button
						variant="contained"
						onClick={handleUpdateAll}
						disabled={loading}
						color="primary"
						startIcon={<UpdateIcon />}>
						Update All
					</Button>
				</Box>
			</Paper>
		</Container>
	);
};
