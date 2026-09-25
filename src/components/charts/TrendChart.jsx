import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useSize } from './useSize';
import {
	formatLongDay,
	formatNumber,
	formatShortDay,
	formatWeekday,
} from '../../utils/analytics';

const GRID = '#ecebe4';
const AXIS_TEXT = '#6b736d';
const CROSSHAIR = '#9aa19b';

// 0, 5, 10, 20, 25, 50, 100… – a round top for the y axis and ~4 steps up to it
function niceScale(max, steps = 4) {
	if (max <= 0) return { top: steps, step: 1 };
	const raw = max / steps;
	const power = 10 ** Math.floor(Math.log10(raw));
	const step =
		[1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= raw) ?? 10 * power;
	return { top: Math.ceil(max / step) * step, step };
}

// Values per day as lines, the first series with a light area under it.
// series: [{ key, label, color, values: (number | null)[] }] with one value per date;
// null = not measured that day (the line starts later), shown as "–".
// compact: no y axis and only the first and last date (for dashboard widgets).
// height: pixels, or 'fill' to take the height of the parent (which must have one).
// Hover or focus + arrow keys shows every series' value for that day.
export function TrendChart({ dates, series, height: heightProp = 240, compact = false, label }) {
	const [ref, box] = useSize();
	const [active, setActive] = useState(null);
	const width = box.width;
	const fill = heightProp === 'fill';
	const height = fill ? box.height : heightProp;

	const n = dates.length;
	const m = compact
		? { top: 8, right: 8, bottom: 22, left: 8 }
		: { top: 12, right: 12, bottom: 28, left: 44 };
	const innerW = Math.max(0, width - m.left - m.right);
	const innerH = Math.max(0, height - m.top - m.bottom);
	const max = Math.max(0, ...series.flatMap((s) => s.values.filter((v) => v !== null)));
	const { top, step } = niceScale(max);
	const x = (i) => m.left + (n <= 1 ? innerW / 2 : (i * innerW) / (n - 1));
	const y = (v) => m.top + innerH - (v / top) * innerH;
	const baseline = m.top + innerH;

	const ticks = [];
	for (let v = 0; v <= top + 1e-9; v += step) ticks.push(v);

	// As many date labels as fit, counted back from the last day
	const labelEvery = compact
		? Math.max(1, n - 1)
		: Math.max(1, Math.ceil(n / Math.max(1, Math.floor(innerW / 84))));
	const dateLabel = (day) => (n <= 7 && !compact ? formatWeekday(day) : formatShortDay(day));

	// Only the measured days: from the first value that isn't null
	const points = (values) =>
		values.map((v, i) => [i, v]).filter(([, v]) => v !== null && v !== undefined);
	const line = (values) =>
		points(values)
			.map(([i, v], k) => `${k ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
			.join('');
	const area = (values) => {
		const measured = points(values);
		if (!measured.length) return '';
		const first = measured[0][0];
		const last = measured.at(-1)[0];
		return `${line(values)}L${x(last).toFixed(1)},${baseline}L${x(first).toFixed(1)},${baseline}Z`;
	};
	// Date labels at the edges are aligned inwards so they aren't cut off
	const anchor = (i) => {
		if (compact) return i === 0 ? 'start' : 'end';
		if (x(i) - 28 < 0) return 'start';
		if (x(i) + 28 > width) return 'end';
		return 'middle';
	};

	const pick = (clientX, rect) => {
		const px = clientX - rect.left - m.left;
		const i = n <= 1 ? 0 : Math.round((px / innerW) * (n - 1));
		setActive(Math.min(n - 1, Math.max(0, i)));
	};

	const onKeyDown = (e) => {
		if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
			e.preventDefault();
			const delta = e.key === 'ArrowLeft' ? -1 : 1;
			setActive((i) => Math.min(n - 1, Math.max(0, (i ?? n - 1) + delta)));
		} else if (e.key === 'Escape') {
			setActive(null);
		}
	};

	// Beside the crosshair, on the side with room, inside the chart (cards clip overflow)
	const tipOnRight = active !== null && x(active) < width / 2;

	return (
		<Box
			ref={ref}
			sx={{
				position: 'relative',
				width: '100%',
				...(fill ? { flex: 1, minHeight: { xs: 140, md: 80 } } : { height }),
			}}>
			{width > 0 && height > 0 && n > 0 && (
				<svg
					width={width}
					height={height}
					role="img"
					aria-label={label}
					tabIndex={0}
					style={{
						display: 'block',
						outline: 'none',
						touchAction: 'pan-y',
						position: fill ? 'absolute' : 'static',
					}}
					onPointerMove={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect())}
					onPointerDown={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect())}
					onPointerLeave={() => setActive(null)}
					onFocus={() => setActive(n - 1)}
					onBlur={() => setActive(null)}
					onKeyDown={onKeyDown}>
					{/* Grid and y axis */}
					{ticks.map((v) => (
						<g key={v}>
							<line
								x1={m.left}
								x2={m.left + innerW}
								y1={y(v)}
								y2={y(v)}
								stroke={GRID}
								strokeWidth={1}
								shapeRendering="crispEdges"
							/>
							{!compact && (
								<text
									x={m.left - 8}
									y={y(v)}
									dy="0.32em"
									textAnchor="end"
									fontSize={12}
									fill={AXIS_TEXT}
									style={{ fontVariantNumeric: 'tabular-nums' }}>
									{formatNumber(v)}
								</text>
							)}
						</g>
					))}
					{/* Dates */}
					{dates.map((day, i) =>
						(n - 1 - i) % labelEvery === 0 || (compact && i === 0) ? (
							<text
								key={day}
								x={x(i)}
								y={height - 6}
								textAnchor={anchor(i)}
								fontSize={12}
								fill={AXIS_TEXT}>
								{dateLabel(day)}
							</text>
						) : null
					)}
					{/* Series: area wash for the first, 2px lines for all */}
					{series[0] && (
						<path d={area(series[0].values)} fill={series[0].color} opacity={0.1} />
					)}
					{series.map((s) => (
						<path
							key={s.key}
							d={line(s.values)}
							fill="none"
							stroke={s.color}
							strokeWidth={2}
							strokeLinejoin="round"
							strokeLinecap="round"
						/>
					))}
					{/* Crosshair on the hovered day, end dots otherwise */}
					{active !== null && (
						<line
							x1={x(active)}
							x2={x(active)}
							y1={m.top}
							y2={baseline}
							stroke={CROSSHAIR}
							strokeWidth={1}
							shapeRendering="crispEdges"
						/>
					)}
					{series.map((s) => {
						const i = active ?? n - 1;
						if (s.values[i] === null || s.values[i] === undefined) return null;
						return (
							<circle
								key={s.key}
								cx={x(i)}
								cy={y(s.values[i])}
								r={4}
								fill={s.color}
								stroke="#fff"
								strokeWidth={2}
							/>
						);
					})}
				</svg>
			)}
			{active !== null && (
				<Box
					role="status"
					aria-live="polite"
					sx={{
						position: 'absolute',
						top: m.top,
						...(tipOnRight
							? { left: x(active) + 12 }
							: { right: width - x(active) + 12 }),
						px: 1.5,
						py: 1,
						minWidth: 150,
						bgcolor: 'background.paper',
						border: '1px solid',
						borderColor: 'divider',
						borderRadius: 2,
						boxShadow: '0 4px 16px rgba(6,52,36,.12)',
						pointerEvents: 'none',
						zIndex: 2,
					}}>
					<Typography variant="caption" color="text.secondary" component="div">
						{formatLongDay(dates[active])}
					</Typography>
					{series.map((s) => (
						<Box
							key={s.key}
							sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
							<Box sx={{ width: 12, height: 2, borderRadius: 1, bgcolor: s.color }} />
							<Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
								{s.values[active] === null ? '–' : formatNumber(s.values[active])}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{s.label}
							</Typography>
						</Box>
					))}
				</Box>
			)}
		</Box>
	);
}

// Legend for two or more series: a short line in the series color + its name
export function Legend({ series, shape = 'line' }) {
	return (
		<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
			{series.map((s) => (
				<Box key={s.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
					<Box
						sx={
							shape === 'line'
								? { width: 14, height: 2, borderRadius: 1, bgcolor: s.color }
								: { width: 10, height: 10, borderRadius: '3px', bgcolor: s.color }
						}
					/>
					<Typography variant="body2" color="text.secondary">
						{s.label}
					</Typography>
				</Box>
			))}
		</Box>
	);
}
