import { createContext, useCallback, useContext, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const NotifyContext = createContext(() => {});

export function NotificationProvider({ children }) {
	const [toast, setToast] = useState(null);

	// notify('Sparat') or notify('Något gick fel', 'error')
	const notify = useCallback((message, severity = 'success') => {
		setToast({ message, severity, key: Date.now() });
	}, []);

	const close = (_e, reason) => {
		if (reason !== 'clickaway') setToast(null);
	};

	return (
		<NotifyContext.Provider value={notify}>
			{children}
			<Snackbar
				key={toast?.key}
				open={Boolean(toast)}
				autoHideDuration={toast?.severity === 'error' ? 8000 : 3500}
				onClose={close}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
				sx={{ bottom: { xs: 88, md: 24 } }}>
				{toast ? (
					<Alert
						onClose={close}
						severity={toast.severity}
						variant="filled"
						sx={{ width: '100%', alignItems: 'center' }}>
						{toast.message}
					</Alert>
				) : undefined}
			</Snackbar>
		</NotifyContext.Provider>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNotify = () => useContext(NotifyContext);
