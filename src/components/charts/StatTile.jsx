import { Box, Card, CardContent, Typography } from '@mui/material';
import { formatNumber } from '../../utils/analytics';

// A number big and its change vs the period before. compact: without its own card
// (inside a dashboard widget).
export function StatTile({ label, value, change, compact = false }) {
	const content = (
		<>
			<Typography variant="body2" color="text.secondary" noWrap>
				{label}
			</Typography>
			<Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 1.25, mt: 0.5 }}>
				<Typography
					sx={{ fontSize: compact ? '1.6rem' : '2rem', fontWeight: 700, lineHeight: 1.15 }}>
					{formatNumber(value)}
				</Typography>
				{change !== null && change !== undefined && (
					<Typography
						variant="body2"
						title="Jämfört med perioden innan"
						sx={{ fontWeight: 600, color: change >= 0 ? 'success.main' : 'error.main' }}>
						{change >= 0 ? '▲' : '▼'} {Math.abs(change)} %
					</Typography>
				)}
			</Box>
		</>
	);

	if (compact) return <Box>{content}</Box>;
	return (
		<Card sx={{ height: '100%' }}>
			<CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>{content}</CardContent>
		</Card>
	);
}
