import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
	Container,
	Paper,
	TextField,
	Button,
	Typography,
	Box,
	Alert,
} from '@mui/material';
import { Lock } from '@mui/icons-material';

export const LoginPage = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			const result = await login(username, password);
			if (result.success) {
				navigate('/');
			} else {
				setError(result.message);
			}
		} catch (err) {
			setError('Failed to login. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container maxWidth="sm" sx={{ mt: 8 }}>
			<Paper sx={{ p: 4, textAlign: 'center' }}>
				<Box sx={{ mb: 3 }}>
					<Lock sx={{ fontSize: 40, color: 'primary.main' }} />
					<Typography variant="h5" sx={{ mt: 2 }}>
						Admin Login
					</Typography>
				</Box>

				{error && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{error}
					</Alert>
				)}

				<form onSubmit={handleSubmit}>
					<TextField
						fullWidth
						label="Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						margin="normal"
						required
					/>
					<TextField
						fullWidth
						label="Password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						margin="normal"
						required
					/>
					<Button
						fullWidth
						type="submit"
						variant="contained"
						disabled={loading}
						sx={{ mt: 3 }}>
						{loading ? 'Logging in...' : 'Login'}
					</Button>
				</form>
			</Paper>
		</Container>
	);
};
