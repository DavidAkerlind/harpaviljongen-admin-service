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
	Switch,
	TextField,
	Typography,
} from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import { api } from '../../api';

const MAX_LABEL = 40;

// Create a menu (menu = null) or change one: its name and whether the website shows a
// button for it. The parent remounts it (key) on every open, so it starts from the saved values.
// onSaved(menu) after saving; onDelete() when "Ta bort menyn" is clicked (not for Meny/Vinlista).
export function MenuDialog({ open, menu, onClose, onSaved, onDelete }) {
	const creating = !menu;
	const [label, setLabel] = useState(menu?.label ?? '');
	const [navbar, setNavbar] = useState(menu?.navbar ?? true);
	const [home, setHome] = useState(menu?.home ?? true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);
	const trimmed = label.trim();
	const unchanged =
		!creating &&
		trimmed === menu.label &&
		navbar === menu.navbar &&
		home === menu.home;

	const close = () => !saving && onClose();

	const submit = async (e) => {
		e.preventDefault();
		if (!trimmed) return setError('Skriv ett namn, t.ex. “Lunchmeny”.');
		setSaving(true);
		setError(null);
		try {
			const saved = creating
				? await api.createMenuList({ label: trimmed, navbar, home })
				: await api.updateMenuList(menu.type, {
						...(trimmed !== menu.label && { label: trimmed }),
						...(navbar !== menu.navbar && { navbar }),
						...(home !== menu.home && { home }),
					});
			onSaved(saved);
		} catch (err) {
			setError(err.message);
			setSaving(false);
		}
	};

	return (
		<Dialog
			open={open}
			onClose={close}
			maxWidth="xs"
			fullWidth
			slotProps={{ paper: { component: 'form', onSubmit: submit } }}>
			<DialogTitle sx={{ fontWeight: 600 }}>
				{creating ? 'Ny meny' : `Inställningar för ${menu.label}`}
			</DialogTitle>
			<DialogContent sx={{ display: 'grid', gap: 2 }}>
				{creating && (
					<Typography color="text.secondary">
						Till exempel en lunchmeny, julmeny eller dryckeslista. Du laddar upp
						PDF:er till den precis som till Meny och Vinlista.
					</Typography>
				)}
				<TextField
					label="Namn"
					value={label}
					onChange={(e) => setLabel(e.target.value)}
					helperText="Står på knappen på hemsidan"
					slotProps={{ htmlInput: { maxLength: MAX_LABEL } }}
					disabled={saving}
					autoFocus
					fullWidth
					sx={{ mt: 1 }}
				/>
				<Box>
					<Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
						Knapp på hemsidan
					</Typography>
					<FormControlLabel
						control={
							<Switch
								checked={navbar}
								onChange={(e) => setNavbar(e.target.checked)}
								disabled={saving}
							/>
						}
						label="I menyn"
						sx={{ display: 'flex' }}
					/>
					<FormControlLabel
						control={
							<Switch
								checked={home}
								onChange={(e) => setHome(e.target.checked)}
								disabled={saving}
							/>
						}
						label="På startsidan"
						sx={{ display: 'flex' }}
					/>
					<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
						{menu?.builtIn
							? 'Utan aktiv PDF öppnar knappen “Ny meny kommer snart”.'
							: 'Knappen syns när en PDF är vald att visas på hemsidan.'}
					</Typography>
				</Box>
				{error && <Alert severity="error">{error}</Alert>}
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2.5 }}>
				{!creating && !menu.builtIn && (
					<Button
						color="error"
						startIcon={<DeleteOutline />}
						onClick={onDelete}
						disabled={saving}
						sx={{ mr: 'auto' }}>
						Ta bort menyn
					</Button>
				)}
				<Button onClick={close} disabled={saving} color="inherit">
					Avbryt
				</Button>
				<Button
					type="submit"
					variant="contained"
					disabled={saving || unchanged}>
					{creating ? 'Skapa meny' : 'Spara'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
