import { createTheme } from '@mui/material/styles';

// Samma gröna toner som hemsidan (harpaviljongen.com)
export const brand = {
	green: '#063424',
	greenDark: '#04261a',
	moss: '#405c3f',
	sage: '#a7b19c',
	sageLight: '#e7ebe2',
	paper: '#ffffff',
	background: '#f5f4ef',
	text: '#1d2a22',
	muted: '#5f6b62',
	border: '#e2e1da',
};

export const theme = createTheme({
	palette: {
		mode: 'light',
		primary: {
			main: brand.green,
			dark: brand.greenDark,
			light: brand.moss,
			contrastText: '#ffffff',
		},
		secondary: { main: brand.sage, contrastText: brand.green },
		success: { main: '#2e7d4f' },
		background: { default: brand.background, paper: brand.paper },
		text: { primary: brand.text, secondary: brand.muted },
		divider: brand.border,
	},
	shape: { borderRadius: 12 },
	typography: {
		fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
		h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.01em' },
		h2: { fontSize: '1.25rem', fontWeight: 600 },
		h3: { fontSize: '1.05rem', fontWeight: 600 },
		button: { textTransform: 'none', fontWeight: 600 },
		overline: { fontWeight: 600, letterSpacing: '0.08em' },
	},
	components: {
		MuiButton: {
			defaultProps: { disableElevation: true },
			styleOverrides: { root: { borderRadius: 10, paddingInline: 16 } },
		},
		MuiCard: {
			defaultProps: { elevation: 0 },
			styleOverrides: {
				root: { border: `1px solid ${brand.border}`, borderRadius: 16 },
			},
		},
		MuiPaper: { styleOverrides: { rounded: { borderRadius: 16 } } },
		MuiTextField: { defaultProps: { size: 'small' } },
		MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
		MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
		MuiTab: {
			styleOverrides: {
				root: { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' },
			},
		},
	},
});
