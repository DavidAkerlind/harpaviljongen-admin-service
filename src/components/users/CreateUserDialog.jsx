import { useState } from 'react';
import {
	Alert,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	IconButton,
	InputAdornment,
	Radio,
	RadioGroup,
	TextField,
	Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { api, ROLES } from '../../api';
import { brand } from '../../theme';

// Same rules as the API
const USERNAME_PATTERN = /^[\p{L}\p{N}._-]{3,30}$/u;
const MIN_PASSWORD = 8;

const EMPTY = { username: '', password: '', role: 'employee' };

export function CreateUserDialog({ open, onClose, onCreated }) {
	const [form, setForm] = useState(EMPTY);
	const [showPassword, setShowPassword] = useState(false);
	const [touched, setTouched] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);

	const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

	const username = form.username.trim();
	const usernameProblem = !USERNAME_PATTERN.test(username)
		? '3–30 tecken: bokstäver, siffror, punkt, - eller _'
		: null;
	const passwordProblem =
		form.password.length < MIN_PASSWORD
			? `Minst ${MIN_PASSWORD} tecken`
			: form.password.length > 72
				? 'Högst 72 tecken'
				: null;

	const close = () => {
		if (saving) return;
		setForm(EMPTY);
		setShowPassword(false);
		setTouched(false);
		setError(null);
		onClose();
	};

	const submit = async (e) => {
		e.preventDefault();
		setTouched(true);
		if (usernameProblem || passwordProblem) return;
		setSaving(true);
		setError(null);
		try {
			const user = await api.createUser({ ...form, username });
			setForm(EMPTY);
			setShowPassword(false);
			setTouched(false);
			onCreated(user);
		} catch (err) {
			setError(err.message);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog
			open={open}
			onClose={close}
			maxWidth="xs"
			fullWidth
			slotProps={{
				paper: { component: 'form', onSubmit: submit, noValidate: true },
			}}>
			<DialogTitle sx={{ fontWeight: 600 }}>Ny användare</DialogTitle>
			<DialogContent sx={{ display: 'grid', gap: 2.5 }}>
				<TextField
					label="Användarnamn"
					value={form.username}
					onChange={set('username')}
					error={touched && Boolean(usernameProblem)}
					helperText={
						touched && usernameProblem
							? usernameProblem
							: 'T.ex. förnamnet. Stora och små bokstäver spelar ingen roll.'
					}
					autoFocus
					disabled={saving}
					slotProps={{
						htmlInput: {
							maxLength: 30,
							autoCapitalize: 'none',
							autoComplete: 'off',
							spellCheck: false,
						},
					}}
					sx={{ mt: 1 }}
				/>
				<TextField
					label="Lösenord"
					type={showPassword ? 'text' : 'password'}
					value={form.password}
					onChange={set('password')}
					error={touched && Boolean(passwordProblem)}
					helperText={
						touched && passwordProblem
							? passwordProblem
							: `Minst ${MIN_PASSWORD} tecken. Ge det till personen på ett säkert sätt.`
					}
					disabled={saving}
					slotProps={{
						htmlInput: { autoComplete: 'new-password' },
						input: {
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										onClick={() => setShowPassword((v) => !v)}
										aria-label={
											showPassword ? 'Dölj lösenord' : 'Visa lösenord'
										}
										edge="end"
										size="small">
										{showPassword ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							),
						},
					}}
				/>

				<Box>
					<Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
						Behörighet
					</Typography>
					<RadioGroup
						value={form.role}
						onChange={set('role')}
						sx={{ display: 'grid', gap: 1 }}>
						{Object.entries(ROLES).map(([key, role]) => (
							<FormControlLabel
								key={key}
								value={key}
								disabled={saving}
								control={<Radio size="small" />}
								label={
									<Box sx={{ py: 1 }}>
										<Typography sx={{ fontWeight: 600, lineHeight: 1.3 }}>
											{role.label}
										</Typography>
										<Typography variant="body2" color="text.secondary">
											{role.description}
										</Typography>
									</Box>
								}
								sx={{
									m: 0,
									pr: 1.5,
									borderRadius: 2,
									border: `1px solid ${form.role === key ? brand.green : brand.border}`,
									bgcolor: form.role === key ? brand.sageLight : 'transparent',
									transition: 'all .15s ease',
								}}
							/>
						))}
					</RadioGroup>
				</Box>

				{error && <Alert severity="error">{error}</Alert>}
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2.5 }}>
				<Button onClick={close} disabled={saving} color="inherit">
					Avbryt
				</Button>
				<Button type="submit" variant="contained" disabled={saving}>
					Lägg till
				</Button>
			</DialogActions>
		</Dialog>
	);
}
