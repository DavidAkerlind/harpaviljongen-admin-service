// Startbild: the photos at the top of the website's home page

// The API takes at most 10 MB (Cloudinary's limit). Larger phone and camera photos are
// shrunk in the browser to this many pixels on the longest side first, which is still more
// than any screen needs, and uploads a lot faster.
const MAX_SIDE = 3840;
const MAX_BYTES = 10 * 1024 * 1024;
const UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const HERO_INTERVAL = { min: 5, max: 30 };

// Cloudinary makes a smaller copy from the address: …/upload/<size>/v1/…
export const heroThumb = (url, width) =>
	url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`);

function loadImage(file) {
	const url = URL.createObjectURL(file);
	return new Promise((resolve, reject) => {
		const image = new Image();
		// Browsers turn the photo the way the camera held it (EXIF) when drawing it
		image.onload = () => resolve({ image, url });
		image.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('unreadable'));
		};
		image.src = url;
	});
}

// Returns { file, preview } ready to upload: the photo itself when it's small enough,
// otherwise a JPG shrunk to 3840 px. preview is a local address to show while uploading
// (call URL.revokeObjectURL on it after). Throws a Swedish message for files it can't use.
export async function prepareHeroUpload(file) {
	let loaded;
	try {
		loaded = await loadImage(file);
	} catch {
		throw new Error(
			`${file.name}: kunde inte läsa bilden. Spara den som JPG och försök igen.`
		);
	}
	const { image, url } = loaded;
	const width = image.naturalWidth;
	const height = image.naturalHeight;

	if (
		UPLOAD_TYPES.includes(file.type) &&
		file.size <= MAX_BYTES &&
		Math.max(width, height) <= MAX_SIDE
	) {
		return { file, preview: url };
	}

	const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
	const canvas = document.createElement('canvas');
	canvas.width = Math.round(width * scale);
	canvas.height = Math.round(height * scale);
	const context = canvas.getContext('2d');
	context.imageSmoothingQuality = 'high';
	context.drawImage(image, 0, 0, canvas.width, canvas.height);
	let blob = null;
	for (const quality of [0.9, 0.8, 0.7]) {
		blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
		if (blob && blob.size <= MAX_BYTES) break;
	}
	if (!blob || blob.size > MAX_BYTES) {
		URL.revokeObjectURL(url);
		throw new Error(`${file.name}: bilden är för stor. Försök med en mindre bild.`);
	}
	const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
	return { file: new File([blob], name, { type: 'image/jpeg' }), preview: url };
}

// The quality score (1–10, from the API) as a word and colours
export const QUALITY = {
	good: { label: 'Bra', color: '#1f6b40', bg: '#e1f0e6' },
	ok: { label: 'Okej', color: '#7a5200', bg: '#fbefd3' },
	poor: { label: 'Dålig', color: '#a8261c', bg: '#fbe3e0' },
};

// "Skarp på både dator och mobil." or where it gets blurry, and the size
export function qualityText({ quality, width, height }) {
	const { score, desktop, phone } = quality;
	const where =
		desktop < phone ? 'stora datorskärmar' : phone < desktop ? 'mobiler' : 'både dator och mobil';
	const verdict =
		score >= 8
			? 'Skarp på både dator och mobil.'
			: score >= 5
				? `Duger, men kan se lite mjuk ut på ${where}.`
				: `För liten, blir suddig på ${where}.`;
	return { verdict, size: `${width} × ${height} px` };
}

// Where the photo's most important point is, as CSS object-position
export const focusPosition = (focus) => `${focus?.x ?? 50}% ${focus?.y ?? 50}%`;
