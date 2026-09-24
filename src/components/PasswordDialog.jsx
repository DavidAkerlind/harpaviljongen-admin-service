import { useState } from 'react';
import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material';
import { PasswordField } from './PasswordField';
import { MIN_PASSWORD, passwordProblem } from '../utils/password';

// Used for "Byt lösenord" (askCurrent) and for an admin setting someone else's password.
// onSubmit({ current, password }) should throw on failure; the dialog shows the message.
export function PasswordDialog({
	open,
	title,
	description,
	askCurrent = false,
	submitText = 'Spara',
	onSubmit,
	onClose,
}) {
	const [current, setCurrent] = useState('');
	const [password, setPassword] = useState('');
	const [touched, setTouched] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);

	const problem = passwordProblem(password);
	const missingCurrent = askCurrent && !current;

	const reset = () => {
		setCurrent('');
		setPassword('');
		setTouched(false);
		setError(null);
	};

	const close = () => {
		if (saving) return;
		reset();
		onClose();
	};

	const submit = async (e) => {
		e.preventDefault();
		setTouched(true);
		if (problem || missingCurrent) return;
		setSaving(true);
		setError(null);
		try {
			await onSubmit({ current, password });
			reset();
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
			<DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
			<DialogContent sx={{ display: 'grid', gap: 2.5 }}>
				{description && (
					<DialogContentText component="div">{description}</DialogContentText>
				)}
				{askCurrent && (
					<PasswordField
						label="Nuvarande lösenord"
						autoComplete="current-password"
						value={current}
						onChange={(e) => setCurrent(e.target.value)}
						error={touched && missingCurrent}
						helperText={
							touched && missingCurrent ? 'Fyll i ditt lösenord' : undefined
						}
						disabled={saving}
						autoFocus
						sx={{ mt: 1 }}
					/>
				)}
				<PasswordField
					label="Nytt lösenord"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					error={touched && Boolean(problem)}
					helperText={
						touched && problem ? problem : `Minst ${MIN_PASSWORD} tecken`
					}
					disabled={saving}
					autoFocus={!askCurrent}
					sx={askCurrent ? undefined : { mt: 1 }}
				/>
				{error && <Alert severity="error">{error}</Alert>}
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2.5 }}>
				<Button onClick={close} disabled={saving} color="inherit">
					Avbryt
				</Button>
				<Button type="submit" variant="contained" disabled={saving}>
					{submitText}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
