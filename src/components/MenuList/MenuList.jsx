import { useState, useEffect } from 'react';
import { BackButton } from '../../components/BackButton/BackButton';
import { Link } from 'react-router-dom';
import {
	Container,
	Card,
	CardContent,
	Typography,
	Box,
	Button,
	IconButton,
	Tooltip,
	Fade,
	Grid,
} from '@mui/material';
import { Add, Delete, Edit, MenuBook, TrendingUp } from '@mui/icons-material';
import { api } from '../../services/apiService';
import { getMenuIcon } from '../../utils/menuIcons';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';

export const MenuList = () => {
	const [menus, setMenus] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [deleteDialog, setDeleteDialog] = useState({
		open: false,
		menuId: null,
	});

	useEffect(() => {
		loadMenus();
	}, []);

	const loadMenus = async () => {
		try {
			setLoading(true);
			const response = await api.getAllMenus();
			setMenus(response.data);
			setError(null);
		} catch (error) {
			setError('Error loading menus: ' + error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (e, menuId) => {
		e.preventDefault();
		e.stopPropagation();
		setDeleteDialog({ open: true, menuId });
	};
	// Add this function to handle the actual deletion
	const handleConfirmDelete = async () => {
		try {
			await api.deleteMenu(deleteDialog.menuId);
			loadMenus();
		} catch (error) {
			setError('Error deleting menu: ' + error.message);
		} finally {
			setDeleteDialog({ open: false, menuId: null });
		}
	};

	return (
		<Container maxWidth="lg" sx={{ mb: 4 }}>
			<BackButton />
			<Fade in={true} timeout={800}>
				<Box
					sx={{
						display: 'flex',
						flexDirection: { xs: 'column', sm: 'row' },
						justifyContent: 'space-between',
						alignItems: { xs: 'start', sm: 'center' },
						gap: 2,
						mb: 4,
						mt: 3,
						boxShadow: 'none',
					}}>
					<Typography
						variant="h4"
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 2,
							fontWeight: 600,
							boxShadow: 'none',
						}}>
						<MenuBook
							sx={{ color: 'primary.main', boxShadow: 'none' }}
						/>
						Menu Management
					</Typography>
					<Button
						fullWidth
						variant="contained"
						startIcon={<Add />}
						component={Link}
						to="/menu/new"
						sx={{
							bgcolor: 'primary.main',
							'&:hover': { bgcolor: 'primary.dark' },
							minWidth: { xs: '100%', sm: 'auto' },
						}}>
						Add Menu
					</Button>
				</Box>
			</Fade>

			{error && (
				<Card sx={{ mb: 3, bgcolor: 'error.dark' }}>
					<CardContent>
						<Typography color="white">{error}</Typography>
					</CardContent>
				</Card>
			)}

			<Fade in={true} timeout={1000}>
				<Card
					sx={{
						background: 'rgba(19, 47, 76, 0.4)',
						backdropFilter: 'blur(10px)',
						borderRadius: 2,
						boxShadow: 'none',
					}}>
					<CardContent sx={{ p: { xs: 2, sm: 3 } }}>
						<Typography
							variant="h6"
							sx={{
								boxShadow: 'none',
								mb: 3,
								display: 'flex',
								alignItems: 'center',
								gap: 1,
							}}>
							<TrendingUp sx={{ color: 'primary.main' }} />
							Available Menus
						</Typography>

						{menus.map((menu) => (
							<Card
								key={menu.id}
								component={Link}
								to={`/menu/${menu.id}`}
								sx={{
									mb: 3, // Increased spacing between cards
									cursor: 'pointer',
									textDecoration: 'none',
									border: 'none',
									boxShadow: 'none',
								}}>
								<CardContent
									sx={{
										display: 'flex',
										boxShadow: 'none',
										marginTop: 1,
										flexDirection: {
											xs: 'column',
											sm: 'row',
										},
										alignItems: {
											xs: 'stretch',
											sm: 'center',
										},
										gap: 0,

										transition: 'all 0.2s',
										textDecoration: 'none',
										background: 'rgba(255, 255, 255, 0.05)', // Lighter background
										borderLeft: '4px solid', // Accent border
										borderColor: 'primary.main',
										borderRadius: '8px',
										'&:hover': {
											transform: 'translateX(8px)',
											background:
												'rgba(255, 255, 255, 0.1)',
											boxShadow:
												'0 4px 12px rgba(0, 0, 0, 0.3)',
										},
									}}>
									<Box
										sx={{
											display: 'flex',
											alignItems: 'center',
											gap: 2,
											flex: 1,
										}}>
										<Box
											sx={{
												p: 1.5,
												borderRadius: 1,
												bgcolor:
													'rgba(144, 202, 249, 0.15)',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
											}}>
											{getMenuIcon(menu.type)}
										</Box>
										<Box>
											<Typography
												variant="h6"
												sx={{
													fontWeight: 500,
													color: 'primary.light',
												}}>
												{menu.title}
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ mt: 0.5 }}>
												{menu.description ||
													'No description'}
											</Typography>
										</Box>
									</Box>

									<Box
										sx={{
											display: 'flex',
											flexDirection: {
												xs: 'row',
												sm: 'row',
											},
											alignItems: 'center',
											justifyContent: {
												xs: 'space-between',
												sm: 'flex-end',
											},
											gap: { xs: 1, sm: 3 },
											width: { xs: '100%', sm: 'auto' },
											mt: { xs: 2, sm: 0 },
											pt: { xs: 2, sm: 0 },
										}}>
										<Box
											sx={{
												display: 'flex',
												gap: 4,
												flex: { xs: 1, sm: 'none' },
											}}>
											<Box sx={{ textAlign: 'center' }}>
												<Typography
													variant="body2"
													color="text.secondary">
													Items
												</Typography>
												<Typography
													variant="h6"
													sx={{
														fontWeight: 500,
														color: 'primary.light',
													}}>
													{menu.items.length}
												</Typography>
											</Box>

											<Box sx={{ textAlign: 'center' }}>
												<Typography
													variant="body2"
													color="text.secondary">
													Active
												</Typography>
												<Typography
													variant="h6"
													sx={{
														fontWeight: 500,
														color:
															menu.items.filter(
																(item) =>
																	item.active
															).length > 0
																? 'success.light'
																: 'error.light',
													}}>
													{
														menu.items.filter(
															(item) =>
																item.active
														).length
													}
												</Typography>
											</Box>
										</Box>

										<Box
											sx={{
												display: 'flex',
												gap: 1,
												justifyContent: {
													xs: 'flex-end',
													sm: 'flex-end',
												},
											}}>
											<Tooltip title="Edit Items">
												<IconButton
													component={Link}
													to={`/menu/${menu.id}/items`}
													onClick={(e) =>
														e.stopPropagation()
													}
													sx={{
														color: 'info.light',
														bgcolor:
															'rgba(144, 202, 249, 0.1)',
														'&:hover': {
															bgcolor:
																'rgba(144, 202, 249, 0.2)',
														},
													}}>
													<MenuBook />
												</IconButton>
											</Tooltip>

											<Tooltip title="Delete Menu">
												<IconButton
													onClick={(e) =>
														handleDelete(e, menu.id)
													}
													sx={{
														color: 'error.light',
														bgcolor:
															'rgba(244, 67, 54, 0.1)',
														'&:hover': {
															bgcolor:
																'rgba(244, 67, 54, 0.2)',
														},
													}}>
													<Delete />
												</IconButton>
											</Tooltip>
										</Box>
									</Box>
								</CardContent>
							</Card>
						))}
					</CardContent>
				</Card>
			</Fade>
			<ConfirmDialog
				open={deleteDialog.open}
				title="Delete Menu"
				message="Are you sure you want to delete this menu? All items will also be deleted."
				confirmText="Delete Menu"
				onConfirm={handleConfirmDelete}
				onCancel={() => setDeleteDialog({ open: false, menuId: null })}
				severity="error"
			/>
		</Container>
	);
};
