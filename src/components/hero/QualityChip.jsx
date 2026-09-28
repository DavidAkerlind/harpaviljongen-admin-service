import { Box, Tooltip, Typography } from '@mui/material';
import { QUALITY, qualityText } from '../../utils/hero';

// "8/10 Bra" in green, yellow or red, with what it means on hover (and in the focus dialog)
export function QualityChip({ image, size = 'small', tooltip = true }) {
	const quality = QUALITY[image.quality.rating] ?? QUALITY.ok;
	const { verdict, size: pixels } = qualityText(image);
	const chip = (
		<Box
			component="span"
			aria-label={`Kvalitet ${image.quality.score} av 10, ${quality.label}. ${verdict}`}
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 0.75,
				px: size === 'small' ? 1 : 1.25,
				py: size === 'small' ? 0.25 : 0.5,
				borderRadius: 999,
				bgcolor: quality.bg,
				color: quality.color,
				fontWeight: 700,
				fontSize: size === 'small' ? '0.75rem' : '0.85rem',
				lineHeight: 1.4,
				whiteSpace: 'nowrap',
				boxShadow: '0 1px 3px rgba(0,0,0,.18)',
			}}>
			<Box
				component="span"
				sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: quality.color }}
			/>
			{image.quality.score}/10 {quality.label}
		</Box>
	);
	if (!tooltip) return chip;
	return (
		<Tooltip
			title={
				<>
					<Typography variant="body2" sx={{ fontWeight: 600 }}>
						{verdict}
					</Typography>
					<Typography variant="caption">{pixels}</Typography>
				</>
			}>
			{chip}
		</Tooltip>
	);
}
