import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export const Navbar = () => {
	return (
		<AppBar position="static">
			<Toolbar>
				<Typography variant="h6" sx={{ flexGrow: 1 }}>
					HAS
				</Typography>
				<Button color="inherit" component={Link} to="/">
					Dashboard
				</Button>
				<Button color="inherit" component={Link} to="/search">
					Search
				</Button>
				<Button color="inherit" component={Link} to="/menus">
					Edit Menus
				</Button>
			</Toolbar>
		</AppBar>
	);
};
