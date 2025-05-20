import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
	Container,
	Paper,
	TextField,
	Button,
	Typography,
	Box,
	MenuItem,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { api } from '../../services/apiService';

export const MenuEditor = () => {
	const { menuId } = useParams();
	const navigate = useNavigate();
	const [menu, setMenu] = useState({
		id: '',
		title: '',
		description: '',
		type: 'all',
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const menuTypes = [
		'all',
		'wine',
		'lunch',
		'sweets',
		'small snack',
		'small bubbels',
		'small cocktails',
		'small beer',
	];

	useEffect(() => {
		if (menuId) {
			loadMenu();
		}
	}, [menuId]);

	const loadMenu = async () => {
		try {
			setLoading(true);
			const response = await api.getMenuById(menuId);
			setMenu(response.data.data);
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
			if (menuId) {
				await Promise.all([
					api.updateMenu(menuId, 'title', menu.title),
					api.updateMenu(menuId, 'description', menu.description),
					api.updateMenu(menuId, 'type', menu.type),
				]);
			} else {
				await api.createMenu(menu);
			}
			navigate('/');
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container maxWidth="md">
			<Paper sx={{ p: 3, mt: 3 }}>
				<Typography variant="h5" gutterBottom>
					{menuId ? 'Edit Menu' : 'New Menu'}
				</Typography>

				{error && (
					<Typography color="error" sx={{ mb: 2 }}>
						{error}
					</Typography>
				)}

				<form onSubmit={handleSubmit}>
					<TextField
						fullWidth
						label="Menu ID"
						value={menu.id}
						onChange={(e) =>
							setMenu({ ...menu, id: e.target.value })
						}
						margin="normal"
						required
						disabled={!!menuId}
					/>

					<TextField
						fullWidth
						label="Title"
						value={menu.title}
						onChange={(e) =>
							setMenu({ ...menu, title: e.target.value })
						}
						margin="normal"
						required
					/>

					<TextField
						fullWidth
						label="Description"
						value={menu.description}
						onChange={(e) =>
							setMenu({ ...menu, description: e.target.value })
						}
						margin="normal"
						multiline
						rows={3}
					/>

					<TextField
						select
						fullWidth
						label="Type"
						value={menu.type}
						onChange={(e) =>
							setMenu({ ...menu, type: e.target.value })
						}
						margin="normal"
						required>
						{menuTypes.map((type) => (
							<MenuItem key={type} value={type}>
								{type}
							</MenuItem>
						))}
					</TextField>
					<Button
						variant="contained"
						startIcon={<Edit />}
						component={Link}
						to="/menu/new">
						Edit items in this menu
					</Button>

					<Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
						<Button
							variant="contained"
							type="submit"
							disabled={loading}>
							{loading ? 'Saving...' : 'Save'}
						</Button>

						<Button
							variant="outlined"
							onClick={() => navigate('/')}>
							Cancel
						</Button>
					</Box>
				</form>
			</Paper>
		</Container>
	);
};
