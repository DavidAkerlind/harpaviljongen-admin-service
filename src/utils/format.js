export const WEEK_DAYS = [
	'Måndag',
	'Tisdag',
	'Onsdag',
	'Torsdag',
	'Fredag',
	'Lördag',
	'Söndag',
];

// JS getDay(): 0 = söndag
export const todayName = () => WEEK_DAYS[(new Date().getDay() + 6) % 7];

const dateFormat = new Intl.DateTimeFormat('sv-SE', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
});
const timeFormat = new Intl.DateTimeFormat('sv-SE', {
	hour: '2-digit',
	minute: '2-digit',
});

export const formatDate = (value) => {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? '' : dateFormat.format(date);
};

export const formatDateTime = (value) => {
	const date = new Date(value);
	return Number.isNaN(date.getTime())
		? ''
		: `${dateFormat.format(date)} kl. ${timeFormat.format(date)}`;
};

export const formatBytes = (bytes) => {
	if (!bytes) return '';
	if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} kB`;
	return `${(bytes / 1024 / 1024).toLocaleString('sv-SE', { maximumFractionDigits: 1 })} MB`;
};

export const formatHours = (hours) =>
	hours?.from && hours?.to ? `${hours.from}–${hours.to}` : 'Stängt';

// Cloudinary can render the first page of a PDF as an image: …/image/upload/pg_1,w_480/…/file.jpg
export const pdfThumbnailUrl = (url, width = 480) => {
	if (!url || !url.includes('/image/upload/') || !/\.pdf$/i.test(url))
		return null;
	return url
		.replace('/image/upload/', `/image/upload/pg_1,w_${width},c_limit,q_auto/`)
		.replace(/\.pdf$/i, '.jpg');
};

// "nyss", "för 5 min sedan", "idag kl. 14:05", "igår kl. 14:05", "12 okt. 2026 kl. 14:05"
export const formatRelative = (value, now = new Date()) => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	const minutes = Math.floor((now - date) / 60000);
	if (minutes < 1) return 'nyss';
	if (minutes < 60) return `för ${minutes} min sedan`;
	const time = timeFormat.format(date);
	const startOfToday = new Date(now);
	startOfToday.setHours(0, 0, 0, 0);
	if (date >= startOfToday) return `idag kl. ${time}`;
	if (date >= new Date(startOfToday.getTime() - 86400000)) {
		return `igår kl. ${time}`;
	}
	return formatDateTime(date);
};
