import { useEffect, useRef, useState } from 'react';
import {
	Box,
	Card,
	CardContent,
	Collapse,
	Divider,
	Slider,
	Switch,
	Typography,
	useMediaQuery,
} from '@mui/material';
import { FormatListNumbered, Shuffle } from '@mui/icons-material';
import { HERO_INTERVAL } from '../../utils/hero';
import { Segment } from '../Segment';

const MARKS = [5, 10, 15, 20, 25, 30].map((value) => ({ value, label: `${value}` }));

// inline: the control stays to the right on phones too (a switch)
function Row({ title, hint, control, id, inline = false }) {
	return (
		<Box
			sx={{
				display: 'flex',
				flexWrap: { xs: inline ? 'nowrap' : 'wrap', sm: 'nowrap' },
				alignItems: 'center',
				gap: { xs: 1, sm: 3 },
				py: 2,
			}}>
			<Box sx={{ flex: 1, minWidth: { xs: inline ? 0 : '100%', sm: 0 } }}>
				<Typography id={id} sx={{ fontWeight: 600 }}>
					{title}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{hint}
				</Typography>
			</Box>
			<Box sx={{ flexShrink: 0, width: { xs: inline ? 'auto' : '100%', sm: 'auto' } }}>{control}</Box>
		</Box>
	);
}

// Visning: slideshow on/off, seconds per photo, own order or shuffled. Saved right away.
export function HeroSettingsCard({ settings, onChange }) {
	const wide = useMediaQuery((theme) => theme.breakpoints.up('sm'));
	// The slider moves freely and saves shortly after it's let go, so moving it step by step
	// with the arrow keys saves once
	const [seconds, setSeconds] = useState(settings.intervalSeconds);
	const saveTimer = useRef(null);
	useEffect(() => setSeconds(settings.intervalSeconds), [settings.intervalSeconds]);
	useEffect(() => () => clearTimeout(saveTimer.current), []);
	const commitSeconds = (value) => {
		clearTimeout(saveTimer.current);
		saveTimer.current = setTimeout(() => {
			if (value !== settings.intervalSeconds) onChange({ intervalSeconds: value });
		}, 500);
	};

	return (
		<Card>
			<CardContent sx={{ px: { xs: 2, sm: 3 }, py: 1, '&:last-child': { pb: 1 } }}>
				<Row
					id="hero-slideshow"
					inline
					title="Bildspel"
					hint={
						settings.slideshow
							? 'Bilderna byts automatiskt och tonar mjukt över i varandra.'
							: 'Av. Bara bilden som visas först syns på hemsidan.'
					}
					control={
						<Switch
							checked={settings.slideshow}
							onChange={(e) => onChange({ slideshow: e.target.checked })}
							slotProps={{ input: { 'aria-labelledby': 'hero-slideshow' } }}
						/>
					}
				/>
				<Collapse in={settings.slideshow}>
					<Divider />
					<Row
						id="hero-interval"
						title="Tid per bild"
						hint={`Varje bild visas i ${seconds} sekunder.`}
						control={
							<Box sx={{ width: { xs: '100%', sm: 300 }, px: 1.5 }}>
								<Slider
									value={seconds}
									min={HERO_INTERVAL.min}
									max={HERO_INTERVAL.max}
									step={1}
									marks={MARKS}
									valueLabelDisplay="auto"
									valueLabelFormat={(v) => `${v} s`}
									getAriaValueText={(v) => `${v} sekunder`}
									aria-labelledby="hero-interval"
									onChange={(_e, value) => setSeconds(value)}
									onChangeCommitted={(_e, value) => commitSeconds(value)}
								/>
							</Box>
						}
					/>
					<Divider />
					<Row
						id="hero-order"
						title="Ordning"
						hint={
							settings.shuffle
								? 'Bilden märkt “Visas först” kommer alltid först, resten i slumpad ordning.'
								: 'Bilderna visas i ordningen nedan, med “Visas först” först.'
						}
						control={
							<Segment
								label="Ordning"
								items={[
									{ value: 'order', label: 'I min ordning', icon: <FormatListNumbered /> },
									{ value: 'shuffle', label: 'Slumpad', icon: <Shuffle /> },
								]}
								value={settings.shuffle ? 'shuffle' : 'order'}
								onChange={(value) => onChange({ shuffle: value === 'shuffle' })}
								fullWidth={!wide}
							/>
						}
					/>
				</Collapse>
			</CardContent>
		</Card>
	);
}
