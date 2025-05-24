import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDateTime } from '../../utils/formatDateTime';
import { CircularProgress, Fade } from '@mui/material';

import {
	Container,
	Paper,
	Typography,
	Box,
	Button,
	Card,
	CardContent,
	IconButton,
	Chip,
	Alert,
	Tooltip,
} from '@mui/material';
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
} from '@mui/icons-material';
import { api } from '../../services/apiService';
import { BackButton } from '../BackButton/BackButton';
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog';

const eventTypeColors = {
	dj: 'primary',
	wine: 'secondary',
	private: 'error',
	other: 'default',
};

export const EventList = () => {
	const navigate = useNavigate();
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [deleteDialog, setDeleteDialog] = useState(null);

	useEffect(() => {
		loadEvents();
	}, []);

	const loadEvents = async () => {
		try {
			setLoading(true);
			const response = await api.getAllEvents();
			setEvents(response.data || []);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteEvent = async (eventId) => {
		try {
			await api.deleteEvent(eventId);
			await loadEvents();
			setEvents(events.filter((event) => event.eventId !== eventId));
			setDeleteDialog(null);
		} catch (err) {
			setError(err.message);
		}
	};

	const formatEventDate = (date) => {
		return new Date(date).toLocaleDateString('sv-SE');
	};

	return (
		<Container maxWidth="lg">
			<BackButton />
			<Fade in={true} timeout={800}>
				<Box sx={{ mt: 4, mb: 4 }}>
					{loading ? (
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'center',
								p: 3,
							}}>
							<CircularProgress />
						</Box>
					) : (
						<>
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									mb: 3,
								}}>
								<Typography variant="h4">Events</Typography>
								<Button
									variant="contained"
									startIcon={<AddIcon />}
									onClick={() => navigate('/events/new')}>
									Add Event
								</Button>
							</Box>

							{error && (
								<Alert severity="error" sx={{ mb: 3 }}>
									{error}
								</Alert>
							)}

							{events.map((event) => (
								<Card
									component={Link}
									to={`/events/${event.eventId}`}
									sx={{ textDecoration: 'none' }}>
									<Card
										key={event.eventId}
										sx={{
											mb: 2,
											transition: 'transform 0.2s',
											'&:hover': {
												transform: 'translateX(8px)',
											},
										}}>
										<CardContent>
											<Box
												sx={{
													display: 'flex',
													justifyContent:
														'space-between',
													flexDirection: {
														xs: 'column',
														sm: 'row',
													},
													gap: 2,
												}}>
												<Box sx={{ flex: 1 }}>
													<Box
														sx={{
															display: 'flex',
															alignItems:
																'center',
															gap: 2,
															mb: 1,
														}}>
														<Typography variant="h6">
															{event.title}
														</Typography>
														<Chip
															label={event.type}
															color={
																eventTypeColors[
																	event.type
																]
															}
															size="small"
														/>
													</Box>

													<Typography
														color="text.secondary"
														gutterBottom>
														{formatEventDate(
															event.date
														)}{' '}
														• {event.startTime}-
														{event.endTime}
													</Typography>

													<Typography variant="body2">
														{event.shortDescription}
													</Typography>

													{event.updatedAt && (
														<Typography
															variant="caption"
															color="text.secondary"
															sx={{
																display:
																	'block',
																mt: 1,
															}}>
															Last updated:{' '}
															{formatDateTime(
																event.updatedAt
															)}
														</Typography>
													)}
												</Box>

												<Box
													sx={{
														display: 'flex',
														gap: 1,
														alignItems:
															'flex-start',
													}}>
													<Tooltip title="Edit Event">
														<IconButton
															onClick={(e) => {
																e.preventDefault();
																navigate(
																	`/events/${event.eventId}`
																);
															}}
															color="primary">
															<EditIcon />
														</IconButton>
													</Tooltip>

													<Tooltip title="Delete Event">
														<IconButton
															onClick={(e) => {
																e.preventDefault();
																setDeleteDialog(
																	event
																);
															}}
															color="error">
															<DeleteIcon />
														</IconButton>
													</Tooltip>
												</Box>
											</Box>
										</CardContent>
									</Card>
								</Card>
							))}

							{events.length === 0 && (
								<Paper sx={{ p: 3, textAlign: 'center' }}>
									<Typography color="text.secondary">
										No events found. Click "Add Event" to
										create one.
									</Typography>
								</Paper>
							)}
						</>
					)}
				</Box>
			</Fade>

			<ConfirmDialog
				open={!!deleteDialog}
				title="Delete Event"
				message={`Are you sure you want to delete "${deleteDialog?.title}"?`}
				confirmText="Delete"
				onConfirm={() => handleDeleteEvent(deleteDialog?.eventId)}
				onCancel={() => setDeleteDialog(null)}
				severity="error"
			/>
		</Container>
	);
};
