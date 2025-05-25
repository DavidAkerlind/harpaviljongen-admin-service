import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BackButton } from '../../components/BackButton/BackButton';

import {
	Container,
	Paper,
	List,
	ListItem,
	ListItemText,
	IconButton,
	Button,
	Typography,
	Box,
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import { api } from '../../services/apiService';

export const ItemList = () => {
	const { menuId } = useParams();
	const navigate = useNavigate();
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		loadItems();
	}, [menuId]);

	const loadItems = async () => {
		try {
			setLoading(true);
			const response = await api.getMenuItems(menuId);
			setItems(response.data);
		} catch (err) {
			setError(response.message);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (itemId) => {
		if (window.confirm('Are you sure you want to delete this item?')) {
			try {
				await api.deleteMenuItem(menuId, itemId);
				loadItems();
			} catch (err) {
				setError(err.message);
			}
		}
	};

	const handleToggleActive = async (itemId) => {
		try {
			await api.toggleMenuItem(menuId, itemId);
			loadItems();
		} catch (err) {
			setError(err.message);
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
						mb: 3,
					}}>
					<Typography
						component={Link}
						to={`/menu/${menuId}`}
						variant="h5">
						{menuId}
					</Typography>
					<Button
						variant="contained"
						startIcon={<Add />}
						onClick={() => navigate(`/menu/${menuId}/items/new`)}>
						Add Item
					</Button>
				</Box>

				{error && (
					<Typography color="error" sx={{ mb: 2 }}>
						{error}
					</Typography>
				)}

				<List>
					{items.map((item) => (
						<ListItem
							key={item.id}
							sx={{
								opacity: item.active ? 1 : 0.5,
								bgcolor: 'background.paper',
								mb: 1,
								borderRadius: 1,
							}}>
							<ListItemText
								primary={item.title}
								secondary={`${
									item.description || 'No description'
								} - ${item.price || 0} kr`}
							/>
							<IconButton
								onClick={() => handleToggleActive(item.id)}
								color={item.active ? 'success' : 'default'}>
								{item.active ? 'Active' : 'Inactive'}
							</IconButton>
							<IconButton
								onClick={() =>
									navigate(`/menu/${menuId}/items/${item.id}`)
								}>
								<Edit />
							</IconButton>
							<IconButton
								onClick={() => handleDelete(item.id)}
								color="error">
								<Delete />
							</IconButton>
						</ListItem>
					))}
				</List>
			</Paper>
		</Container>
	);
};
