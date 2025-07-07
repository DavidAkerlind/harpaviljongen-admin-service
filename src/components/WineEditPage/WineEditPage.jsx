import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
	Container,
	Typography,
	TextField,
	Button,
	Box,
	Paper,
	CircularProgress,
	Switch,
	FormControlLabel,
} from '@mui/material';
import { api } from '../../services/apiService';

export const WineEditPage = () => {
	const { id, wineId } = useParams();
	const navigate = useNavigate();
	const [wine, setWine] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		const fetchWine = async () => {
			setLoading(true);
			try {
				let wineList = await api.getWineListById(id);
				wineList = wineList.data;
				let found = null;
				for (const country of Object.values(wineList.countries || {})) {
					for (const area of country.areas || []) {
						const match = (area.items || []).find(
							(w) => w.id === wineId
						);
						if (match)
							found = {
								...match,
								country: country.country,
								area: area.area,
							};
					}
				}
				console.log(found);
				setWine(found);
			} catch {
				setWine(null);
			}
			setLoading(false);
		};
		fetchWine();
	}, [id, wineId]);

	const handleSave = async () => {
		setSaving(true);
		try {
			await api.updateWine(id, wineId, wine);
			navigate(`/wine-lists/${id}`);
		} catch (e) {
			alert('Kunde inte spara ändringar: ' + e.message);
		}
		setSaving(false);
	};

	const handleToggleWine = async (wineId) => {
		await api.toggleWineActive(id, wine.id);
		handleSave();
	};

	return (
		<Container maxWidth="sm">
			<Button
				sx={{ mb: 2 }}
				onClick={() => navigate(`/wine-lists/${id}`)}>
				Back to wine list
			</Button>
			<Paper sx={{ p: 3 }}>
				{loading ? (
					<CircularProgress />
				) : wine ? (
					<Box>
						<Typography variant="h5" sx={{ mb: 2 }}>
							Edit Wine
						</Typography>

						<TextField
							label="Country"
							value={wine.country || ''}
							onChange={(e) =>
								setWine({ ...wine, country: e.target.value })
							}
							fullWidth
							margin="normal"
						/>
						<TextField
							label="Area"
							value={wine.area || ''}
							onChange={(e) =>
								setWine({ ...wine, area: e.target.value })
							}
							fullWidth
							margin="normal"
						/>
						<TextField
							label="Name"
							value={wine.name || ''}
							onChange={(e) =>
								setWine({ ...wine, name: e.target.value })
							}
							fullWidth
							margin="normal"
						/>
						<TextField
							label="Price"
							type="number"
							value={wine.price || ''}
							onChange={(e) =>
								setWine({
									...wine,
									price: Number(e.target.value),
								})
							}
							fullWidth
							margin="normal"
						/>
						<FormControlLabel
							control={
								<Switch
									checked={wine.active}
									onChange={() =>
										handleToggleWine(id, wine.id)
									}
									color="primary"
								/>
							}
							label="Active"
						/>
						<Button
							variant="contained"
							onClick={handleSave}
							sx={{ mt: 2 }}
							disabled={saving}>
							Save
						</Button>
					</Box>
				) : (
					<Typography color="error">Could not load wine</Typography>
				)}
			</Paper>
		</Container>
	);
};
