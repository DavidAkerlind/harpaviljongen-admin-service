import { useEffect, useState } from 'react';
import {
	Alert,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControlLabel,
	Radio,
	RadioGroup,
	Skeleton,
	Typography,
} from '@mui/material';
import { api } from '../../api';
import {
	CLEAR_OPTIONS,
	RETENTION_TEXT,
	clearCutoff,
} from '../../utils/activity';
import { brand } from '../../theme';

// Admins only. Shows how many entries each choice would delete, then deletes them.
// The parent remounts it (key) on every open, so counts are fresh and nothing is chosen.
export function ClearLogDialog({ open, onClose, onCleared }) {
	const [counts, setCounts] = useState(null); // { '30d': 12, … }
	const [choice, setChoice] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!open) return;
		let cancelled = false;
		Promise.all(
			CLEAR_OPTIONS.map(async ({ value }) => {
				const cutoff = clearCutoff(value);
				const { total } = await api.getActivity({
					limit: 1,
					...(cutoff && { to: cutoff.toISOString() }),
				});
				return [value, total];
			})
		)
			.then((entries) => !cancelled && setCounts(Object.fromEntries(entries)))
			.catch((err) => !cancelled && setError(err.message));
		return () => {
			cancelled = true;
		};
	}, [open]);

	const count = counts?.[choice] ?? 0;

	const clear = async () => {
		setBusy(true);
		setError(null);
		try {
			const { deleted } = await api.clearActivity(choice);
			onCleared(deleted);
		} catch (err) {
			setError(err.message);
			setBusy(false);
		}
	};

	return (
		<Dialog
			open={open}
			onClose={busy ? undefined : onClose}
			maxWidth="xs"
			fullWidth>
			<DialogTitle sx={{ fontWeight: 600 }}>Rensa loggen</DialogTitle>
			<DialogContent sx={{ display: 'grid', gap: 2 }}>
				<DialogContentText>
					Ändringar tas bort automatiskt när de är {RETENTION_TEXT} gamla. Här
					kan du ta bort äldre ändringar tidigare.
				</DialogContentText>

				{!counts && !error ? (
					<Box sx={{ display: 'grid', gap: 1 }}>
						{CLEAR_OPTIONS.map((o) => (
							<Skeleton key={o.value} variant="rounded" height={44} />
						))}
					</Box>
				) : (
					counts && (
						<RadioGroup
							value={choice}
							onChange={(e) => setChoice(e.target.value)}
							sx={{ display: 'grid', gap: 1 }}>
							{CLEAR_OPTIONS.map((option) => {
								const n = counts[option.value];
								const selected = choice === option.value;
								return (
									<FormControlLabel
										key={option.value}
										value={option.value}
										disabled={busy || n === 0}
										control={<Radio size="small" />}
										label={
											<Box
												sx={{
													display: 'flex',
													justifyContent: 'space-between',
													gap: 2,
													width: '100%',
												}}>
												<span>{option.label}</span>
												<Typography component="span" color="text.secondary">
													{n === 0 ? 'inga' : n}
												</Typography>
											</Box>
										}
										sx={{
											m: 0,
											pr: 1.5,
											borderRadius: 2,
											border: `1px solid ${selected ? brand.green : brand.border}`,
											bgcolor: selected ? brand.sageLight : 'transparent',
											'& .MuiFormControlLabel-label': { flex: 1 },
										}}
									/>
								);
							})}
						</RadioGroup>
					)
				)}

				{choice && (
					<Alert severity="warning">
						{choice === 'all'
							? 'Hela loggen töms. '
							: `${count} ${count === 1 ? 'ändring' : 'ändringar'} tas bort. `}
						Det går inte att ångra.
					</Alert>
				)}
				{error && <Alert severity="error">{error}</Alert>}
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2.5 }}>
				<Button onClick={onClose} disabled={busy} color="inherit">
					Avbryt
				</Button>
				<Button
					variant="contained"
					color="error"
					onClick={clear}
					disabled={busy || !choice || count === 0}>
					{choice
						? `Ta bort ${count} ${count === 1 ? 'ändring' : 'ändringar'}`
						: 'Ta bort'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
