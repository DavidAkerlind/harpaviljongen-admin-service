import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Assessment, Refresh } from '@mui/icons-material';

export const DashboardHeader = ({ onRefresh }) => (
	<Box
		sx={{
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			mb: 4,
			mt: 3,
		}}>
		<Typography
			variant="h4"
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: 2,
				fontWeight: 600,
			}}>
			<Assessment sx={{ color: 'primary.main' }} />
			Dashboard Overview
		</Typography>
		<Tooltip title="Refresh Data">
			<IconButton
				onClick={onRefresh}
				sx={{
					bgcolor: 'background.paper',
					'&:hover': { bgcolor: 'background.default' },
				}}>
				<Refresh />
			</IconButton>
		</Tooltip>
	</Box>
);
