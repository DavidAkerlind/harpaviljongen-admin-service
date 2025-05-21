import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BackButton } from '../../components/BackButton/BackButton';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import {
	Container,
	Paper,
	TextField,
	Button,
	Typography,
	Box,
	MenuItem,
	Grid,
	List,
	ListItem,
	ListItemText,
	IconButton,
	Divider,
	Tooltip,
} from '@mui/material';
import { Add, Delete, Edit, CheckCircle, Cancel } from '@mui/icons-material';
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
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [fieldErrors, setFieldErrors] = useState({});
	const [deleteMenuDialog, setDeleteMenuDialog] = useState(false);
	const [deleteItemDialog, setDeleteItemDialog] = useState(null);

	const menuTypes = [
		'all',
		'wine',
		'lunch',
		'sweets',
		'small',
		'small snack',
		'small bubbels',
		'small cocktails',
		'small beer',
	];

	useEffect(() => {
		if (menuId) {
			loadMenu();
			loadItems();
		}
	}, [menuId]);

	const validateForm = () => {
		const errors = {};
		if (!menu.id) errors.id = 'Menu ID is required';
		if (!menu.title) errors.title = 'Title is required';
		if (!menu.type) errors.type = 'Type is required';
		return errors;
	};

	const loadMenu = async () => {
		try {
			setLoading(true);
			const response = await api.getMenuById(menuId);
			setMenu(response.data);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const loadItems = async () => {
		try {
			const response = await api.getMenuItems(menuId);
			setItems(response.data);
		} catch (err) {
			setError(err.message);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const errors = validateForm();

		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			return;
		}

		try {
			setLoading(true);
			setFieldErrors({});
			if (menuId) {
				await Promise.all([
					api.updateMenu(menuId, 'title', menu.title),
					api.updateMenu(menuId, 'description', menu.description),
					api.updateMenu(menuId, 'type', menu.type),
				]);
				await loadMenu();
				navigate('/menus');
			} else {
				await api.createMenu(menu);
				navigate(`/menu/${menu.id}`);
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteItem = async (itemId) => {
		try {
			await api.deleteMenuItem(menuId, itemId);
			loadItems();
		} catch (err) {
			setError(err.message);
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

	const handleDeleteMenu = async () => {
		try {
			setLoading(true);
			await api.deleteMenu(menuId);
			navigate('/menus'); // Navigate back to menu list after deletion
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container maxWidth="lg" sx={{ mb: 4 }}>
			<BackButton />
			<Grid
				container
				spacing={2}
				sx={{ mt: 3, alignItems: 'center', justifyContent: 'center' }}>
				{/* Menu Details Section - Full width on mobile, side panel on desktop */}
				<Grid item xs={12} md={4} lg={3}>
					<Paper
						sx={{
							p: { xs: 2, sm: 3 },
							position: { md: 'sticky' },
							top: { md: 24 },
						}}>
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
								onChange={(e) => {
									setMenu({ ...menu, id: e.target.value });
									setFieldErrors({ ...fieldErrors, id: '' });
								}}
								margin="normal"
								required
								disabled={!!menuId}
								size="small"
							/>

							<TextField
								fullWidth
								label="Title"
								value={menu.title}
								onChange={(e) => {
									setMenu({ ...menu, title: e.target.value });
									setFieldErrors({
										...fieldErrors,
										title: '',
									});
								}}
								margin="normal"
								required
								size="small"
							/>

							<TextField
								fullWidth
								label="Description"
								value={menu.description}
								onChange={(e) =>
									setMenu({
										...menu,
										description: e.target.value,
									})
								}
								margin="normal"
								multiline
								rows={2}
								size="small"
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
								required
								size="small">
								{menuTypes.map((type) => (
									<MenuItem key={type} value={type}>
										{type}
									</MenuItem>
								))}
							</TextField>

							<Box
								sx={{
									mt: 2,
									display: 'flex',
									gap: 1,
									flexDirection: { xs: 'column', sm: 'row' },
								}}>
								<Button
									fullWidth
									variant="contained"
									type="submit"
									disabled={loading}>
									{loading ? 'Saving...' : 'Save Menu'}
								</Button>

								<Button
									fullWidth
									variant="outlined"
									onClick={() => navigate('/')}>
									Cancel
								</Button>
								{menuId && ( // Only show delete button when editing existing menu
									<Button
										fullWidth
										variant="outlined"
										color="error"
										onClick={() =>
											setDeleteMenuDialog(true)
										}
										disabled={loading}
										sx={{
											borderColor: 'error.main',
											'&:hover': {
												backgroundColor: 'error.dark',
												borderColor: 'error.dark',
												color: 'error.light',
											},
										}}>
										DELETE MENU
									</Button>
								)}
							</Box>
						</form>
					</Paper>
				</Grid>

				{/* Items List Section - Full width on mobile */}
				<Grid item xs={12} md={8} lg={9}>
					<Paper
						sx={{
							p: { xs: 2, sm: 3 },
							background: 'rgba(19, 47, 76, 0.4)',
							backdropFilter: 'blur(10px)',
						}}>
						<Box
							sx={{
								display: 'flex',
								flexDirection: { xs: 'column', sm: 'row' },
								justifyContent: 'space-between',
								alignItems: { xs: 'stretch', sm: 'center' },
								gap: 2,
								mb: 3,
							}}>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									gap: 2,
								}}>
								<Typography variant="h5">Menu Items</Typography>
								<Typography
									variant="subtitle1"
									color="textSecondary">
									({items.length} items)
								</Typography>
							</Box>
							<Box
								sx={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'flex-end',
								}}>
								<Button
									fullWidth={false}
									variant="contained"
									startIcon={<Add />}
									onClick={() =>
										navigate(`/menu/${menuId}/items/new`)
									}
									disabled={!menuId}
									sx={{ minWidth: 120 }}>
									Add Item
								</Button>
								{!menuId && (
									<Typography
										variant="caption"
										color="warning.main"
										sx={{ mt: 1 }}>
										Save menu before adding items
									</Typography>
								)}
							</Box>
						</Box>

						<List sx={{ p: 0 }}>
							{items.map((item) => (
								<Paper
									key={item.id}
									onClick={() =>
										navigate(
											`/menu/${menuId}/items/${item.id}`
										)
									}
									sx={{
										mb: 2,
										opacity: item.active ? 1 : 0.7,
										transition: 'all 0.2s',
										cursor: 'pointer',
										'&:hover': {
											transform: 'translateX(8px)',
											bgcolor:
												'rgba(255, 255, 255, 0.05)',
										},
									}}>
									<ListItem
										sx={{
											flexDirection: {
												xs: 'column',
												sm: 'row',
											},
											alignItems: 'flex-start',
											gap: 2,
											p: { xs: 2, sm: 3 },
										}}>
										<ListItemText
											primary={
												<Typography
													variant="subtitle1"
													sx={{ fontWeight: 500 }}>
													{item.title}
												</Typography>
											}
											secondary={
												<Box sx={{ mt: 1 }}>
													<Typography
														variant="body2"
														color="textSecondary">
														{item.description ||
															'No description'}
													</Typography>
													<Typography
														variant="body2"
														color="primary"
														sx={{ mt: 0.5 }}>
														{item.price
															? `${item.price} kr`
															: 'No price set'}
													</Typography>
												</Box>
											}
											sx={{ flex: 1 }}
										/>

										<Box
											onClick={(e) => e.stopPropagation()} // Prevent card click when clicking buttons
											sx={{
												display: 'flex',
												gap: 1,
												width: {
													xs: '100%',
													sm: 'auto',
												},
												justifyContent: {
													xs: 'space-between',
													sm: 'flex-end',
												},
											}}>
											<Tooltip
												title={
													item.active
														? 'Deactivate'
														: 'Activate'
												}>
												<IconButton
													onClick={(e) => {
														e.stopPropagation();
														handleToggleActive(
															item.id
														);
													}}
													sx={{
														border: '1px solid',
														borderRadius: '8px',
													}}
													color={
														item.active
															? 'success'
															: 'default'
													}>
													{item.active ? (
														<>
															<CheckCircle />
															Active
														</>
													) : (
														<>
															<Cancel />
															Inactive
														</>
													)}
												</IconButton>
											</Tooltip>
											<Tooltip title="Delete">
												<IconButton
													sx={{
														border: '1px solid',
														borderRadius: '8px',
													}}
													onClick={(e) => {
														e.stopPropagation();
														setDeleteItemDialog(
															item.id
														);
													}}
													color="error">
													<Delete />
													Delete
												</IconButton>
											</Tooltip>
										</Box>
									</ListItem>
								</Paper>
							))}
						</List>
					</Paper>
				</Grid>
			</Grid>
			{/* Delete Menu Dialog */}
			<ConfirmDialog
				open={deleteMenuDialog}
				title="Delete Menu"
				message="Are you sure you want to delete this menu? All items will also be deleted."
				confirmText="Delete Menu"
				onConfirm={() => {
					setDeleteMenuDialog(false);
					handleDeleteMenu();
				}}
				onCancel={() => setDeleteMenuDialog(false)}
				severity="error"
			/>

			{/* Delete Item Dialog */}
			<ConfirmDialog
				open={!!deleteItemDialog}
				title="Delete Item"
				message="Are you sure you want to delete this item?"
				confirmText="Delete Item"
				onConfirm={() => {
					handleDeleteItem(deleteItemDialog);
					setDeleteItemDialog(null);
				}}
				onCancel={() => setDeleteItemDialog(null)}
				severity="error"
			/>
		</Container>
	);
};
