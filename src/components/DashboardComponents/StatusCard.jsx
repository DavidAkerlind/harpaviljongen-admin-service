import { Paper, Box, Typography } from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';

export const StatusCard = ({ title, status, latency }) => (
	<Paper
		elevation={0}
		sx={{
			p: 1,
			height: '100%',
			transition: 'all 0.3s ease',
			background:
				status === 'healthy'
					? 'rgba(76, 175, 80, 0.15)'
					: 'rgba(244, 67, 54, 0.15)',
			borderLeft: '4px solid',
			borderColor: status === 'healthy' ? 'success.main' : 'error.main',
			'&:hover': {
				transform: 'translateY(-4px)',
				background:
					status === 'healthy'
						? 'rgba(76, 175, 80, 0.25)'
						: 'rgba(244, 67, 54, 0.25)',
			},
		}}>
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
			}}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
				{status === 'healthy' ? (
					<CheckCircle color="success" />
				) : (
					<Error color="error" />
				)}
				<Box>
					<Typography variant="h6" sx={{ fontWeight: 500 }}>
						{title}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Status:{' '}
						{status.charAt(0).toUpperCase() + status.slice(1)}
					</Typography>
				</Box>
			</Box>
			<Typography
				variant="h6"
				sx={{
					color: status === 'healthy' ? 'success.main' : 'error.main',
					fontWeight: 500,
				}}>
				{latency}ms
			</Typography>
		</Box>
	</Paper>
);
