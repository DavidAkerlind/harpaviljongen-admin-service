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
	TextField,
	Switch,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';

import { api } from '../../services/apiService';

export const AddWinePage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [form, setForm] = useState({
		country: '',
		area: '',
		name: '',
		price: '',
	});
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [countries, setCountries] = useState([]);
	const [areas, setAreas] = useState([]);

	useEffect(() => {
		const fetchCountries = async () => {
			try {
				const wineList = await api.getWineListById(id);
				const data = wineList.data || wineList;
				const countryList = Object.keys(data.countries || {});
				setCountries(countryList);

				// Om ett land är valt, visa dess områden
				if (form.country && data.countries[form.country]) {
					const areaList = (
						data.countries[form.country].areas || []
					).map((a) => a.area);
					setAreas(areaList);
				} else {
					setAreas([]);
				}
			} catch {
				setCountries([]);
				setAreas([]);
			}
		};
		fetchCountries();
		// Lägg till form.country som dependency för att uppdatera areas när land ändras
	}, [id, form.country]);

	useEffect(() => {
		console.log(countries);
		console.log(areas);
	}, [areas, countries]);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError('');
		setSuccess('');
		try {
			console.log(id, form.country, form.area, form.name);
			await api.addWine(id, {
				country: form.country,
				area: form.area,
				name: form.name,
				price: Number(form.price),
			});

			setSuccess('Wine added!');
			setTimeout(() => navigate(`/wine-lists/${id}`), 800);
		} catch (e) {
			setError(e.message || 'Could not add wine');
		}
		setSaving(false);
	};

	return (
		<Container maxWidth="sm">
			<Button
				sx={{ mb: 2 }}
				onClick={() => navigate(`/wine-lists/${id}`)}>
				Back to wine list
			</Button>
			<Paper sx={{ p: 3 }}>
				<Typography variant="h5" sx={{ mb: 2 }}>
					Add New Wine to {id}
				</Typography>
				<form onSubmit={handleSubmit}>
					<Autocomplete
						freeSolo
						options={countries}
						value={form.country}
						onInputChange={(_, value) =>
							setForm({ ...form, country: value, area: '' })
						}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Country"
								name="country"
								margin="normal"
								fullWidth
								required
							/>
						)}
					/>

					<Autocomplete
						freeSolo
						options={areas}
						value={form.area}
						onInputChange={(_, value) =>
							setForm({ ...form, area: value })
						}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Area"
								name="area"
								margin="normal"
								fullWidth
							/>
						)}
					/>
					<TextField
						label="Name"
						name="name"
						value={form.name}
						onChange={handleChange}
						fullWidth
						margin="normal"
						required
					/>
					<TextField
						label="Price"
						name="price"
						type="number"
						value={form.price}
						onChange={handleChange}
						fullWidth
						margin="normal"
						required
					/>
					<Box sx={{ mt: 2 }}>
						<Button
							type="submit"
							variant="contained"
							color="primary"
							disabled={saving}>
							{saving ? (
								<CircularProgress size={24} />
							) : (
								'Add Wine'
							)}
						</Button>
					</Box>
					{error && (
						<Typography color="error" sx={{ mt: 2 }}>
							{error}
						</Typography>
					)}
					{success && (
						<Typography color="success.main" sx={{ mt: 2 }}>
							{success}
						</Typography>
					)}
				</form>
			</Paper>
		</Container>
	);
};
