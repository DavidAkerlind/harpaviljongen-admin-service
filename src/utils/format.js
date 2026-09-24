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

export const formatTime = (value) => {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? '' : timeFormat.format(date);
};

// Dates in the browser's own time zone, as "YYYY-MM-DD" for <input type="date">
const pad = (n) => String(n).padStart(2, '0');
export const toDayString = (date) =>
	`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const parseDay = (value) => {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
	return match ? new Date(+match[1], +match[2] - 1, +match[3]) : null;
};
export const startOfDay = (date = new Date()) => {
	const copy = new Date(date);
	copy.setHours(0, 0, 0, 0);
	return copy;
};
export const addDays = (date, days) => {
	const copy = new Date(date);
	copy.setDate(copy.getDate() + days);
	return copy;
};

const weekdayFormat = new Intl.DateTimeFormat('sv-SE', {
	weekday: 'long',
	day: 'numeric',
	month: 'long',
});
const weekdayYearFormat = new Intl.DateTimeFormat('sv-SE', {
	weekday: 'long',
	day: 'numeric',
	month: 'long',
	year: 'numeric',
});

// Heading for a day in a list: "Idag", "Igår", "Tisdag 22 september"
export const formatDayHeading = (date, now = new Date()) => {
	const day = startOfDay(date);
	const today = startOfDay(now);
	if (day.getTime() === today.getTime()) return 'Idag';
	if (day.getTime() === addDays(today, -1).getTime()) return 'Igår';
	const text = (
		day.getFullYear() === today.getFullYear()
			? weekdayFormat
			: weekdayYearFormat
	).format(day);
	return text[0].toUpperCase() + text.slice(1);
};
