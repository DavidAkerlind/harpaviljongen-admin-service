import { createTheme } from '@mui/material';

export const theme = createTheme({
	palette: {
		primary: {
			main: '#1976d2',
		},
		secondary: {
			main: '#dc004e',
		},
	},
	components: {
		MuiContainer: {
			defaultProps: {
				maxWidth: 'lg',
			},
			styleOverrides: {
				root: {
					paddingTop: '2rem',
					paddingBottom: '2rem',
				},
			},
		},
	},
});
