import { useState } from 'react';
import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from '@mui/material';
import { api } from '../../api';

const MAX_TITLE = 100;

// The parent remounts it (key) for each PDF, so the field starts with that PDF's name
export function RenamePdfDialog({ pdf, onClose, onRenamed }) {
	const [title, setTitle] = useState(pdf?.title || pdf?.originalName || '');
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);
	const trimmed = title.trim();

	const close = () => !saving && onClose();

	const submit = async (e) => {
		e.preventDefault();
		if (!trimmed) return setError('Namnet kan inte vara tomt.');
		setSaving(true);
		setError(null);
		try {
			onRenamed(await api.renamePdf(pdf._id, trimmed));
		} catch (err) {
			setError(err.message);
			setSaving(false);
		}
	};

	return (
		<Dialog
			open={Boolean(pdf)}
			onClose={close}
			maxWidth="xs"
			fullWidth
			slotProps={{ paper: { component: 'form', onSubmit: submit } }}>
			<DialogTitle sx={{ fontWeight: 600 }}>Byt namn</DialogTitle>
			<DialogContent sx={{ display: 'grid', gap: 2 }}>
				<TextField
					label="Namn"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					helperText="Visas bara här i admin, t.ex. “Höstmeny 2026”"
					slotProps={{ htmlInput: { maxLength: MAX_TITLE } }}
					disabled={saving}
					autoFocus
					fullWidth
					onFocus={(e) => e.target.select()}
					sx={{ mt: 1 }}
				/>
				{error && <Alert severity="error">{error}</Alert>}
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2.5 }}>
				<Button onClick={close} disabled={saving} color="inherit">
					Avbryt
				</Button>
				<Button type="submit" variant="contained" disabled={saving}>
					Spara
				</Button>
			</DialogActions>
		</Dialog>
	);
}
