import { ROLES } from '../api';
import { SITE_PAGES } from './sitePages';

const LIST_LABELS = {
	food: 'Meny',
	wine: 'Vinlista',
	lunch: 'Lunch',
	drinks: 'Dryck',
};
const PLACEMENT_TEXT = { navbar: 'i menyn', home: 'på startsidan' };

// ['fredag', 'lördag', 'söndag'] -> "fredag, lördag och söndag"
const joinSv = (items) =>
	items.length < 2
		? (items[0] ?? '')
		: `${items.slice(0, -1).join(', ')} och ${items.at(-1)}`;

const roleText = (role) => (ROLES[role]?.label ?? role ?? '').toLowerCase();

// What someone did, without their name: "laddade upp “Höstmeny” (Meny)"
export function describeActivity({ type, details = {} }) {
	const pdf = `“${details.title}” (${LIST_LABELS[details.pdfType] ?? details.pdfType})`;

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
		default:
			return type;
	}
}
