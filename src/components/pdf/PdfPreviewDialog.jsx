import {
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogTitle,
	IconButton,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material';
import { Close, OpenInNew, Public } from '@mui/icons-material';
import { formatDateTime } from '../../utils/format';

export function PdfPreviewDialog({ pdf, onClose, onActivate, busy }) {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

	return (
		<Dialog
			open={Boolean(pdf)}
			onClose={onClose}
			fullScreen={fullScreen}
			maxWidth="lg"
			fullWidth
			slotProps={{ paper: { sx: { height: fullScreen ? '100%' : '90vh' } } }}>
			{pdf && (
				<>
					<DialogTitle
						sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 1.5 }}>
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Typography variant="h3" noWrap>
								{pdf.title || pdf.originalName}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Uppladdad {formatDateTime(pdf.uploadedAt)}
							</Typography>
						</Box>
						{pdf.isActive && (
							<Chip label="Visas på hemsidan" color="success" size="small" />
						)}
						<IconButton onClick={onClose} aria-label="Stäng">
							<Close />
						</IconButton>
					</DialogTitle>
					<Box sx={{ flex: 1, bgcolor: '#525659', minHeight: 0 }}>
						<Box
							component="iframe"
							src={pdf.url}
							title={`Förhandsvisning av ${pdf.title}`}
							sx={{
								width: '100%',
								height: '100%',
								border: 0,
								display: 'block',
							}}
						/>
					</Box>
					<DialogActions sx={{ px: 3, py: 2, flexWrap: 'wrap', gap: 1 }}>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mr: 'auto' }}>
							Syns inte PDF:en? Öppna den i en ny flik.
						</Typography>
						<Button
							href={pdf.url}
							target="_blank"
							rel="noopener noreferrer"
							startIcon={<OpenInNew />}
							color="inherit">
							Öppna i ny flik
						</Button>
						{!pdf.isActive && onActivate && (
							<Button
								variant="contained"
								startIcon={<Public />}
								disabled={busy}
								onClick={() => onActivate(pdf)}>
								Visa på hemsidan
							</Button>
						)}
					</DialogActions>
				</>
			)}
		</Dialog>
	);
}
