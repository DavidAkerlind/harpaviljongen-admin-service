import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	IconButton,
	Menu,
	MenuItem,
	Box,
	useTheme,
	useMediaQuery,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
	Logout,
	Menu as MenuIcon,
	RestaurantMenu,
	Event,
	AccessTime,
	Dashboard,
	Search,
	Liquor,
} from '@mui/icons-material';
import { useState } from 'react';

export const Navbar = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const [anchorEl, setAnchorEl] = useState(null);

	const menuItems = [
		{ path: '/', icon: <Dashboard />, label: 'Dashboard' },
		{ path: '/menus', icon: <RestaurantMenu />, label: 'Menus' },
		{ path: '/events', icon: <Event />, label: 'Events' },
		{ path: '/opening-hours', icon: <AccessTime />, label: 'Hours' },
		{ path: '/wine-lists', icon: <Liquor />, label: 'Winelists' },
		{ path: '/search', icon: <Search />, label: 'Search' },
	];

	const handleLogout = async () => {
		await logout();
		navigate('/login');
		handleMenuClose();
	};

	const handleMenuOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleNavigation = (path) => {
		navigate(path);
		handleMenuClose();
	};

	return (
		<AppBar
			sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
			position="static">
			<Toolbar>
				<Typography
					color="inherit"
					component={Link}
					to={'/'}
					variant="h6"
					sx={{ flexGrow: 1, textDecoration: 'none' }}>
					HAS
				</Typography>
				{user && (
					<>
						{isMobile ? (
							<>
								<IconButton
									color="inherit"
									onClick={handleMenuOpen}
									edge="end"
									sx={{
										padding: 1,
										'& .MuiSvgIcon-root': {
											fontSize: '3rem', // Makes the hamburger icon larger
										},
									}}>
									<MenuIcon />
								</IconButton>
								<Menu
									anchorEl={anchorEl}
									open={Boolean(anchorEl)}
									onClose={handleMenuClose}
									anchorOrigin={{
										vertical: 'bottom',
										horizontal: 'right',
									}}
									transformOrigin={{
										vertical: 'top',
										horizontal: 'right',
									}}
									PaperProps={{
										sx: {
											width: '180px',
											mt: 0.2, // Makes menu wider
											'& .MuiMenuItem-root': {
												py: 3, // More vertical padding
												px: 2, // More horizontal padding
												'& .MuiSvgIcon-root': {
													fontSize: '1.5rem', // Makes menu icons larger
												},
												typography: 'body1', // Larger text
											},
										},
									}}>
									{menuItems.map((item) => (
										<MenuItem
											key={item.path}
											onClick={() =>
												handleNavigation(item.path)
											}
											sx={{
												display: 'flex',
												gap: 1,
												alignItems: 'center',
												borderBottom: '1px solid black',
											}}>
											{item.icon}
											{item.label}
										</MenuItem>
									))}
									<MenuItem
										onClick={handleLogout}
										sx={{
											color: 'error.main',
											display: 'flex',
											gap: 1,
											alignItems: 'center',
										}}>
										<Logout />
										Logout
									</MenuItem>
								</Menu>
							</>
						) : (
							<Box sx={{ display: 'flex', gap: 0 }}>
								{menuItems.map((item) => (
									<Button
										key={item.path}
										color="inherit"
										component={Link}
										to={item.path}
										startIcon={item.icon}
										sx={{
											display: 'flex',
											alignItems: 'center',
											gap: 0.5,
										}}>
										{item.label}
									</Button>
								))}
								<Button
									color="error"
									onClick={handleLogout}
									startIcon={<Logout />}
									sx={{ ml: 1 }}>
									Logout
								</Button>
							</Box>
						)}
					</>
				)}
			</Toolbar>
		</AppBar>
	);
};
