import { Box, Tooltip, Typography } from '@mui/material';
import { formatNumber } from '../../utils/analytics';

// Horizontal bars, one thin bar per series under each row's name, value at the tip.
// rows: [{ key, label, values: { [seriesKey]: number } }], series: [{ key, label, color }]
export function BarList({ rows, series, unit }) {
	const max = Math.max(1, ...rows.flatMap((row) => series.map((s) => row.values[s.key] ?? 0)));

	return (
		<Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1.25 }}>
			{rows.map((row) => (
				<Tooltip
					key={row.key}
					placement="top-start"
					title={
						<Box>
							<Box sx={{ fontWeight: 600, mb: 0.25 }}>{row.label}</Box>
							{series.map((s) => (
								<Box key={s.key}>
									{formatNumber(row.values[s.key])} {unit} · {s.label}
								</Box>
							))}
						</Box>
					}>
					<Box
						component="li"
						tabIndex={0}
						sx={{
							borderRadius: 1.5,
							mx: -0.75,
							px: 0.75,
							py: 0.25,
							outline: 'none',
							'&:hover, &:focus-visible': { bgcolor: 'rgba(6,52,36,0.04)' },
						}}>
						<Typography variant="body2" noWrap sx={{ fontWeight: 500, mb: 0.5 }}>
							{row.label}
						</Typography>
						<Box sx={{ display: 'grid', gap: '2px' }}>
							{series.map((s) => {
								const value = row.values[s.key] ?? 0;
								return (
									<Box key={s.key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
											<Box
												sx={{
													width: `${(value / max) * 100}%`,
													minWidth: value > 0 ? 3 : 0,
													height: 8,
													bgcolor: s.color,
													borderRadius: '0 4px 4px 0',
												}}
											/>
										</Box>
										<Typography
											variant="caption"
											color="text.secondary"
											sx={{
												width: 44,
												textAlign: 'right',
												fontVariantNumeric: 'tabular-nums',
												lineHeight: 1.1,
											}}>
											{formatNumber(value)}
										</Typography>
									</Box>
								);
							})}
						</Box>
					</Box>
				</Tooltip>
			))}
		</Box>
	);
}
