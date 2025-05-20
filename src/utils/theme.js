import { createTheme } from '@mui/material';

export const theme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#90caf9',
		},
		secondary: {
			main: '#f48fb1',
		},
		background: {
			default: '#0a1929',
			paper: '#132f4c',
		},
	},
	components: {
		MuiCard: {
			styleOverrides: {
				root: {
					background: 'rgba(19, 47, 76, 0.4)',
					backdropFilter: 'blur(10px)',
					borderRadius: '12px',
					border: '1px solid rgba(255, 255, 255, 0.1)',
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					background: 'rgba(19, 47, 76, 0.4)',
					backdropFilter: 'blur(10px)',
					borderRadius: '12px',
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: '8px',
				},
			},
		},
	},
});
