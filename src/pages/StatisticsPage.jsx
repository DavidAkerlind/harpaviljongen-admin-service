import { useState } from 'react';
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import { TableRowsOutlined, ShowChart } from '@mui/icons-material';
import { ANALYTICS_RANGES } from '../api';
import { useAuth } from '../auth/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { Segment } from '../components/Segment';
import { TrendChart } from '../components/charts/TrendChart';
import { BarList } from '../components/charts/BarList';
import { StatTile } from '../components/charts/StatTile';
import {
	BREAKDOWNS,
	METRICS,
	availableBreakdowns,
	barSeries,
	breakdownRows,
	combinedOf,
	formatLongDay,
	formatNumber,
	totalChange,
	totalOf,
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
				description="Besök på harpaviljongen.com. Vår egen räkning utan cookies och Cloudflares siffror, ihoplagda."
				actions={
					<Segment
						label="Period"
						items={ANALYTICS_RANGES}
						value={range}
						onChange={setRange}
					/>
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
					value={totalOf(data, metric)}
					change={totalChange(data, metric)}
				/>
			))}
		</Box>
	);
}

function TrendCard({ data }) {
	const [metric, setMetric] = useState('visits');
	const [asTable, setAsTable] = useState(false);
	const series = trendSeries(data, metric);
	const days = combinedOf(data).series;

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
						<Segment
							label="Visa"
							size="sm"
							items={Object.entries(METRICS).map(([key, m]) => ({ value: key, label: m.label }))}
							value={metric}
							onChange={setMetric}
						/>
						<Button
							size="small"
							color="inherit"
							onClick={() => setAsTable((v) => !v)}
							startIcon={asTable ? <ShowChart /> : <TableRowsOutlined />}>
							{asTable ? 'Diagram' : 'Tabell'}
						</Button>
					</Box>
				</Box>
				{asTable ? (
					<Box sx={{ maxHeight: 280, overflow: 'auto' }}>
						<Table size="small" stickyHeader>
							<TableHead>
								<TableRow>
									<TableCell>Dag</TableCell>
									<TableCell align="right">{METRICS[metric].label}</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{[...days].reverse().map((day) => (
									<TableRow key={day.date}>
										<TableCell>{formatLongDay(day.date)}</TableCell>
										<TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
											{day[metric] === null ? '–' : formatNumber(day[metric])}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</Box>
				) : (
					<TrendChart
						dates={days.map((d) => d.date)}
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
	const [chosen, setKind] = useState('pages');
	const tabs = availableBreakdowns(data);
	// Länder is gone when Cloudflare isn't connected
	const kind = tabs.some((b) => b.value === chosen) ? chosen : 'pages';
	const rows = breakdownRows(data, kind);
	const unit = BREAKDOWNS.find((b) => b.value === kind).unit;

	return (
		<Card>
			<CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
				<Segment
					label="Visa mest besökta"
					size="sm"
					fullWidth
					items={tabs}
					value={kind}
					onChange={setKind}
					sx={{ mb: 2 }}
				/>
				{rows.length === 0 ? (
					<Typography color="text.secondary">Inga besök den här perioden än.</Typography>
				) : (
					<BarList rows={rows} series={barSeries()} unit={unit} />
				)}
			</CardContent>
		</Card>
	);
}

function SourcesNote({ data }) {
	const { isAdmin } = useAuth();
	const { cloudflare } = data.sources;
	const { since } = combinedOf(data);
	return (
		<Box sx={{ display: 'grid', gap: 1 }}>
			{!since && (
				<Alert severity="info" variant="outlined" sx={{ bgcolor: 'background.paper' }}>
					Inga sidvisningar räknade än. Öppna harpaviljongen.com och ladda om den här
					sidan efter en minut. Besök från webbläsare med annonsblockerare räknas
					inte alltid.
				</Alert>
			)}
			{cloudflare.status === 'off' && isAdmin && (
				<Alert severity="info" variant="outlined" sx={{ bgcolor: 'background.paper' }}>
					Cloudflare är inte kopplat. Lägg till{' '}
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
				{since && `Räknat sedan ${formatDate(since)}. `}
				{cloudflare.status === 'ok'
					? 'Siffrorna är vår egen räkning och Cloudflares, ihoplagda. '
					: 'Siffrorna är vår egen räkning. '}
				Besök = sidvisningar som inte kom från en annan sida på hemsidan. Robotar räknas
				inte.
				{cloudflare.status === 'off' && !isAdmin && ' Cloudflare är inte kopplat.'}
			</Typography>
		</Box>
	);
}
