import { createTheme } from '@mui/material';

export const theme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#90caf9',
			light: '#b3e5fc',
			dark: '#42a5f5',
		},
		secondary: {
			main: '#f48fb1',
		},
		background: {
			default: '#0a1929',
			paper: 'rgba(19, 47, 76, 0.5)',
		},
		success: {
			main: '#4caf50',
			light: '#81c784',
		},
		error: {
			main: '#f44336',
			light: '#e57373',
		},
	},
	components: {
		MuiCard: {
			styleOverrides: {
				root: {
					background: 'rgba(19, 47, 76, 0.6)',
					backdropFilter: 'blur(10px)',
					borderRadius: '16px',
					border: '1px solid rgba(255, 255, 255, 0.1)',
					transition:
						'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
					'&:hover': {
						boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
					},
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					background: 'rgba(19, 47, 76, 0.6)',
					backdropFilter: 'blur(10px)',
					borderRadius: '16px',
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: '8px',
					textTransform: 'none',
					fontWeight: 600,
					padding: '8px 16px',
				},
				contained: {
					boxShadow: 'none',
					'&:hover': {
						boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
					},
				},
			},
		},
		MuiListItem: {
			styleOverrides: {
				root: {
					borderRadius: '8px',
					marginBottom: '8px',
					transition: 'all 0.2s ease-in-out',
					'&:hover': {
						transform: 'translateX(4px)',
						backgroundColor: 'rgba(255, 255, 255, 0.05)',
					},
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					'& .MuiOutlinedInput-root': {
						borderRadius: '8px',
					},
				},
			},
		},
	},
	typography: {
		fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
		h4: {
			fontWeight: 600,
		},
		h5: {
			fontWeight: 600,
		},
		h6: {
			fontWeight: 600,
		},
	},
});
