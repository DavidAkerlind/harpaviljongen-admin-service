import { useState, useEffect } from 'react';
import {
	List,
	ListItem,
	ListItemText,
	IconButton,
	Paper,
	Typography,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { api } from '../../services/apiService';

export const MenuList = () => {
	const [menus, setMenus] = useState([]);

	useEffect(() => {
		loadMenus();
	}, []);

	const loadMenus = async () => {
		try {
			const response = await api.getAllMenus();
			setMenus(response.data.data);
		} catch (error) {
			console.error('Error loading menus:', error);
		}
	};

	const handleDelete = async (menuId) => {
		if (window.confirm('Are you sure you want to delete this menu?')) {
			try {
				await api.deleteMenu(menuId);
				loadMenus();
			} catch (error) {
				console.error('Error deleting menu:', error);
			}
		}
	};

	return (
		<Paper sx={{ p: 2 }}>
			<Typography variant="h5" gutterBottom>
				Menus
			</Typography>
			<List>
				{menus.map((menu) => (
					<ListItem
						key={menu.id}
						secondaryAction={
							<>
								<IconButton
									edge="end"
									onClick={() => handleDelete(menu.id)}>
									<Delete />
								</IconButton>
								<IconButton
									edge="end"
									component={Link}
									to={`/menu/${menu.id}`}>
									<Edit />
								</IconButton>
							</>
						}>
						<ListItemText
							primary={menu.title}
							secondary={`Type: ${menu.type} | Items: ${menu.items.length}`}
						/>
					</ListItem>
				))}
			</List>
		</Paper>
	);
};
