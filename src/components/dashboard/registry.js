import {
	HistoryOutlined,
	InsightsOutlined,
	LeaderboardOutlined,
	MenuBookOutlined,
	MonitorHeartOutlined,
	ScheduleOutlined,
	WebOutlined,
} from '@mui/icons-material';
import {
	ActivityWidget,
	HoursWidget,
	MenusWidget,
	PagesWidget,
	StatusWidget,
	TopPagesWidget,
	VisitorsWidget,
} from './widgets';

// Every widget that can be put on Översikt. The id is what is saved per user in the
// API, so don't rename one; a widget that is removed from here just disappears.
export const WIDGETS = {
	visitors: {
		title: 'Besökare',
		description: 'Besök de senaste 7 dagarna, med diagram',
		icon: InsightsOutlined,
		link: { to: '/statistik', label: 'Visa statistik' },
		Component: VisitorsWidget,
	},
	activity: {
		title: 'Senaste ändringar',
		description: 'Vem som ändrat vad i admin',
		icon: HistoryOutlined,
		link: { to: '/logg', label: 'Visa hela loggen' },
		Component: ActivityWidget,
	},
	menus: {
		title: 'Menyer',
		description: 'Vilken PDF varje meny visar på hemsidan',
		icon: MenuBookOutlined,
		link: { to: '/menyer/food', label: 'Hantera menyer' },
		Component: MenusWidget,
	},
	hours: {
		title: 'Öppettider',
		description: 'Veckans öppettider',
		icon: ScheduleOutlined,
		link: { to: '/oppettider', label: 'Ändra öppettider' },
		Component: HoursWidget,
	},
	status: {
		title: 'Driftstatus',
		description: 'Om hemsidan, API:t och databasen svarar',
		icon: MonitorHeartOutlined,
		Component: StatusWidget,
	},
	pages: {
		title: 'Sidor på hemsidan',
		description: 'Vilka sidor som visas i menyn och på startsidan',
		icon: WebOutlined,
		link: { to: '/sidor', label: 'Ändra sidor' },
		Component: PagesWidget,
	},
	topPages: {
		title: 'Populära sidor',
		description: 'Mest besökta sidorna de senaste 7 dagarna',
		icon: LeaderboardOutlined,
		link: { to: '/statistik', label: 'Visa statistik' },
		Component: TopPagesWidget,
	},
};

// ---- Layout

// Columns: 1 on phones, 2 on tablets and small laptops, 4 from 1200px wide
export const DASHBOARD_GRID = {
	display: 'grid',
	gap: 2,
	gridTemplateColumns: {
		xs: 'minmax(0, 1fr)',
		sm: 'repeat(2, minmax(0, 1fr))',
		lg: 'repeat(4, minmax(0, 1fr))',
	},
};

export const WIDGET_SPAN = {
	small: { xs: 'span 1', sm: 'span 1', lg: 'span 1' },
	medium: { xs: 'span 1', sm: 'span 1', lg: 'span 2' },
	large: { xs: 'span 1', sm: 'span 2', lg: 'span 4' },
};

// From 900px wide every widget is the same height: two rows fill the screen under the
// greeting, so a 14" laptop shows four widgets at once. On phones they are as tall as
// their content.
export const WIDGET_HEIGHT = {
	md: 'clamp(260px, calc((100vh - 176px) / 2), 400px)',
};

export const SIZES = [
	{ value: 'small', label: 'Liten', description: 'En fjärdedel av bredden' },
	{ value: 'medium', label: 'Mellan', description: 'Halva bredden' },
	{ value: 'large', label: 'Stor', description: 'Hela bredden' },
];

// Four widgets in two rows fill a 14" laptop screen; the rest are further down
export const DEFAULT_LAYOUT = [
	{ id: 'visitors', size: 'medium' },
	{ id: 'activity', size: 'medium' },
	{ id: 'menus', size: 'medium' },
	{ id: 'hours', size: 'medium' },
	{ id: 'status', size: 'medium' },
	{ id: 'pages', size: 'medium' },
];

// The saved layout without widgets or sizes this version doesn't know
export function layoutFor(saved) {
	if (!Array.isArray(saved)) return DEFAULT_LAYOUT;
	return saved.filter(
		(w) => WIDGETS[w.id] && SIZES.some((s) => s.value === w.size)
	);
}
