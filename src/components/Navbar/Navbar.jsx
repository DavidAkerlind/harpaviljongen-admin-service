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
import { Logout, Menu as MenuIcon } from '@mui/icons-material';
import { useState } from 'react';

export const Navbar = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const [anchorEl, setAnchorEl] = useState(null);

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
		<AppBar position="static">
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
						<Button
							color="inherit"
							component={Link}
							to="/menus"
							sx={{ mr: 2 }}>
							Edit Menus
						</Button>

						{isMobile ? (
							<>
								<IconButton
									color="inherit"
									onClick={handleMenuOpen}
									edge="end">
									<MenuIcon />
								</IconButton>
								<Menu
									anchorEl={anchorEl}
									open={Boolean(anchorEl)}
									onClose={handleMenuClose}
									anchorOrigin={{
										vertical: 'top',
										horizontal: 'right',
									}}
									transformOrigin={{
										vertical: 'top',
										horizontal: 'right',
									}}>
									<MenuItem
										onClick={() => handleNavigation('/')}>
										Dashboard
									</MenuItem>
									<MenuItem
										onClick={() =>
											handleNavigation('/menus')
										}>
										Edit Menus
									</MenuItem>
									<MenuItem
										onClick={() =>
											handleNavigation('/events')
										}>
										Events
									</MenuItem>
									<MenuItem
										onClick={() =>
											handleNavigation('/opening-hours')
										}>
										Opening Hours
									</MenuItem>
									<MenuItem
										onClick={() =>
											handleNavigation('/search')
										}>
										Search
									</MenuItem>
									<MenuItem
										onClick={handleLogout}
										sx={{ color: 'error.main' }}>
										Logout
									</MenuItem>
								</Menu>
							</>
						) : (
							<Box sx={{ display: 'flex', gap: 1 }}>
								<Button color="inherit" component={Link} to="/">
									Dashboard
								</Button>
								<Button
									color="inherit"
									component={Link}
									to="/events">
									Events
								</Button>
								<Button
									color="inherit"
									component={Link}
									to="/opening-hours">
									Opening Hours
								</Button>
								<Button
									color="inherit"
									component={Link}
									to="/search">
									Search
								</Button>
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
