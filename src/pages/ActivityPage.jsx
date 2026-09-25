import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	MenuItem,
	Skeleton,
	TextField,
	Typography,
} from '@mui/material';
import {
	DeleteSweepOutlined,
	FilterAltOff,
} from '@mui/icons-material';
import { api } from '../api';
import { useAuth } from '../auth/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { UserAvatar } from '../components/UserAvatar';
import { ActivityRow } from '../components/activity/ActivityRow';
import { ClearLogDialog } from '../components/activity/ClearLogDialog';
import { useNotify } from '../components/Notifications';
import { ACTIVITY_CATEGORIES, RETENTION_TEXT } from '../utils/activity';
import {
	addDays,
	formatDayHeading,
	formatTime,
	parseDay,
	startOfDay,
	toDayString,
} from '../utils/format';
import { brand } from '../theme';

const PAGE_SIZE = 30;

// Shows the "Alla …" choice instead of an empty field
const showEmpty = {
	select: { displayEmpty: true },
	inputLabel: { shrink: true },
};

const PERIODS = [
	{ value: '', label: 'Alla datum' },
	{ value: 'today', label: 'Idag' },
	{ value: 'yesterday', label: 'Igår' },
	{ value: '7d', label: 'Senaste 7 dagarna' },
	{ value: '30d', label: 'Senaste 30 dagarna' },
	{ value: 'day', label: 'Välj dag…' },
	{ value: 'range', label: 'Välj period…' },
];

// URL params -> { from, to } as Dates in the browser's time zone (to is exclusive)
function periodRange(params) {
	const today = startOfDay();
	switch (params.get('period')) {
		case 'today':
			return { from: today };
		case 'yesterday':
			return { from: addDays(today, -1), to: today };
		case '7d':
			return { from: addDays(today, -6) };
		case '30d':
			return { from: addDays(today, -29) };
		case 'day': {
			const day = parseDay(params.get('day'));
			return day ? { from: day, to: addDays(day, 1) } : {};
		}
		case 'range': {
			let from = parseDay(params.get('from'));
			let to = parseDay(params.get('to'));
			if (from && to && from > to) [from, to] = [to, from];
			return { from, to: to ? addDays(to, 1) : undefined };
		}
		default:
			return {};
	}
}

export function ActivityPage() {
	const { user: me, isAdmin } = useAuth();
	const notify = useNotify();
	const [params, setParams] = useSearchParams();
	// Bumped after clearing the log, to fetch again
	const [reloadKey, setReloadKey] = useState(0);
	// key: the dialog starts fresh (new counts, nothing chosen) every time it opens
	const [clear, setClear] = useState({ open: false, key: 0 });
	const [people, setPeople] = useState([]);
	const [result, setResult] = useState(null); // { items, total, hasMore }
	const [error, setError] = useState(null);
	const [loadingMore, setLoadingMore] = useState(false);
	const latestRequest = useRef(0);

	const period = params.get('period') ?? '';
	const category = params.get('category') ?? '';
	const userId = params.get('user') ?? '';
	const filtered = Boolean(period || category || userId);

	// What the API gets, rebuilt when the URL changes
	const query = useMemo(() => {
		const { from, to } = periodRange(params);
		return {
			from: from?.toISOString(),
			to: to?.toISOString(),
			category: params.get('category') || undefined,
			userId: params.get('user') || undefined,
		};
	}, [params]);

	useEffect(() => {
		api
			.getActivityUsers()
			.then(setPeople)
			.catch(() => setPeople([]));
	}, [reloadKey]);

	useEffect(() => {
		const request = ++latestRequest.current;
		setResult(null);
		setError(null);
		api
			.getActivity({ ...query, limit: PAGE_SIZE })
			.then((data) => request === latestRequest.current && setResult(data))
			.catch(
				(err) => request === latestRequest.current && setError(err.message)
			);
	}, [query, reloadKey]);

	const loadMore = async () => {
		setLoadingMore(true);
		const request = latestRequest.current;
		try {
			const data = await api.getActivity({
				...query,
				limit: PAGE_SIZE,
				before: result.items.at(-1).id,
			});
			if (request === latestRequest.current) {
				setResult({ ...data, items: [...result.items, ...data.items] });
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setLoadingMore(false);
		}
	};

	// Changes one or more URL params; empty values are removed
	const update = (changes) => {
		const next = new URLSearchParams(params);
		for (const [key, value] of Object.entries(changes)) {
			if (value) next.set(key, value);
			else next.delete(key);
		}
		setParams(next, { replace: true });
	};

	const changePeriod = (value) =>
		update({
			period: value,
			day: value === 'day' ? params.get('day') || toDayString(new Date()) : '',
			from: value === 'range' ? params.get('from') : '',
			to: value === 'range' ? params.get('to') : '',
		});

	// Group the list by day (the API sends newest first)
	const days = useMemo(() => {
		const groups = new Map();
		for (const item of result?.items ?? []) {
			const date = new Date(item.createdAt);
			const key = toDayString(date);
			if (!groups.has(key)) groups.set(key, { key, date, items: [] });
			groups.get(key).items.push(item);
		}
		return [...groups.values()];
	}, [result]);

	const todayString = toDayString(new Date());
	const dateProps = {
		type: 'date',
		slotProps: {
			inputLabel: { shrink: true },
			htmlInput: { max: todayString },
		},
	};

	return (
		<>
			<PageHeader
				title="Logg"
				description={`Vem som ändrat vad i admin: menyer, öppettider, sidor, användare och profiler. Ändringar sparas i ${RETENTION_TEXT}.`}
				actions={
					isAdmin && (
						<Button
							variant="outlined"
							startIcon={<DeleteSweepOutlined />}
							onClick={() => setClear((c) => ({ open: true, key: c.key + 1 }))}
							sx={{ bgcolor: brand.paper }}>
							Rensa logg
						</Button>
					)
				}
			/>

			{isAdmin && (
				<ClearLogDialog
					key={clear.key}
					open={clear.open}
					onClose={() => setClear((c) => ({ ...c, open: false }))}
					onCleared={(deleted) => {
						setClear((c) => ({ ...c, open: false }));
						notify(
							deleted === 1
								? '1 ändring borttagen ur loggen'
								: `${deleted} ändringar borttagna ur loggen`
						);
						setReloadKey((key) => key + 1);
					}}
				/>
			)}

			<Card sx={{ mb: 3 }}>
				<CardContent
					sx={{
						p: { xs: 2, sm: 2.5 },
						'&:last-child': { pb: { xs: 2, sm: 2.5 } },
						display: 'grid',
						gap: 2,
						gridTemplateColumns: {
							xs: '1fr',
							sm: 'repeat(2, minmax(0, 1fr))',
							md: 'repeat(3, minmax(0, 1fr))',
						},
					}}>
					<TextField
						select
						label="Datum"
						value={period}
						onChange={(e) => changePeriod(e.target.value)}
						slotProps={showEmpty}>
						{PERIODS.map((p) => (
							<MenuItem key={p.value} value={p.value}>
								{p.label}
							</MenuItem>
						))}
					</TextField>
					<TextField
						select
						label="Kategori"
						value={category}
						onChange={(e) => update({ category: e.target.value })}
						slotProps={showEmpty}>
						<MenuItem value="">Alla kategorier</MenuItem>
						{ACTIVITY_CATEGORIES.map((c) => (
							<MenuItem key={c.value} value={c.value}>
								{c.label}
							</MenuItem>
						))}
					</TextField>
					<TextField
						select
						label="Användare"
						value={people.some((p) => p.userId === userId) ? userId : ''}
						onChange={(e) => update({ user: e.target.value })}
						slotProps={{
							select: {
								renderValue: (value) =>
									value
										? people.find((p) => p.userId === value)?.name
										: 'Alla användare',
								displayEmpty: true,
							},
							inputLabel: { shrink: true },
						}}>
						<MenuItem value="">Alla användare</MenuItem>
						{people.map((person) => (
							<MenuItem key={person.userId} value={person.userId}>
								<UserAvatar
									user={person}
									size={24}
									tone={person.userId === me?.userId ? 'green' : 'light'}
									sx={{ mr: 1.25 }}
								/>
								{person.name}
								{person.userId === me?.userId && ' (du)'}
								{person.deleted && (
									<Typography
										component="span"
										variant="body2"
										color="text.secondary"
										sx={{ ml: 0.75 }}>
										borttagen
									</Typography>
								)}
							</MenuItem>
						))}
					</TextField>

					{period === 'day' && (
						<TextField
							label="Dag"
							value={params.get('day') ?? ''}
							onChange={(e) => update({ day: e.target.value })}
							{...dateProps}
						/>
					)}
					{period === 'range' && (
						<>
							<TextField
								label="Från"
								value={params.get('from') ?? ''}
								onChange={(e) => update({ from: e.target.value })}
								{...dateProps}
							/>
							<TextField
								label="Till och med"
								value={params.get('to') ?? ''}
								onChange={(e) => update({ to: e.target.value })}
								{...dateProps}
							/>
						</>
					)}
				</CardContent>
			</Card>

			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 2,
					mb: 1,
					minHeight: 36,
				}}>
				<Typography color="text.secondary">
					{result
						? `${result.total} ${result.total === 1 ? 'ändring' : 'ändringar'}${
								filtered ? ' matchar filtren' : ''
							}`
						: ' '}
				</Typography>
				{filtered && (
					<Button
						startIcon={<FilterAltOff />}
						onClick={() => setParams({}, { replace: true })}
						sx={{ whiteSpace: 'nowrap' }}>
						Rensa filter
					</Button>
				)}
			</Box>

			{error ? (
				<Alert severity="error">Kunde inte hämta ändringarna. {error}</Alert>
			) : !result ? (
				<Skeleton variant="rounded" height={320} />
			) : result.items.length === 0 ? (
				<Card>
					<CardContent sx={{ p: 3, textAlign: 'center' }}>
						<Typography sx={{ fontWeight: 600 }}>
							{filtered
								? 'Inga ändringar matchar filtren'
								: 'Inga ändringar än'}
						</Typography>
						<Typography color="text.secondary">
							{filtered
								? 'Prova en annan period, kategori eller användare.'
								: 'Här syns allt som ändras i admin.'}
						</Typography>
					</CardContent>
				</Card>
			) : (
				<Box sx={{ display: 'grid', gap: 2 }}>
					{days.map((day) => (
						<Card key={day.key}>
							<CardContent sx={{ p: 2.5, '&:last-child': { pb: 1.5 } }}>
								<Typography
									variant="overline"
									color="text.secondary"
									component="h2">
									{formatDayHeading(day.date)}
								</Typography>
								<Box
									component="ul"
									sx={{ listStyle: 'none', m: 0, mt: 0.5, p: 0 }}>
									{day.items.map((item) => (
										<ActivityRow
											key={item.id}
											item={item}
											isMe={item.userId === me?.userId}
											time={formatTime(item.createdAt)}
										/>
									))}
								</Box>
							</CardContent>
						</Card>
					))}
					{result.hasMore && (
						<Box sx={{ textAlign: 'center' }}>
							<Button
								variant="outlined"
								onClick={loadMore}
								disabled={loadingMore}
								startIcon={
									loadingMore ? <CircularProgress size={16} /> : undefined
								}
								sx={{ bgcolor: brand.paper }}>
								Visa fler
							</Button>
						</Box>
					)}
				</Box>
			)}
		</>
	);
}
