import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { Storage } from '@mui/icons-material';
import { StatusCard } from './StatusCard';
import { QuickActions } from './QuickActions';

export const SystemStatus = ({ systemStatus }) => (
	<Card
		sx={{
			background: 'rgba(19, 47, 76, 0.4)',
			backdropFilter: 'blur(10px)',
			borderRadius: 2,
		}}>
		<CardContent sx={{ p: 3 }}>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: 2,
				}}>
				<Typography
					variant="h6"
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 1,
					}}>
					<Storage sx={{ color: 'primary.main' }} />
					System Status
				</Typography>
			</Box>
			<Grid container spacing={2}>
				{Object.entries(systemStatus).map(([key, value]) => (
					<Grid item xs={12} md={6} key={key}>
						<StatusCard
							title={`${key.toUpperCase()} Status`}
							status={value.status}
							latency={value.latency}
						/>
					</Grid>
				))}
			</Grid>
		</CardContent>
	</Card>
);
