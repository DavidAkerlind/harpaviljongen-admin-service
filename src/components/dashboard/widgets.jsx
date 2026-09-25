import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, ButtonBase, Skeleton, Typography } from '@mui/material';
import { Check, Remove } from '@mui/icons-material';
import { api } from '../../api';
import { useAuth } from '../../auth/AuthContext';
import { useMenuLists } from '../../menus/MenuListsContext';
import { PdfThumbnail } from '../pdf/PdfThumbnail';
import { ActivityRow } from '../activity/ActivityRow';
import { TrendChart } from '../charts/TrendChart';
import { BarList } from '../charts/BarList';
import { StatTile } from '../charts/StatTile';
import {
	METRICS,
	activeSources,
	breakdownRows,
	changePercent,
	trendSeries,
	useAnalytics,
} from '../../utils/analytics';
import {
	formatDate,
	formatHours,
	formatRelative,
	todayName,
	WEEK_DAYS,
} from '../../utils/format';
import { SITE_PAGES } from '../../utils/sitePages';
import { brand } from '../../theme';

// The content of each dashboard widget. The card around it (title, link, edit
// controls) is <WidgetCard>; which widgets exist is in ./registry.js.
// Every widget gets { size: 'small' | 'medium' | 'large', reloadKey }.

// Loads something once per reloadKey: { data, error }
function useLoad(load, reloadKey) {
	const [state, setState] = useState({ data: null, error: null });
	useEffect(() => {
		let cancelled = false;
		setState({ data: null, error: null });
		load()
			.then((data) => !cancelled && setState({ data, error: null }))
			.catch((err) => !cancelled && setState({ data: null, error: err.message }));
		return () => {
			cancelled = true;
		};
		// load is a stable module-level function per widget
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reloadKey]);
	return state;
}

const Failed = ({ children }) => (
	<Alert severity="error" variant="outlined">
		{children}
	</Alert>
);

// ---- Driftstatus

const statusColor = { up: '#2e9e5b', down: '#d14343', checking: '#b7b7ae' };

async function checkStatus() {
	const [site, health] = await Promise.allSettled([api.checkWebsite(), api.getHealth()]);
	const apiUp = health.status === 'fulfilled' || health.reason?.status === 503;
	return [
		{
			label: 'Hemsidan',
			...(site.status === 'fulfilled'
				? { state: 'up', detail: `Online · ${site.value.latency} ms` }
				: { state: 'down', detail: 'Kunde inte nås' }),
		},
		{
			label: 'API',
			...(apiUp
				? {
						state: 'up',
						detail: health.value ? `Online · ${health.value.latency} ms` : 'Online',
					}
				: { state: 'down', detail: 'Svarar inte' }),
		},
		{
			label: 'Databas',
			...(health.status === 'fulfilled' && health.value.database === 'up'
				? { state: 'up', detail: 'Ansluten' }
				: { state: 'down', detail: apiUp ? 'Inte ansluten' : 'Okänt' }),
		},
	];
}

export function StatusWidget({ reloadKey }) {
	const { data } = useLoad(checkStatus, reloadKey);
	const rows = data ?? ['Hemsidan', 'API', 'Databas'].map((label) => ({ label }));
	return (
		<Box sx={{ display: 'grid', gap: 1.5 }}>
			{rows.map((row) => {
				const state = row.state ?? 'checking';
				return (
					<Box key={row.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
						<Box
							sx={{
								width: 10,
								height: 10,
								borderRadius: '50%',
								flexShrink: 0,
								bgcolor: statusColor[state],
								boxShadow: state === 'up' ? `0 0 0 4px ${statusColor.up}22` : undefined,
							}}
						/>
						<Typography sx={{ fontWeight: 600, flex: 1 }} noWrap>
							{row.label}
						</Typography>
						<Typography variant="body2" color="text.secondary" noWrap>
							{row.detail ?? 'Kollar…'}
						</Typography>
					</Box>
				);
			})}
		</Box>
	);
}

// ---- Besökare (last 7 days)

export function VisitorsWidget({ reloadKey }) {
	const { data, error } = useAnalytics('7d', reloadKey);
	if (error && !data) return <Failed>Kunde inte hämta statistiken.</Failed>;
	if (!data) return <Skeleton variant="rounded" height={170} />;

	const series = trendSeries(data, 'visits');
	return (
		<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
			<StatTile
				compact
				label={`${METRICS.visits.label}, 7 dagar`}
				value={data.totals.own.visits}
				change={changePercent(data.totals.own.visits, data.totals.ownPrevious.visits)}
				cloudflare={data.totals.cloudflare?.visits}
			/>
			<TrendChart
				compact
				dates={data.series.map((d) => d.date)}
				series={series}
				height="fill"
				label="Besök per dag, 7 dagar"
			/>
		</Box>
	);
}

// ---- Populära sidor (last 7 days)

export function TopPagesWidget({ size, reloadKey }) {
	const { data, error } = useAnalytics('7d', reloadKey);
	if (error && !data) return <Failed>Kunde inte hämta statistiken.</Failed>;
	if (!data) return <Skeleton variant="rounded" height={170} />;

	const rows = breakdownRows(data, 'pages', size === 'small' ? 3 : 5);
	return rows.length ? (
		<>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
				Sidvisningar, 7 dagar
			</Typography>
			<BarList rows={rows} series={activeSources(data)} unit="sidvisningar" />
		</>
	) : (
		<Typography color="text.secondary">Inga besök de senaste 7 dagarna än.</Typography>
	);
}

// ---- Senaste ändringar

const getLatestActivity = () => api.getActivity({ limit: 6 }).then((r) => r.items);

export function ActivityWidget({ reloadKey }) {
	const { user } = useAuth();
	const { data, error } = useLoad(getLatestActivity, reloadKey);
	if (error) return <Failed>Kunde inte hämta ändringarna. {error}</Failed>;
	if (!data) return <Skeleton variant="rounded" height={160} />;
	if (!data.length) {
		return (
			<Typography color="text.secondary">
				Inga ändringar än. Här syns vem som laddar upp menyer, ändrar öppettider och
				sidor.
			</Typography>
		);
	}
	return (
		<Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, mt: -1 }}>
			{data.map((item) => (
				<ActivityRow
					key={item.id}
					item={item}
					isMe={item.userId === user?.userId}
					time={formatRelative(item.createdAt)}
				/>
			))}
		</Box>
	);
}

// ---- Menyer: what each menu shows on the website right now

const getAllPdfs = () => api.getPdfs();

export function MenusWidget({ reloadKey }) {
	const { lists } = useMenuLists();
	const { data: pdfs, error } = useLoad(getAllPdfs, reloadKey);
	if (error) return <Failed>Kunde inte hämta menyerna. {error}</Failed>;
	if (!pdfs || !lists) return <Skeleton variant="rounded" height={160} />;

	return (
		<Box sx={{ display: 'grid', gap: 0.5, mx: -1 }}>
			{lists.map((list) => {
				const active = pdfs.find((p) => p.type === list.type && p.isActive);
				return (
					<ButtonBase
						key={list.type}
						component={RouterLink}
						to={`/menyer/${list.type}`}
						sx={{
							display: 'flex',
							justifyContent: 'flex-start',
							gap: 1.5,
							p: 1,
							borderRadius: 2,
							textAlign: 'left',
							'&:hover': { bgcolor: 'rgba(6,52,36,0.04)' },
						}}>
						<Box sx={{ width: 36, flexShrink: 0 }}>
							{active ? (
								<PdfThumbnail
									url={active.url}
									title={active.title}
									compact
									sx={{ borderRadius: 1 }}
								/>
							) : (
								<Box
									sx={{
										aspectRatio: '1 / 1.414',
										borderRadius: 1.5,
										border: `1.5px dashed ${brand.sage}`,
									}}
								/>
							)}
						</Box>
						<Box sx={{ minWidth: 0, flex: 1 }}>
							<Typography variant="body2" color="text.secondary" noWrap>
								{list.label}
							</Typography>
							{active ? (
								<Typography sx={{ fontWeight: 600 }} noWrap>
									{active.title || active.originalName}
								</Typography>
							) : (
								<Typography sx={{ fontWeight: 600, color: 'warning.dark' }} noWrap>
									Ingen aktiv PDF
								</Typography>
							)}
						</Box>
						{active && (
							<Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
								{formatDate(active.uploadedAt)}
							</Typography>
						)}
					</ButtonBase>
				);
			})}
		</Box>
	);
}

// ---- Öppettider

export function HoursWidget({ reloadKey }) {
	const { data: hours, error } = useLoad(api.getOpeningHours, reloadKey);
	const today = todayName();
	if (error) return <Failed>Kunde inte hämta öppettiderna. {error}</Failed>;
	if (!hours) return <Skeleton variant="rounded" height={180} />;
	return (
		<Box
			component="dl"
			sx={{ m: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 0.6, columnGap: 2 }}>
			{WEEK_DAYS.map((day) => {
				const isToday = day === today;
				const value = formatHours(hours.find((h) => h.day === day)?.hours);
				return (
					<Box key={day} sx={{ display: 'contents' }}>
						<Typography component="dt" sx={{ fontWeight: isToday ? 700 : 400 }}>
							{day}
							{isToday && (
								<Box
									component="span"
									sx={{ ml: 1, fontSize: '0.75rem', color: brand.moss, fontWeight: 600 }}>
									idag
								</Box>
							)}
						</Typography>
						<Typography
							component="dd"
							sx={{
								m: 0,
								textAlign: 'right',
								fontWeight: isToday ? 700 : 400,
								color: value === 'Stängt' ? 'text.secondary' : 'text.primary',
								whiteSpace: 'nowrap',
							}}>
							{value}
						</Typography>
					</Box>
				);
			})}
		</Box>
	);
}

// ---- Sidor på hemsidan

export function PagesWidget({ reloadKey }) {
	const { data, error } = useLoad(api.getSiteSettings, reloadKey);
	if (error) return <Failed>Kunde inte hämta sidorna. {error}</Failed>;
	if (!data) return <Skeleton variant="rounded" height={130} />;
	return (
		<Box
			sx={{
				display: 'grid',
				gridTemplateColumns: '1fr auto auto',
				alignItems: 'center',
				columnGap: { xs: 1.5, sm: 2.5 },
				rowGap: 1.25,
			}}>
			<span />
			<Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
				I menyn
			</Typography>
			<Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
				Startsidan
			</Typography>
			{SITE_PAGES.map((page) => (
				<Box key={page.key} sx={{ display: 'contents' }}>
					<Typography sx={{ fontWeight: 500 }} noWrap>
						{page.label}
					</Typography>
					<VisibilityMark on={data.pages?.[page.key]?.navbar} />
					<VisibilityMark on={data.pages?.[page.key]?.home} />
				</Box>
			))}
		</Box>
	);
}

function VisibilityMark({ on }) {
	return (
		<Box
			sx={{ display: 'flex', justifyContent: 'center' }}
			aria-label={on ? 'Visas' : 'Dold'}
			title={on ? 'Visas' : 'Dold'}>
			{on ? (
				<Box
					sx={{
						width: 26,
						height: 26,
						borderRadius: '50%',
						display: 'grid',
						placeItems: 'center',
						bgcolor: brand.sageLight,
						color: brand.green,
					}}>
					<Check sx={{ fontSize: 18 }} />
				</Box>
			) : (
				<Remove sx={{ fontSize: 18, color: 'text.disabled' }} />
			)}
		</Box>
	);
}
