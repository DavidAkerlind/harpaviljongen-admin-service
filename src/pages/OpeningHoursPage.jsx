import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	Alert,
	Box,
	Button,
	Card,
	Chip,
	Divider,
	Paper,
	Skeleton,
	Switch,
	TextField,
	Typography,
} from '@mui/material';
import { api } from '../api';
import { PageHeader } from '../components/PageHeader';
import { useNotify } from '../components/Notifications';
import { todayName, WEEK_DAYS } from '../utils/format';
import { brand } from '../theme';

const DEFAULT_OPEN = { from: '17:00', to: '00:00' };

// "1700", "17.00", "9:30", "17" -> "17:00", "09:30"; anything else (e.g. "sent") is kept as typed
const normalizeTime = (value) => {
	const text = value.trim();
	const match = text.match(/^(\d{1,2})(?:[.:,]?(\d{2}))?$/);
	if (!match) return text;
	const hours = Number(match[1]);
	const minutes = match[2] ?? '00';
	if (hours > 24 || Number(minutes) > 59) return text;
	return `${String(hours).padStart(2, '0')}:${minutes}`;
};

const toRows = (hours) =>
	Object.fromEntries(
		WEEK_DAYS.map((day) => {
			const saved = hours.find((h) => h.day === day)?.hours ?? {
				from: '',
				to: '',
			};
			const open = Boolean(saved.from || saved.to);
			return [day, { open, from: saved.from, to: saved.to }];
		})
	);

export function OpeningHoursPage() {
	const notify = useNotify();
	const [saved, setSaved] = useState(null);
	const [rows, setRows] = useState(null);
	const [error, setError] = useState(null);
	const [saving, setSaving] = useState(false);
	const [showErrors, setShowErrors] = useState(false);
	// Remembers the times of a day that is switched to closed, so switching back restores them
	const [lastTimes, setLastTimes] = useState({});
	const today = todayName();

	const load = useCallback(async () => {
		setError(null);
		try {
			const initial = toRows(await api.getOpeningHours());
			setSaved(initial);
			setRows(initial);
		} catch (err) {
			setError(err.message);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const dirty = useMemo(
		() => JSON.stringify(rows) !== JSON.stringify(saved),
		[rows, saved]
	);
	const invalidDays = rows
		? WEEK_DAYS.filter(
				(day) =>
					rows[day].open && (!rows[day].from.trim() || !rows[day].to.trim())
			)
		: [];

	// Warn before leaving the page with unsaved changes
	useEffect(() => {
		if (!dirty) return;
		const warn = (e) => e.preventDefault();
		window.addEventListener('beforeunload', warn);
		return () => window.removeEventListener('beforeunload', warn);
	}, [dirty]);

	const update = (day, patch) =>
		setRows((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));

	const toggle = (day, open) => {
		const row = rows[day];
		if (open) {
			const restore = lastTimes[day] ?? DEFAULT_OPEN;
			update(day, {
				open: true,
				from: row.from || restore.from,
				to: row.to || restore.to,
			});
		} else {
			setLastTimes((prev) => ({
				...prev,
				[day]: { from: row.from, to: row.to },
			}));
			update(day, { open: false, from: '', to: '' });
		}
	};

	const save = async () => {
		if (invalidDays.length) {
			setShowErrors(true);
			notify(
				`Fyll i både från och till för ${invalidDays.join(', ')}`,
				'error'
			);
			return;
		}
		setSaving(true);
		try {
			const days = WEEK_DAYS.map((day) => ({
				day,
				hours: rows[day].open
					? { from: rows[day].from.trim(), to: rows[day].to.trim() }
					: { from: '', to: '' },
			}));
			const next = toRows(await api.saveOpeningHours(days));
			setSaved(next);
			setRows(next);
			setShowErrors(false);
			notify('Öppettiderna är sparade och syns nu på hemsidan');
		} catch (err) {
			notify(err.message, 'error');
		} finally {
			setSaving(false);
		}
	};

	return (
		<>
			<PageHeader
				title="Öppettider"
				description="Tiderna visas i sidfoten på hemsidan. Ändringarna syns direkt när du sparar."
			/>

			{error && (
				<Alert
					severity="error"
					action={
						<Button color="inherit" size="small" onClick={load}>
							Försök igen
						</Button>
					}>
					Kunde inte hämta öppettiderna. {error}
				</Alert>
			)}

			{!error && (
				<Card>
					{WEEK_DAYS.map((day, index) => {
						const row = rows?.[day];
						const missing = showErrors && invalidDays.includes(day);
						return (
							<Box key={day}>
								{index > 0 && <Divider />}
								<Box
									sx={{
										display: 'grid',
										gridTemplateColumns: {
											xs: '1fr auto',
											sm: '150px 130px 1fr',
										},
										alignItems: 'center',
										gap: { xs: 1.5, sm: 2 },
										px: { xs: 2, sm: 3 },
										py: 2,
										bgcolor: day === today ? '#f8faf5' : undefined,
									}}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Typography sx={{ fontWeight: 600 }}>{day}</Typography>
										{day === today && (
											<Chip
												label="Idag"
												size="small"
												sx={{ bgcolor: brand.sageLight, color: brand.green }}
											/>
										)}
									</Box>

									{row ? (
										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: { xs: 'flex-end', sm: 'flex-start' },
											}}>
											<Switch
												checked={row.open}
												onChange={(e) => toggle(day, e.target.checked)}
												slotProps={{ input: { 'aria-label': `${day} öppet` } }}
											/>
											<Typography
												variant="body2"
												sx={{
													fontWeight: 500,
													color: row.open ? 'text.primary' : 'text.secondary',
													minWidth: 52,
												}}>
												{row.open ? 'Öppet' : 'Stängt'}
											</Typography>
										</Box>
									) : (
										<Skeleton width={110} height={38} />
									)}

									<Box
										sx={{
											gridColumn: { xs: '1 / -1', sm: 'auto' },
											display: 'flex',
											alignItems: 'center',
											gap: 1.5,
										}}>
										{row?.open ? (
											<>
												<TextField
													label="Från"
													value={row.from}
													placeholder="17:00"
													onChange={(e) =>
														update(day, { from: e.target.value })
													}
													onBlur={(e) =>
														update(day, { from: normalizeTime(e.target.value) })
													}
													error={missing && !row.from.trim()}
													slotProps={{ htmlInput: { maxLength: 20 } }}
													sx={{ width: { xs: '100%', sm: 130 } }}
												/>
												<Typography color="text.secondary">–</Typography>
												<TextField
													label="Till"
													value={row.to}
													placeholder="00:00"
													onChange={(e) => update(day, { to: e.target.value })}
													onBlur={(e) =>
														update(day, { to: normalizeTime(e.target.value) })
													}
													error={missing && !row.to.trim()}
													slotProps={{ htmlInput: { maxLength: 20 } }}
													sx={{ width: { xs: '100%', sm: 130 } }}
												/>
											</>
										) : row ? (
											<Typography
												color="text.secondary"
												sx={{ display: { xs: 'none', sm: 'block' } }}>
												Visas som “Stängt” på hemsidan
											</Typography>
										) : (
											<Skeleton width="60%" height={38} />
										)}
									</Box>
								</Box>
							</Box>
						);
					})}
				</Card>
			)}

			{/* Save bar – sticks to the bottom (above the mobile tab bar) while there are changes */}
			<Paper
				elevation={0}
				sx={{
					position: 'sticky',
					bottom: { xs: 'calc(72px + env(safe-area-inset-bottom))', md: 24 },
					mt: 3,
					p: 1.5,
					pl: 2.5,
					display: 'flex',
					alignItems: 'center',
					gap: 1,
					bgcolor: brand.green,
					color: '#fff',
					borderRadius: 3,
					boxShadow: '0 8px 24px rgba(6,52,36,.25)',
					transition: 'opacity .2s ease, transform .2s ease',
					opacity: dirty ? 1 : 0,
					transform: dirty ? 'none' : 'translateY(12px)',
					pointerEvents: dirty ? 'auto' : 'none',
				}}
				aria-hidden={!dirty}>
				<Typography sx={{ flex: 1, fontWeight: 500 }}>
					Du har osparade ändringar
				</Typography>
				<Button
					onClick={() => setRows(saved)}
					disabled={saving}
					sx={{ color: brand.sage }}>
					Ångra
				</Button>
				<Button
					variant="contained"
					onClick={save}
					disabled={saving}
					sx={{
						bgcolor: '#fff',
						color: brand.green,
						'&:hover': { bgcolor: brand.sageLight },
					}}>
					{saving ? 'Sparar…' : 'Spara'}
				</Button>
			</Paper>
		</>
	);
}
