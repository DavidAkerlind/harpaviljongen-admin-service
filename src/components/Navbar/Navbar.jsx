import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export const Navbar = () => {
	return (
		<AppBar position="static">
			<Toolbar>
				<Typography variant="h6" sx={{ flexGrow: 1 }}>
					Harpaviljongen Admin
				</Typography>
				<Button color="inherit" component={Link} to="/">
					Menus
				</Button>
				<Button color="inherit" component={Link} to="/search">
					Search
				</Button>
			</Toolbar>
		</AppBar>
	);
};
