import { Paper, Box, Typography } from '@mui/material';

export const StatCard = ({ title, value, icon, color, progress, subtitle }) => (
	<Paper
		elevation={0}
		sx={{
			p: 3,
			height: '100%',
			background: 'rgba(255, 255, 255, 0.05)',
			borderLeft: '4px solid',
			borderColor: color,
			transition: 'all 0.3s ease',
			'&:hover': {
				transform: 'translateY(-4px)',
				background: 'rgba(255, 255, 255, 0.08)',
			},
		}}>
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
			<Box
				sx={{
					p: 1,
					borderRadius: 1,
					bgcolor: `${color}15`,
				}}>
				{icon}
			</Box>
			<Box sx={{ flex: 1 }}>
				<Typography color="text.secondary" variant="body2">
					{title}
				</Typography>
				<Typography variant="h4" sx={{ fontWeight: 600, color }}>
					{value}
				</Typography>
			</Box>
		</Box>

		{subtitle && (
			<Typography variant="body2" color="text.secondary">
				{subtitle}
			</Typography>
		)}

		{progress !== undefined && (
			<Box sx={{ mt: 2 }}>
				<Box
					sx={{
						width: '100%',
						height: 4,
						bgcolor: `${color}22`,
						borderRadius: '8px',
						overflow: 'hidden',
					}}>
					<Box
						sx={{
							width: `${progress}%`,
							height: '100%',
							bgcolor: color,
							borderRadius: '8px',
							transition: 'width 1s ease-in-out',
						}}
					/>
				</Box>
			</Box>
		)}
	</Paper>
);
