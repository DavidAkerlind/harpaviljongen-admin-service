import { ROLES } from '../api';
import { SITE_PAGES } from './sitePages';

// Filter categories on the Ändringar page (same keys as the API)
export const ACTIVITY_CATEGORIES = [
	{ value: 'menus', label: 'Menyer' },
	{ value: 'openingHours', label: 'Öppettider' },
	{ value: 'pages', label: 'Sidor' },
	{ value: 'users', label: 'Användare' },
	{ value: 'account', label: 'Konton och profiler' },
	{ value: 'log', label: 'Loggen' },
];

// Entries older than this are deleted automatically by the API
export const RETENTION_TEXT = 'ett år';

// "Rensa logg": same values and cut-offs as the API
export const CLEAR_OPTIONS = [
	{ value: '30d', label: 'Äldre än 30 dagar', text: 'äldre än 30 dagar' },
	{ value: '3m', label: 'Äldre än 3 månader', text: 'äldre än 3 månader' },
	{ value: '6m', label: 'Äldre än 6 månader', text: 'äldre än 6 månader' },
	{ value: '1y', label: 'Äldre än 1 år', text: 'äldre än 1 år' },
	{ value: 'all', label: 'Allt', text: '' },
];

// Everything created before this date is deleted; null for 'all'
export function clearCutoff(value, now = new Date()) {
	const cutoff = new Date(now);
	if (value === '30d') cutoff.setDate(cutoff.getDate() - 30);
	else if (value === '3m') cutoff.setMonth(cutoff.getMonth() - 3);
	else if (value === '6m') cutoff.setMonth(cutoff.getMonth() - 6);
	else if (value === '1y') cutoff.setFullYear(cutoff.getFullYear() - 1);
	else return null;
	return cutoff;
}

const changes = (n) => `${n} ${n === 1 ? 'ändring' : 'ändringar'}`;

// For entries saved before the menu's name was stored with them
const LIST_LABELS = { food: 'Meny', wine: 'Vinlista' };
const PLACEMENT_TEXT = { navbar: 'i menyn', home: 'på startsidan' };

// ['fredag', 'lördag', 'söndag'] -> "fredag, lördag och söndag"
const joinSv = (items) =>
	items.length < 2
		? (items[0] ?? '')
		: `${items.slice(0, -1).join(', ')} och ${items.at(-1)}`;

const roleText = (role) => (ROLES[role]?.label ?? role ?? '').toLowerCase();

// What someone did, without their name: "laddade upp “Höstmeny” (Meny)"
export function describeActivity({ type, details = {} }) {
	const pdf = `“${details.title}” (${details.menuLabel ?? LIST_LABELS[details.pdfType] ?? details.pdfType})`;
	const menu = `“${details.label}”`;

	switch (type) {
		case 'pdf.upload':
			return `laddade upp ${pdf}${details.activated ? ' och visar den på hemsidan' : ''}`;
		case 'pdf.activate':
			return `visar ${pdf} på hemsidan`;
		case 'pdf.deactivate':
			return `slutade visa ${pdf} på hemsidan`;
		case 'pdf.rename':
			return `döpte om “${details.from}” till ${pdf}`;
		case 'pdf.delete':
			return `tog bort ${pdf}`;
		case 'menu.create':
			return `skapade menyn ${menu}`;
		case 'menu.update': {
			const { label, navbar, home } = details.changes ?? {};
			const parts = [];
			if (label) parts.push(`döpte om menyn “${label.from}” till “${label.to}”`);
			const button = (value, placement) =>
				`${value ? 'visar' : 'döljer'} knappen för ${menu} ${PLACEMENT_TEXT[placement]}`;
			if (navbar !== undefined) parts.push(button(navbar, 'navbar'));
			if (home !== undefined) parts.push(button(home, 'home'));
			return joinSv(parts) || `ändrade menyn ${menu}`;
		}
		case 'menu.delete':
			return `tog bort menyn ${menu}${
				details.pdfs === 1
					? ' och dess PDF'
					: details.pdfs > 1
						? ` och dess ${details.pdfs} PDF:er`
						: ''
			}`;
		case 'openingHours.update': {
			const days = details.days ?? [];
			return days.length === 7
				? 'ändrade öppettiderna för hela veckan'
				: `ändrade öppettiderna för ${joinSv(days.map((d) => d.toLowerCase()))}`;
		}
		case 'pages.update':
			return joinSv(
				(details.changes ?? []).map(
					({ page, placement, value }) =>
						`${value ? 'visar' : 'döljer'} ${
							SITE_PAGES.find((p) => p.key === page)?.label ?? page
						} ${PLACEMENT_TEXT[placement] ?? placement}`
				)
			);
		case 'user.create':
			return `lade till ${details.username} som ${roleText(details.role)}`;
		case 'user.role':
			return `gjorde ${details.username} till ${roleText(details.role)}`;
		case 'user.password':
			return `gav ${details.username} ett nytt lösenord`;
		case 'user.delete':
			return `tog bort användaren ${details.username}`;
		case 'account.update': {
			const parts = [];
			if (details.username) {
				parts.push(
					`bytte användarnamn från ${details.username.from} till ${details.username.to}`
				);
			}
			if (details.name) {
				parts.push(
					details.name.to
						? `bytte namn till ${details.name.to}`
						: 'tog bort sitt namn'
				);
			}
			return joinSv(parts) || 'uppdaterade sin profil';
		}
		case 'account.avatar':
			return details.action === 'removed'
				? 'tog bort sin profilbild'
				: details.action === 'changed'
					? 'bytte profilbild'
					: 'lade till en profilbild';
		case 'account.password':
			return 'bytte sitt lösenord';
		case 'activity.clear': {
			const option = CLEAR_OPTIONS.find((o) => o.value === details.olderThan);
			return details.olderThan === 'all'
				? `tömde loggen (${changes(details.deleted)})`
				: `tog bort ${changes(details.deleted)} ${option?.text ?? ''} ur loggen`;
		}
		default:
			return type;
	}
}
