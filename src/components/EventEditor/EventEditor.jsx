import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BackButton } from '../BackButton/BackButton';
import { formatDateTime } from '../../utils/formatDateTime';
import {
	Container,
	Paper,
	TextField,
	Button,
	Typography,
	Box,
	MenuItem,
	Alert,
	CircularProgress,
	Fade,
} from '@mui/material';
import { api } from '../../services/apiService';

const eventTypes = ['dj', 'wine', 'private', 'other'];

export const EventEditor = () => {
	const { eventId } = useParams();
	const navigate = useNavigate();
	const [event, setEvent] = useState({
		title: '',
		shortDescription: '',
		longDescription: '',
		date: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
		startTime: '',
		endTime: '',
		type: '',
		image: '/src/assets/pictures/event.png',
		updatedAt: '',
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (eventId) {
			loadEvent();
		}
	}, [eventId]);

	const loadEvent = async () => {
		try {
			setLoading(true);
			const response = await api.getEventById(eventId);
			setEvent(response.data);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			setLoading(true);
			setError(null);

			// Validate shortDescription length
			if (event.shortDescription.length > 100) {
				setError('Short description must be less than 100 characters');
				return;
			}

			// Create the event object without eventId, createdAt, and updatedAt
			const eventData = {
				title: event.title,
				shortDescription: event.shortDescription,
				longDescription: event.longDescription,
				date: event.date,
				startTime: event.startTime,
				endTime: event.endTime,
				type: event.type,
				image: event.image,
			};

			if (eventId) {
				await api.updateEvent(eventId, eventData);
			} else {
				await api.createEvent(eventData);
			}
			navigate('/events');
		} catch (err) {
			console.log(err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container maxWidth="md">
			<BackButton />
			<Fade in={true} timeout={800}>
				<Paper sx={{ p: 3, mt: 3 }}>
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
							<Typography variant="h5" gutterBottom>
								{eventId ? `Edit: ${event.title}` : 'New Event'}
							</Typography>

							{event.updatedAt && (
								<Typography
									variant="caption"
									color="text.secondary">
									Last Updated:{' '}
									{formatDateTime(event.updatedAt)}
								</Typography>
							)}

							{error && (
								<Alert severity="error" sx={{ mt: 2, mb: 2 }}>
									{error}
								</Alert>
							)}

							<form onSubmit={handleSubmit}>
								<TextField
									fullWidth
									label="Title"
									value={event.title}
									onChange={(e) =>
										setEvent({
											...event,
											title: e.target.value,
										})
									}
									margin="normal"
									required
									inputProps={{ maxLength: 20 }}
									helperText={`${event.title.length}/20 characters`}
								/>
								<TextField
									fullWidth
									label="Short Description"
									value={event.shortDescription}
									onChange={(e) =>
										setEvent({
											...event,
											shortDescription: e.target.value,
										})
									}
									margin="normal"
									required
									inputProps={{ maxLength: 50 }}
									helperText={`${event.shortDescription.length}/50 characters`}
								/>

								<TextField
									fullWidth
									label="Long Description"
									value={event.longDescription}
									onChange={(e) =>
										setEvent({
											...event,
											longDescription: e.target.value,
										})
									}
									margin="normal"
									multiline
									rows={4}
									required
								/>
								<TextField
									fullWidth
									label="Date"
									type="date"
									value={event.date}
									onChange={(e) =>
										setEvent({
											...event,
											date: e.target.value,
										})
									}
									margin="normal"
									required
									InputLabelProps={{ shrink: true }}
								/>
								<Box sx={{ display: 'flex', gap: 2 }}>
									<TextField
										fullWidth
										label="Start Time"
										type="time"
										value={event.startTime}
										onChange={(e) =>
											setEvent({
												...event,
												startTime: e.target.value,
											})
										}
										margin="normal"
										required
										InputLabelProps={{ shrink: true }}
									/>

									<TextField
										fullWidth
										label="End Time"
										type="time"
										value={event.endTime}
										onChange={(e) =>
											setEvent({
												...event,
												endTime: e.target.value,
											})
										}
										margin="normal"
										required
										InputLabelProps={{ shrink: true }}
									/>
								</Box>
								<TextField
									select
									fullWidth
									label="Event Type"
									value={event.type}
									onChange={(e) =>
										setEvent({
											...event,
											type: e.target.value,
										})
									}
									margin="normal"
									required>
									{eventTypes.map((type) => (
										<MenuItem key={type} value={type}>
											{type.charAt(0).toUpperCase() +
												type.slice(1)}
										</MenuItem>
									))}
								</TextField>
								<Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
									<Button
										variant="contained"
										type="submit"
										disabled={loading}>
										{loading ? 'Saving...' : 'Save Event'}
									</Button>

									<Button
										variant="outlined"
										onClick={() => navigate('/events')}>
										Cancel
									</Button>
								</Box>
							</form>
						</>
					)}
				</Paper>
			</Fade>
		</Container>
	);
};
