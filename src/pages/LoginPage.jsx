import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	IconButton,
	InputAdornment,
	TextField,
	Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { brand } from '../theme';
import hareLogo from '../assets/hare-logo-white.svg';

export function LoginPage() {
	const { status, login, notice } = useAuth();
	const location = useLocation();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState(null);
	const [busy, setBusy] = useState(false);

	if (status === 'signedIn') {
		return <Navigate to={location.state?.from ?? '/'} replace />;
	}

	const submit = async (e) => {
		e.preventDefault();
		setError(null);
		setBusy(true);
		try {
			await login(username.trim(), password);
		} catch (err) {
			setError(
				err.status === 401 ? 'Fel användarnamn eller lösenord.' : err.message
			);
			setBusy(false);
		}
	};

	return (
		<Box
			sx={{
				minHeight: '100vh',
				display: 'grid',
				placeItems: 'center',
				p: 2,
				bgcolor: brand.green,
				backgroundImage: `radial-gradient(circle at 20% 10%, ${brand.moss}55, transparent 45%)`,
			}}>
			<Box sx={{ width: '100%', maxWidth: 400 }}>
				<Box sx={{ textAlign: 'center', color: '#fff', mb: 3 }}>
					<Box
						component="img"
						src={hareLogo}
						alt=""
						sx={{ width: 64, height: 64 }}
					/>
					<Typography
						sx={{ mt: 1.5, fontWeight: 700, letterSpacing: '0.12em' }}>
						HARPAVILJONGEN
					</Typography>
					<Typography sx={{ color: brand.sage }}>Admin</Typography>
				</Box>
				<Card sx={{ border: 0 }}>
					<CardContent
						component="form"
						onSubmit={submit}
						sx={{ p: 3.5, display: 'grid', gap: 2.5 }}>
						<Typography variant="h2">Logga in</Typography>
						{notice && !error && <Alert severity="info">{notice}</Alert>}
						{error && <Alert severity="error">{error}</Alert>}
						<TextField
							label="Användarnamn"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							autoComplete="username"
							autoFocus
							required
							size="medium"
						/>
						<TextField
							label="Lösenord"
							type={showPassword ? 'text' : 'password'}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							autoComplete="current-password"
							required
							size="medium"
							slotProps={{
								input: {
									endAdornment: (
										<InputAdornment position="end">
											<IconButton
												onClick={() => setShowPassword((v) => !v)}
												edge="end"
												aria-label={
													showPassword ? 'Dölj lösenord' : 'Visa lösenord'
												}>
												{showPassword ? <VisibilityOff /> : <Visibility />}
											</IconButton>
										</InputAdornment>
									),
								},
							}}
						/>
						<Button
							type="submit"
							variant="contained"
							size="large"
							disabled={busy || !username || !password}>
							{busy ? 'Loggar in…' : 'Logga in'}
						</Button>
					</CardContent>
				</Card>
			</Box>
		</Box>
	);
}
