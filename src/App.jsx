import {
	BrowserRouter,
	Navigate,
	Route,
	Routes,
	useLocation,
} from 'react-router-dom';
import {
	Box,
	CircularProgress,
	CssBaseline,
	ThemeProvider,
} from '@mui/material';
import { theme } from './theme';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { NotificationProvider } from './components/Notifications';
import { AppLayout } from './components/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { MenusPage } from './pages/MenusPage';
import { OpeningHoursPage } from './pages/OpeningHoursPage';
import { PagesPage } from './pages/PagesPage';

function RequireAuth({ children }) {
	const { status } = useAuth();
	const location = useLocation();

	if (status === 'checking') {
		return (
			<Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
				<CircularProgress />
			</Box>
		);
	}
	if (status !== 'signedIn') {
		return <Navigate to="/login" replace state={{ from: location.pathname }} />;
	}
	return children;
}

export default function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<NotificationProvider>
				<AuthProvider>
					<BrowserRouter>
						<Routes>
							<Route path="/login" element={<LoginPage />} />
							<Route
								element={
									<RequireAuth>
										<AppLayout />
									</RequireAuth>
								}>
								<Route index element={<OverviewPage />} />
								<Route
									path="menyer"
									element={<Navigate to="/menyer/meny" replace />}
								/>
								<Route path="menyer/:list" element={<MenusPage />} />
								<Route path="oppettider" element={<OpeningHoursPage />} />
								<Route path="sidor" element={<PagesPage />} />
								<Route path="*" element={<Navigate to="/" replace />} />
							</Route>
						</Routes>
					</BrowserRouter>
				</AuthProvider>
			</NotificationProvider>
		</ThemeProvider>
	);
}
