export const handleApiResponse = (response) => {
	if (!response.success) {
		throw new Error(response.message);
	}
	return response.data;
};

export const createErrorMessage = (error) => {
	if (error.response?.data) {
		return error.response.data.message || 'An unexpected error occurred';
	}
	return error.message || 'An unexpected error occurred';
};
