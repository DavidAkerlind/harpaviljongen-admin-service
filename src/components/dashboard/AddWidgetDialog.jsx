import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
} from '@mui/material';
import { WIDGETS } from './registry';
import { brand } from '../../theme';

// The widgets that aren't on the dashboard yet. onAdd(id) adds one at the end.
export function AddWidgetDialog({ open, used, onAdd, onClose }) {
	const available = Object.entries(WIDGETS).filter(([id]) => !used.includes(id));

	return (
		<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
			<DialogTitle sx={{ fontWeight: 600 }}>Lägg till widget</DialogTitle>
			<DialogContent sx={{ px: 1.5 }}>
				{available.length === 0 ? (
					<Typography color="text.secondary" sx={{ px: 1.5 }}>
						Alla widgetar finns redan på din översikt.
					</Typography>
				) : (
					<List disablePadding>
						{available.map(([id, widget]) => {
							const Icon = widget.icon;
							return (
								<ListItemButton
									key={id}
									onClick={() => onAdd(id)}
									sx={{ borderRadius: 2, gap: 0.5 }}>
									<ListItemIcon sx={{ color: brand.green, minWidth: 40 }}>
										<Icon />
									</ListItemIcon>
									<ListItemText
										primary={widget.title}
										secondary={widget.description}
										slotProps={{ primary: { fontWeight: 600 } }}
									/>
								</ListItemButton>
							);
						})}
					</List>
				)}
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2.5 }}>
				<Button onClick={onClose} color="inherit">
					Stäng
				</Button>
			</DialogActions>
		</Dialog>
	);
}
