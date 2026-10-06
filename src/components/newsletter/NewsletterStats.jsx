import { useState } from 'react';
import {
	Alert,
	Box,
	Card,
	CardContent,
	LinearProgress,
	Skeleton,
	Typography,
} from '@mui/material';
import { useAuth } from '../../auth/AuthContext';
import { Segment } from '../Segment';
import { TrendChart } from '../charts/TrendChart';
import { StatTile } from '../charts/StatTile';
import { changePercent, formatNumber } from '../../utils/analytics';
import { formatDate } from '../../utils/format';
import {
	NEWSLETTER_SERIES,
	newsletterSeries,
	openRate,
	subscriberChange,
	totalSeries,
	useNewsletterStats,
	websiteChange,
} from '../../utils/newsletter';

const cardContent = { p: 2.5, '&:last-child': { pb: 2.5 } };

// The Nyhetsbrev part of Statistik: subscribers and newsletters from Get a Newsletter,
// and signups through the field on the website (counted by the API)
export function NewsletterStats({ range }) {
	const { data, error, loading } = useNewsletterStats(range);

	return (
		<Box
			component="section"
			aria-labelledby="newsletter-stats-title"
			sx={{ mt: 5, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
			<Typography variant="h2" id="newsletter-stats-title">
				Nyhetsbrev
			</Typography>
			<Typography color="text.secondary" sx={{ mt: 0.5, mb: 2.5, maxWidth: 640 }}>
				Prenumeranter hos Get a Newsletter och anmälningar via fältet på hemsidan.
			</Typography>

			{error && !data ? (
				<Alert severity="error">Kunde inte hämta nyhetsbrevets siffror. {error}</Alert>
			) : !data ? (
				<Box sx={{ display: 'grid', gap: 2 }}>
					<Skeleton variant="rounded" height={110} />
					<Skeleton variant="rounded" height={300} />
				</Box>
			) : (
				<Box
					sx={{
						display: 'grid',
						gap: 2,
						opacity: loading ? 0.55 : 1,
						transition: 'opacity .2s ease',
					}}>
					<Tiles data={data} />
					<Box
						sx={{
							display: 'grid',
							gap: 2,
							gridTemplateColumns: {
								xs: '1fr',
								lg:
									data.getanewsletter.status === 'ok'
										? 'minmax(0, 3fr) minmax(0, 2fr)'
										: '1fr',
							},
						}}>
						<SubscribersCard data={data} />
						{data.getanewsletter.status === 'ok' && (
							<NewslettersCard newsletters={data.getanewsletter.newsletters} />
						)}
					</Box>
					<Notes data={data} />
				</Box>
			)}
		</Box>
	);
}

function Tiles({ data }) {
	const gan = data.getanewsletter;
	const days = data.range.days;
	const tiles = [];
	if (gan.status === 'ok' && gan.subscribers !== null) {
		const lists = gan.lists.length > 1 ? gan.lists : [];
		tiles.push(
			<StatTile
				key="subscribers"
				label="Prenumeranter nu"
				value={gan.subscribers}
				note={
					lists.length
						? lists.map((l) => `${l.name} ${formatNumber(l.subscribers)}`).join(' · ')
						: gan.growth && (
								<>
									<Signed value={subscriberChange(gan)} /> på {days} dagar
								</>
							)
				}
			/>
		);
	}
	if (gan.status === 'ok' && gan.growth) {
		tiles.push(
			<StatTile
				key="added"
				label={`Nya prenumeranter, ${days} dagar`}
				value={gan.growth.added}
				change={changePercent(gan.growth.added, gan.growth.previousAdded)}
				note={`${formatNumber(gan.growth.cancelled)} avslutade`}
			/>
		);
	}
	tiles.push(
		<StatTile
			key="website"
			label={`Via hemsidan, ${days} dagar`}
			value={data.website.total}
			change={websiteChange(data)}
			note="Fältet längst ner på startsidan"
		/>
	);

	return (
		<Box
			sx={{
				display: 'grid',
				gap: { xs: 1, sm: 2 },
				gridTemplateColumns: {
					xs: '1fr',
					sm: `repeat(${tiles.length}, minmax(0, 1fr))`,
				},
			}}>
			{tiles}
		</Box>
	);
}

// "+78" in green, "−3" in red, "±0" grey
function Signed({ value }) {
	return (
		<Box
			component="span"
			sx={{
				fontWeight: 600,
				color: value > 0 ? 'success.main' : value < 0 ? 'error.main' : 'text.secondary',
			}}>
			{value > 0 ? '+' : value < 0 ? '−' : '±'}
			{formatNumber(Math.abs(value))}
		</Box>
	);
}

const VIEWS = [
	{ value: 'total', label: 'Totalt' },
	{ value: 'daily', label: 'Per dag' },
];

// Totalt (shown first): how many subscribe, day by day, as one line like a stock chart,
// green when the period went up and red when it went down. Per dag: new, via the website
// and cancelled each day. Only Per dag when the total can't be counted per day.
function SubscribersCard({ data }) {
	const [view, setView] = useState('total');
	const total = totalSeries(data);
	const showTotal = Boolean(total) && view === 'total';
	const daily = newsletterSeries(data);
	const perDay = daily.length > 1;

	let title = 'Anmälningar via hemsidan per dag';
	let dates = data.series.map((d) => d.date);
	let series = daily;
	if (showTotal) {
		const down = subscriberChange(data.getanewsletter) < 0;
		title = 'Prenumeranter totalt';
		dates = total.dates;
		series = [
			{
				key: 'total',
				label: 'prenumeranter',
				color: NEWSLETTER_SERIES[down ? 'cancelled' : 'added'].color,
				values: total.values,
			},
		];
	} else if (perDay) {
		title = 'Nya prenumeranter per dag';
	}

	return (
		<Card>
			<CardContent sx={cardContent}>
				<Box
					sx={{
						display: 'flex',
						flexWrap: 'wrap',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: 1,
						mb: 1.5,
					}}>
					<Typography variant="h3">{title}</Typography>
					{total && (
						<Segment
							label="Visa prenumeranter"
							size="sm"
							items={VIEWS}
							value={view}
							onChange={setView}
						/>
					)}
				</Box>
				{!showTotal && perDay && (
					<Box
						sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 2, rowGap: 0.5, mb: 1.5 }}
						aria-hidden="true">
						{daily.map((s) => (
							<Box key={s.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
								<Box sx={{ width: 14, height: 3, borderRadius: 2, bgcolor: s.color }} />
								<Typography variant="body2" color="text.secondary">
									{s.label}
								</Typography>
							</Box>
						))}
					</Box>
				)}
				<TrendChart
					key={showTotal ? 'total' : 'daily'}
					dates={dates}
					series={series}
					fit={showTotal}
					height={240}
					label={`${title}, ${data.range.days} dagar`}
				/>
			</CardContent>
		</Card>
	);
}

function NewslettersCard({ newsletters }) {
	return (
		<Card>
			<CardContent sx={cardContent}>
				<Typography variant="h3" sx={{ mb: 1 }}>
					Senaste utskick
				</Typography>
				{newsletters === null ? (
					<Typography color="text.secondary">
						Kunde inte läsa utskicken från Get a Newsletter.
					</Typography>
				) : newsletters.length === 0 ? (
					<Typography color="text.secondary">Inga utskick än.</Typography>
				) : (
					<Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
						{newsletters.map((newsletter, i) => (
							<NewsletterRow key={newsletter.id} newsletter={newsletter} first={i === 0} />
						))}
					</Box>
				)}
			</CardContent>
		</Card>
	);
}

function NewsletterRow({ newsletter, first }) {
	const rate = openRate(newsletter);
	const details = [
		formatDate(newsletter.sent),
		newsletter.recipients !== null && `till ${formatNumber(newsletter.recipients)}`,
		newsletter.uniqueClicks !== null && `${formatNumber(newsletter.uniqueClicks)} klickade`,
	].filter(Boolean);

	return (
		<Box
			component="li"
			sx={{
				py: 1.5,
				borderTop: first ? 0 : '1px solid',
				borderColor: 'divider',
			}}>
			<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography sx={{ fontWeight: 600 }} noWrap title={newsletter.subject}>
						{newsletter.subject || 'Utan ämne'}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{details.join(' · ')}
					</Typography>
				</Box>
				{(rate !== null || newsletter.opens !== null) && (
					<Box sx={{ textAlign: 'right', flexShrink: 0 }}>
						<Typography sx={{ fontWeight: 700, lineHeight: 1.3 }}>
							{rate !== null ? `${rate} %` : formatNumber(newsletter.opens)}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							{rate !== null ? 'öppnade' : 'öppningar'}
						</Typography>
					</Box>
				)}
			</Box>
			{rate !== null && (
				<LinearProgress
					variant="determinate"
					value={rate}
					aria-label={`${rate} % öppnade`}
					sx={{
						mt: 1,
						height: 4,
						borderRadius: 2,
						bgcolor: 'secondary.light',
						'& .MuiLinearProgress-bar': { borderRadius: 2 },
					}}
				/>
			)}
		</Box>
	);
}

// '"A"', '"A" och "B"', '"A", "B" och "C"'
const quoted = (names) => {
	const q = names.map((name) => `"${name}"`);
	return q.length > 1 ? `${q.slice(0, -1).join(', ')} och ${q.at(-1)}` : q[0];
};

// Which of Get a Newsletter's lists are counted, e.g. 'Räknar listan "Standard list", inte "Test list". '
function listsText(gan) {
	const skipped = gan.skippedLists ?? [];
	if (!skipped.length) return '';
	const counted = gan.lists.map((list) => list.name);
	return `Räknar ${counted.length > 1 ? 'listorna' : 'listan'} ${quoted(counted)}, inte ${quoted(skipped)}. `;
}

function Notes({ data }) {
	const { isAdmin } = useAuth();
	const gan = data.getanewsletter;
	const note = { bgcolor: 'background.paper' };

	return (
		<Box sx={{ display: 'grid', gap: 1 }}>
			{gan.status === 'off' && isAdmin && (
				<Alert severity="info" variant="outlined" sx={note}>
					Get a Newsletter är inte kopplat, så bara anmälningar via hemsidan syns. Skapa
					en API-nyckel hos Get a Newsletter (Mitt konto → API) och lägg till den som{' '}
					<code>GETANEWSLETTER_API_TOKEN</code> under Environment på Render, se
					docs/GO_LIVE.md i API:t.
				</Alert>
			)}
			{gan.status === 'error' && (
				<Alert severity="warning" variant="outlined" sx={note}>
					Kunde inte hämta från Get a Newsletter: {gan.message}
				</Alert>
			)}
			{gan.status === 'ok' && !gan.growth && (
				<Alert severity="info" variant="outlined" sx={note}>
					Listan är för stor för att räkna nya prenumeranter per dag. Antalet
					prenumeranter nu stämmer ändå.
				</Alert>
			)}
			<Typography variant="body2" color="text.secondary">
				{gan.status === 'ok' &&
					'Prenumeranter och utskick kommer från Get a Newsletter och gäller alla sätt att anmäla sig, även popupen. De hämtas på nytt var femte minut. '}
				{gan.status === 'ok' && listsText(gan)}
				Via hemsidan = fältet längst ner på startsidan
				{data.website.since
					? `, räknat sedan ${formatDate(data.website.since)}.`
					: ', ingen har anmält sig där än.'}
				{gan.status === 'off' && !isAdmin && ' Get a Newsletter är inte kopplat.'}
			</Typography>
		</Box>
	);
}
