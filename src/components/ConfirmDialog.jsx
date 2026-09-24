import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material';

export function ConfirmDialog({
	open,
	title,
	children,
	confirmText = 'Bekräfta',
	danger = false,
	busy = false,
	onConfirm,
	onClose,
}) {
	return (
		<Dialog
			open={open}
			onClose={busy ? undefined : onClose}
			maxWidth="xs"
			fullWidth>
			<DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>
			<DialogContent>
				<DialogContentText component="div">{children}</DialogContentText>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2.5 }}>
				<Button onClick={onClose} disabled={busy} color="inherit">
					Avbryt
				</Button>
				<Button
					onClick={onConfirm}
					disabled={busy}
					variant="contained"
					color={danger ? 'error' : 'primary'}>
					{confirmText}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
