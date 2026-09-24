export const MIN_PASSWORD = 8;

// Same rules as the API. Returns a message, or null when fine.
export const passwordProblem = (password) =>
	password.length < MIN_PASSWORD
		? `Minst ${MIN_PASSWORD} tecken`
		: password.length > 72
			? 'Högst 72 tecken'
			: null;
