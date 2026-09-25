import { useState } from 'react';
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Skeleton,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Tabs,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from '@mui/material';
import { TableRowsOutlined, ShowChart } from '@mui/icons-material';
import { ANALYTICS_RANGES } from '../api';
import { useAuth } from '../auth/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { Legend, TrendChart } from '../components/charts/TrendChart';
import { BarList } from '../components/charts/BarList';
import { StatTile } from '../components/charts/StatTile';
import {
	BREAKDOWNS,
	METRICS,
	activeSources,
	breakdownRows,
	changePercent,
	formatLongDay,
	formatNumber,
	trendSeries,
	useAnalytics,
} from '../utils/analytics';
import { formatDate } from '../utils/format';

export function StatisticsPage() {
	const [range, setRange] = useState('30d');
	const { data, error, loading } = useAnalytics(range);

	return (
		<>
			<PageHeader
				title="Statistik"
				description="Besök på harpaviljongen.com. Vi räknar själva utan cookies och visar Cloudflare Web Analytics bredvid."
				actions={
					<ToggleButtonGroup
						exclusive
						size="small"
						value={range}
						onChange={(e, value) => value && setRange(value)}
						aria-label="Period">
						{ANALYTICS_RANGES.map((r) => (
							<ToggleButton key={r.value} value={r.value} sx={{ px: 1.75 }}>
								{r.label}
							</ToggleButton>
						))}
					</ToggleButtonGroup>
				}
			/>

			{error && !data ? (
				<Alert severity="error">Kunde inte hämta statistiken. {error}</Alert>
			) : !data ? (
				<Box sx={{ display: 'grid', gap: 2 }}>
					<Skeleton variant="rounded" height={110} />
					<Skeleton variant="rounded" height={340} />
				</Box>
			) : (
				// The previous numbers stay (dimmed) while another period loads
				<Box
					sx={{
						display: 'grid',
						gap: 2,
						opacity: loading ? 0.55 : 1,
						transition: 'opacity .2s ease',
					}}>
					<Totals data={data} />
					<Box
						sx={{
							display: 'grid',
							gap: 2,
							gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 3fr) minmax(0, 2fr)' },
						}}>
						<TrendCard data={data} />
						<BreakdownCard data={data} />
					</Box>
					<SourcesNote data={data} />
				</Box>
			)}
		</>
	);
}

function Totals({ data }) {
	const { own, ownPrevious, cloudflare } = data.totals;
	return (
		<Box
			sx={{
				display: 'grid',
				gap: { xs: 1, sm: 2 },
				gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
			}}>
			{['visits', 'views'].map((metric) => (
				<StatTile
					key={metric}
					label={`${METRICS[metric].label}, ${data.range.days} dagar`}
					value={own[metric]}
					change={changePercent(own[metric], ownPrevious[metric])}
					cloudflare={cloudflare?.[metric]}
				/>
			))}
		</Box>
	);
}

function TrendCard({ data }) {
	const [metric, setMetric] = useState('visits');
	const [asTable, setAsTable] = useState(false);
	const series = trendSeries(data, metric);

	return (
		<Card>
			<CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
				<Box
					sx={{
						display: 'flex',
						flexWrap: 'wrap',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: 1,
						mb: 1.5,
					}}>
					<Typography variant="h3">{METRICS[metric].label} per dag</Typography>
					<Box sx={{ display: 'flex', gap: 1 }}>
						<ToggleButtonGroup
							exclusive
							size="small"
							value={metric}
							onChange={(e, value) => value && setMetric(value)}
							aria-label="Visa">
							{Object.entries(METRICS).map(([key, m]) => (
								<ToggleButton key={key} value={key} sx={{ py: 0.25, px: 1.25 }}>
									{m.label}
								</ToggleButton>
							))}
						</ToggleButtonGroup>
						<Button
							size="small"
							color="inherit"
							onClick={() => setAsTable((v) => !v)}
							startIcon={asTable ? <ShowChart /> : <TableRowsOutlined />}>
							{asTable ? 'Diagram' : 'Tabell'}
						</Button>
					</Box>
				</Box>
				{series.length > 1 && (
					<Box sx={{ mb: 1 }}>
						<Legend series={series} />
					</Box>
				)}
				{asTable ? (
					<Box sx={{ maxHeight: 280, overflow: 'auto' }}>
						<Table size="small" stickyHeader>
							<TableHead>
								<TableRow>
									<TableCell>Dag</TableCell>
									{series.map((s) => (
										<TableCell key={s.key} align="right">
											{s.label}
										</TableCell>
									))}
								</TableRow>
							</TableHead>
							<TableBody>
								{[...data.series].reverse().map((day) => (
									<TableRow key={day.date}>
										<TableCell>{formatLongDay(day.date)}</TableCell>
										{series.map((s) => (
											<TableCell
												key={s.key}
												align="right"
												sx={{ fontVariantNumeric: 'tabular-nums' }}>
												{s.values[data.series.indexOf(day)] === null
													? '–'
													: formatNumber(day[s.key]?.[metric])}
											</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</Box>
				) : (
					<TrendChart
						dates={data.series.map((d) => d.date)}
						series={series}
						height={280}
						label={`${METRICS[metric].label} per dag, ${data.range.days} dagar`}
					/>
				)}
			</CardContent>
		</Card>
	);
}

function BreakdownCard({ data }) {
	const [kind, setKind] = useState('pages');
	const sources = activeSources(data);
	const rows = breakdownRows(data, kind);
	const unit = BREAKDOWNS.find((b) => b.value === kind).unit;

	return (
		<Card>
			<CardContent sx={{ p: 2.5, pt: 1.5, '&:last-child': { pb: 2.5 } }}>
				<Tabs
					value={kind}
					onChange={(e, value) => setKind(value)}
					sx={{ mb: 1.5, minHeight: 40, '& .MuiTab-root': { minHeight: 40, px: 1.5, minWidth: 0 } }}
					aria-label="Visa mest besökta">
					{BREAKDOWNS.map((b) => (
						<Tab key={b.value} value={b.value} label={b.label} />
					))}
				</Tabs>
				{sources.length > 1 && (
					<Box sx={{ mb: 1.5 }}>
						<Legend series={sources} shape="rect" />
					</Box>
				)}
				{rows.length === 0 ? (
					<Typography color="text.secondary">Inga besök den här perioden än.</Typography>
				) : (
					<BarList rows={rows} series={sources} unit={unit} />
				)}
			</CardContent>
		</Card>
	);
}

function SourcesNote({ data }) {
	const { isAdmin } = useAuth();
	const { own, cloudflare } = data.sources;
	return (
		<Box sx={{ display: 'grid', gap: 1 }}>
			{!own.since && (
				<Alert severity="info" variant="outlined" sx={{ bgcolor: 'background.paper' }}>
					Inga sidvisningar räknade än. Öppna harpaviljongen.com och ladda om den här
					sidan efter en minut. Besök från webbläsare med annonsblockerare räknas
					inte alltid.
				</Alert>
			)}
			{cloudflare.status === 'off' && isAdmin && (
				<Alert severity="info" variant="outlined" sx={{ bgcolor: 'background.paper' }}>
					Cloudflare Web Analytics är inte kopplat. Lägg till{' '}
					<code>CLOUDFLARE_API_TOKEN</code> och <code>CLOUDFLARE_ACCOUNT_ID</code> under
					Environment på Render, se docs/GO_LIVE.md i API:t.
				</Alert>
			)}
			{cloudflare.status === 'error' && (
				<Alert severity="warning" variant="outlined" sx={{ bgcolor: 'background.paper' }}>
					Kunde inte hämta från Cloudflare: {cloudflare.message}
				</Alert>
			)}
			<Typography variant="body2" color="text.secondary">
				{own.since && `Egen mätning sedan ${formatDate(own.since)}. `}
				Besök = sidvisningar som inte kom från en annan sida på hemsidan.
				{cloudflare.status === 'off' && !isAdmin && ' Cloudflare Web Analytics är inte kopplat.'}
			</Typography>
		</Box>
	);
}
