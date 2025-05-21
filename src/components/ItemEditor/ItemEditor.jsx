import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
	Container,
	Paper,
	TextField,
	Switch,
	Button,
	Typography,
	Box,
	FormControlLabel,
} from '@mui/material';
import { api } from '../../services/apiService';

export const ItemEditor = () => {
	const { menuId, itemId } = useParams();
	const navigate = useNavigate();
	const [item, setItem] = useState({
		title: '',
		description: '',
		price: '',
		active: true,
		producer: '',
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (itemId) {
			loadItem();
		}
	}, [itemId, menuId]);

	const loadItem = async () => {
		try {
			setLoading(true);
			const response = await api.getMenuItems(menuId);
			const foundItem = response.data.data.find((i) => i.id === itemId);
			if (foundItem) {
				setItem(foundItem);
			}
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
			if (itemId) {
				// Update existing item
				await Promise.all([
					api.updateMenuItem(menuId, itemId, 'title', item.title),
					api.updateMenuItem(
						menuId,
						itemId,
						'description',
						item.description
					),
					api.updateMenuItem(menuId, itemId, 'price', item.price),
					api.toggleMenuItem(menuId, itemId),
					// Update producer if it's a wine menu
					...(menuId === 'menu-wine'
						? [
								api.updateMenuItem(
									menuId,
									itemId,
									'producer',
									item.producer
								),
						  ]
						: []),
				]);
			} else {
				// Create new item
				await api.addMenuItem(menuId, item);
			}
			navigate(`/menu/${menuId}/items`);
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
					{itemId
						? `Edit Item in '${menuId}'`
						: `New Item in '${menuId}'`}
				</Typography>

				{error && (
					<Typography color="error" sx={{ mb: 2 }}>
						{error}
					</Typography>
				)}

				<form onSubmit={handleSubmit}>
					<TextField
						fullWidth
						label="Title"
						value={item.title}
						onChange={(e) =>
							setItem({ ...item, title: e.target.value })
						}
						margin="normal"
						required
					/>

					<TextField
						fullWidth
						label="Description"
						value={item.description}
						onChange={(e) =>
							setItem({ ...item, description: e.target.value })
						}
						margin="normal"
						multiline
						rows={3}
					/>
					{/* Show producer field only for wine menus */}
					{menuId === 'menu-wine' && (
						<TextField
							fullWidth
							label="Producer"
							value={item.producer || ''}
							onChange={(e) =>
								setItem({ ...item, producer: e.target.value })
							}
							margin="normal"
						/>
					)}

					<TextField
						fullWidth
						label="Price"
						value={item.price}
						onChange={(e) =>
							setItem({ ...item, price: e.target.value })
						}
						margin="normal"
						type="number"
					/>

					<FormControlLabel
						control={
							<Switch
								checked={item.active}
								onChange={(e) =>
									setItem({
										...item,
										active: e.target.checked,
									})
								}
							/>
						}
						label="Active"
					/>

					<Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
						<Button
							variant="contained"
							type="submit"
							disabled={loading}>
							{loading ? 'Saving...' : 'Save'}
						</Button>

						<Button
							variant="outlined"
							onClick={() => navigate(`/menu/${menuId}/items`)}>
							Cancel
						</Button>
					</Box>
				</form>
			</Paper>
		</Container>
	);
};
