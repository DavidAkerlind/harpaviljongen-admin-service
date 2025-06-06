export const formatDateTime = (dateString) => {
	const date = new Date(dateString);
	// Add 1 hour to compensate for timezone difference
	date.setHours(date.getHours() + 1);

	return date.toLocaleString('sv-SE', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	});
};
