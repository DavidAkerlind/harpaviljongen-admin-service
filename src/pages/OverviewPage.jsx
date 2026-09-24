import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
	Alert,
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	IconButton,
	Skeleton,
	Tooltip,
	Typography,
} from '@mui/material';
import { ArrowForward, Check, Refresh, Remove } from '@mui/icons-material';
import { api, PDF_LISTS } from '../api';
import { useAuth } from '../auth/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { PdfThumbnail } from '../components/pdf/PdfThumbnail';
import {
	formatDate,
	formatDateTime,
	formatHours,
	formatRelative,
	todayName,
	WEEK_DAYS,
} from '../utils/format';
import { describeActivity } from '../utils/activity';
import { SITE_PAGES } from '../utils/sitePages';
import { brand } from '../theme';

const statusColor = { up: '#2e9e5b', down: '#d14343', checking: '#b7b7ae' };

async function checkStatus() {
	const [site, health] = await Promise.allSettled([
		api.checkWebsite(),
		api.getHealth(),
	]);
	const apiUp = health.status === 'fulfilled' || health.reason?.status === 503;
	return {
		site:
			site.status === 'fulfilled'
				? { state: 'up', detail: `Online · ${site.value.latency} ms` }
				: { state: 'down', detail: 'Kunde inte nås' },
		api: apiUp
			? {
					state: 'up',
					detail: health.value
						? `Online · ${health.value.latency} ms`
						: 'Online',
				}
			: { state: 'down', detail: 'Svarar inte' },
		database:
			health.status === 'fulfilled' && health.value.database === 'up'
				? { state: 'up', detail: 'Ansluten' }
				: { state: 'down', detail: apiUp ? 'Inte ansluten' : 'Okänt' },
	};
}

export function OverviewPage() {
	const { user } = useAuth();
	const [status, setStatus] = useState(null);
	const [data, setData] = useState(null);
	const [error, setError] = useState(null);
	const [refreshKey, setRefreshKey] = useState(0);

	const load = useCallback(async () => {
		setStatus(null);
		setError(null);
		checkStatus().then(setStatus);
		try {
			const [food, wine, hours, settings] = await Promise.all([
				api.getPdfs(PDF_LISTS.meny.type),
				api.getPdfs(PDF_LISTS.vinlista.type),
				api.getOpeningHours(),
				api.getSiteSettings(),
			]);
			setData({
				menus: {
					meny: food.find((p) => p.isActive) ?? null,
					vinlista: wine.find((p) => p.isActive) ?? null,
				},
				hours,
				pages: settings.pages,
			});
		} catch (err) {
			setError(err.message);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	return (
		<>
			<PageHeader
				title={`Hej${user?.username ? `, ${user.username}` : ''}!`}
				description="Här är läget på hemsidan just nu."
				actions={
					<Tooltip title="Uppdatera">
						<IconButton
							onClick={() => {
								setRefreshKey((key) => key + 1);
								load();
							}}
							aria-label="Uppdatera">
							<Refresh />
						</IconButton>
					</Tooltip>
				}
			/>

			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
					gap: { xs: 1, sm: 2 },
					mb: 3,
				}}>
				<StatusTile label="Hemsidan" status={status?.site} />
				<StatusTile label="API" status={status?.api} />
				<StatusTile label="Databas" status={status?.database} />
			</Box>

			{error && (
				<Alert severity="error" sx={{ mb: 3 }}>
					Kunde inte hämta allt innehåll. {error}
				</Alert>
			)}

			<Box
				sx={{
					display: 'grid',
					gap: 2,
					gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
				}}>
				{Object.entries(PDF_LISTS).map(([key, list]) => (
					<MenuCard
						key={key}
						listKey={key}
						list={list}
						pdf={data?.menus[key]}
						loading={!data && !error}
					/>
				))}
				<HoursCard hours={data?.hours} loading={!data && !error} />
				<PagesCard pages={data?.pages} loading={!data && !error} />
				<ActivityCard key={refreshKey} me={user?.username} />
			</Box>
		</>
	);
}

function StatusTile({ label, status }) {
	const state = status?.state ?? 'checking';
	return (
		<Card>
			<CardContent
				sx={{
					p: { xs: 1.5, sm: 2 },
					'&:last-child': { pb: { xs: 1.5, sm: 2 } },
					display: 'flex',
					flexDirection: { xs: 'row', sm: 'column' },
					alignItems: { xs: 'center', sm: 'stretch' },
					justifyContent: 'space-between',
					gap: 1,
				}}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Box
						sx={{
							width: 10,
							height: 10,
							borderRadius: '50%',
							flexShrink: 0,
							bgcolor: statusColor[state],
							boxShadow:
								state === 'up' ? `0 0 0 4px ${statusColor.up}22` : undefined,
						}}
					/>
					<Typography sx={{ fontWeight: 600 }} noWrap>
						{label}
					</Typography>
				</Box>
				<Typography variant="body2" color="text.secondary" noWrap>
					{status?.detail ?? 'Kollar…'}
				</Typography>
			</CardContent>
		</Card>
	);
}

function CardShell({ title, to, action, children }) {
	return (
		<Card sx={{ display: 'flex', flexDirection: 'column' }}>
			<CardContent sx={{ p: 2.5, flex: 1 }}>
				<Typography variant="overline" color="text.secondary">
					{title}
				</Typography>
				<Box sx={{ mt: 1 }}>{children}</Box>
			</CardContent>
			<Box sx={{ px: 2.5, pb: 2 }}>
				<Button
					component={RouterLink}
					to={to}
					endIcon={<ArrowForward />}
					sx={{ px: 0 }}>
					{action}
				</Button>
			</Box>
		</Card>
	);
}

function MenuCard({ listKey, list, pdf, loading }) {
	return (
		<CardShell
			title={list.label}
			to={`/menyer/${listKey}`}
			action={`Hantera ${list.label.toLowerCase()}`}>
			{loading ? (
				<Skeleton variant="rounded" height={110} />
			) : pdf ? (
				<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
					<PdfThumbnail
						url={pdf.url}
						title={pdf.title}
						compact
						sx={{ width: 72, flexShrink: 0 }}
					/>
					<Box sx={{ minWidth: 0 }}>
						<Chip
							label="Visas på hemsidan"
							color="success"
							size="small"
							sx={{ mb: 0.75 }}
						/>
						<Typography sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
							{pdf.title || pdf.originalName}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Uppladdad {formatDate(pdf.uploadedAt)}
						</Typography>
					</Box>
				</Box>
			) : (
				<Alert severity="warning" variant="outlined">
					Ingen {list.label.toLowerCase()} är aktiv. Hemsidan visar “Ny meny
					kommer snart”.
				</Alert>
			)}
		</CardShell>
	);
}

function HoursCard({ hours, loading }) {
	const today = todayName();
	return (
		<CardShell title="Öppettider" to="/oppettider" action="Ändra öppettider">
			{loading ? (
				<Skeleton variant="rounded" height={190} />
			) : (
				<Box
					component="dl"
					sx={{
						m: 0,
						display: 'grid',
						gridTemplateColumns: 'auto 1fr',
						rowGap: 0.75,
						columnGap: 3,
					}}>
					{WEEK_DAYS.map((day) => {
						const isToday = day === today;
						const value = formatHours(hours?.find((h) => h.day === day)?.hours);
						return (
							<Box key={day} sx={{ display: 'contents' }}>
								<Typography
									component="dt"
									sx={{ fontWeight: isToday ? 700 : 400 }}>
									{day}
									{isToday && (
										<Box
											component="span"
											sx={{
												ml: 1,
												fontSize: '0.75rem',
												color: brand.moss,
												fontWeight: 600,
											}}>
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
										color:
											value === 'Stängt' ? 'text.secondary' : 'text.primary',
									}}>
									{value}
								</Typography>
							</Box>
						);
					})}
				</Box>
			)}
		</CardShell>
	);
}

function PagesCard({ pages, loading }) {
	return (
		<CardShell title="Sidor på hemsidan" to="/sidor" action="Ändra sidor">
			{loading ? (
				<Skeleton variant="rounded" height={130} />
			) : (
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: '1fr auto auto',
						alignItems: 'center',
						columnGap: { xs: 1.5, sm: 3 },
						rowGap: 1.25,
					}}>
					<span />
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ textAlign: 'center' }}>
						I menyn
					</Typography>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ textAlign: 'center' }}>
						På startsidan
					</Typography>
					{SITE_PAGES.map((page) => (
						<Box key={page.key} sx={{ display: 'contents' }}>
							<Typography sx={{ fontWeight: 500 }}>{page.label}</Typography>
							<VisibilityMark on={pages?.[page.key]?.navbar} />
							<VisibilityMark on={pages?.[page.key]?.home} />
						</Box>
					))}
				</Box>
			)}
		</CardShell>
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

const FEW = 6;
const MANY = 30;

// Senaste ändringar: who changed what, newest first
function ActivityCard({ me }) {
	const [items, setItems] = useState(null);
	const [limit, setLimit] = useState(FEW);
	const [error, setError] = useState(null);

	useEffect(() => {
		let cancelled = false;
		api
			.getActivity(limit + 1) // one extra tells whether there are more
			.then((list) => !cancelled && setItems(list))
			.catch((err) => !cancelled && setError(err.message));
		return () => {
			cancelled = true;
		};
	}, [limit]);

	const shown = items?.slice(0, limit);
	const hasMore = items?.length > limit;

	return (
		<Card sx={{ gridColumn: '1 / -1' }}>
			<CardContent sx={{ p: 2.5, '&:last-child': { pb: 2 } }}>
				<Typography variant="overline" color="text.secondary">
					Senaste ändringar
				</Typography>
				{error ? (
					<Alert severity="error" sx={{ mt: 1 }}>
						Kunde inte hämta ändringarna. {error}
					</Alert>
				) : !shown ? (
					<Skeleton variant="rounded" height={160} sx={{ mt: 1 }} />
				) : shown.length === 0 ? (
					<Typography color="text.secondary" sx={{ mt: 1 }}>
						Inga ändringar än. Här syns vem som laddar upp menyer, ändrar
						öppettider och sidor.
					</Typography>
				) : (
					<Box component="ul" sx={{ listStyle: 'none', m: 0, mt: 1, p: 0 }}>
						{shown.map((item) => {
							const isMe = item.username === me;
							return (
								<Box
									component="li"
									key={item.id}
									sx={{
										display: 'flex',
										gap: 1.5,
										py: 1.25,
										'& + &': { borderTop: `1px solid ${brand.border}` },
									}}>
									<Avatar
										sx={{
											width: 30,
											height: 30,
											fontSize: '0.8rem',
											fontWeight: 600,
											bgcolor: isMe ? brand.green : brand.sageLight,
											color: isMe ? '#fff' : brand.green,
										}}>
										{item.username[0]?.toUpperCase()}
									</Avatar>
									<Box sx={{ minWidth: 0, flex: 1 }}>
										<Typography sx={{ wordBreak: 'break-word' }}>
											<Box component="span" sx={{ fontWeight: 600 }}>
												{isMe ? 'Du' : item.username}
											</Box>{' '}
											{describeActivity(item)}
										</Typography>
										<Typography
											variant="body2"
											color="text.secondary"
											title={formatDateTime(item.createdAt)}>
											{formatRelative(item.createdAt)}
										</Typography>
									</Box>
								</Box>
							);
						})}
					</Box>
				)}
				{(hasMore || limit > FEW) && (
					<Button
						onClick={() => setLimit(limit > FEW ? FEW : MANY)}
						sx={{ px: 0, mt: 0.5 }}>
						{limit > FEW ? 'Visa färre' : 'Visa fler'}
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
