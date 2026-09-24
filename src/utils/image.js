// Crops a picked photo to a centred square and shrinks it to size×size JPG before upload,
// so a 10 MB phone photo becomes ~50 kB. Throws a Swedish message if the browser can't read it.
export async function squareJpeg(file, size = 512) {
	const url = URL.createObjectURL(file);
	try {
		const img = await new Promise((resolve, reject) => {
			const image = new Image();
			image.onload = () => resolve(image);
			image.onerror = reject;
			image.src = url;
		});
		const side = Math.min(img.naturalWidth, img.naturalHeight);
		const target = Math.min(size, side);
		const canvas = document.createElement('canvas');
		canvas.width = target;
		canvas.height = target;
		canvas
			.getContext('2d')
			.drawImage(
				img,
				(img.naturalWidth - side) / 2,
				(img.naturalHeight - side) / 2,
				side,
				side,
				0,
				0,
				target,
				target
			);
		const blob = await new Promise((resolve) =>
			canvas.toBlob(resolve, 'image/jpeg', 0.88)
		);
		if (!blob) throw new Error('toBlob failed');
		return blob;
	} catch {
		throw new Error('Kunde inte läsa bilden. Välj en JPG, PNG eller WebP.');
	} finally {
		URL.revokeObjectURL(url);
	}
}
