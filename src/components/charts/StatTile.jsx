import { Box, Card, CardContent, Typography } from '@mui/material';
import { SOURCES, formatNumber } from '../../utils/analytics';

const Key = ({ color }) => (
	<Box sx={{ width: 10, height: 2, borderRadius: 1, bgcolor: color, flexShrink: 0 }} />
);

// Our own number big, its change vs the period before, and Cloudflare's number under it
// when Cloudflare is connected. compact: without its own card (inside a dashboard widget).
export function StatTile({ label, value, change, cloudflare, compact = false }) {
	const hasCloudflare = cloudflare !== undefined && cloudflare !== null;
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
			{hasCloudflare && (
				<Box
					sx={{
						display: 'flex',
						flexWrap: 'wrap',
						alignItems: 'center',
						columnGap: 1.5,
						rowGap: 0.25,
						mt: 0.75,
					}}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
						<Key color={SOURCES[0].color} />
						<Typography variant="body2" color="text.secondary">
							{SOURCES[0].label}
						</Typography>
					</Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
						<Key color={SOURCES[1].color} />
						<Typography variant="body2" color="text.secondary">
							{SOURCES[1].label}: {formatNumber(cloudflare)}
						</Typography>
					</Box>
				</Box>
			)}
		</>
	);

	if (compact) return <Box>{content}</Box>;
	return (
		<Card sx={{ height: '100%' }}>
			<CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>{content}</CardContent>
		</Card>
	);
}
