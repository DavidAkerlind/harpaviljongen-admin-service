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
