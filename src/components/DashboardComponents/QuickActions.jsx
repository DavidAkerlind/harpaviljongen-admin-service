import { Box, Button } from '@mui/material';
import {
	MenuBook,
	Event,
	AccessTime,
	LocalBar,
	Liquor,
} from '@mui/icons-material';

export const QuickActions = ({ onNavigate }) => (
	<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', maxWidth: '500px' }}>
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
		<Button
			variant="outlined"
			startIcon={<Liquor />}
			onClick={() => onNavigate('/wine-lists')}>
			Update wine lists
		</Button>
	</Box>
);
