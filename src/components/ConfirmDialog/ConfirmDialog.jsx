import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Box,
} from '@mui/material';
import { Warning } from '@mui/icons-material';

export const ConfirmDialog = ({
	open,
	title,
	message,
	onConfirm,
	onCancel,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	severity = 'warning', // 'warning' | 'error' | 'info'
}) => {
	const colors = {
		warning: '#ff9800',
		error: '#f44336',
		info: '#2196f3',
	};

	return (
		<Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
			<DialogTitle
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: 1,
					color: colors[severity],
				}}>
				<Warning sx={{ color: colors[severity] }} />
				{title}
			</DialogTitle>
			<DialogContent>
				<Typography>{message}</Typography>
			</DialogContent>
			<DialogActions sx={{ p: 2, pt: 0 }}>
				<Button onClick={onCancel} variant="outlined">
					{cancelText}
				</Button>
				<Button
					onClick={onConfirm}
					variant="contained"
					color={severity}
					autoFocus>
					{confirmText}
				</Button>
			</DialogActions>
		</Dialog>
	);
};
