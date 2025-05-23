import { Box, Button } from '@mui/material';
import { MenuBook, Event, AccessTime } from '@mui/icons-material';

export const QuickActions = ({ onNavigate }) => (
	<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
		<Button
			variant="outlined"
			startIcon={<MenuBook />}
			onClick={() => onNavigate('/menus')}>
			Update Menus
		</Button>
		<Button
			variant="outlined"
			startIcon={<Event />}
			onClick={() => onNavigate('/events')}>
			Update Events
		</Button>
		<Button
			variant="outlined"
			startIcon={<AccessTime />}
			onClick={() => onNavigate('/opening-hours')}>
			Update Hours
		</Button>
	</Box>
);
