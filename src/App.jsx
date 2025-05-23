import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { MenuProvider } from './contexts/MenuContext.jsx';
import { theme } from './utils/theme';
import { Navbar } from './components/Navbar/Navbar';
import { MenuList } from './components/MenuList/MenuList';
import { MenuEditor } from './components/MenuEditor/MenuEditor';
import { ItemList } from './components/ItemList/ItemList';
import { ItemEditor } from './components/ItemEditor/ItemEditor';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { EventEditor } from './components/EventEditor/EventEditor';
import { OpeningHoursEditor } from './components/OpeningHoursEditor/OpeningHoursEditor';
import { EventList } from './components/EventList/EventList.jsx';
//  PAGES
import { SearchPage } from './pages/SearchPage/SearchPage';
import { DashboardPage } from './pages/DashboardPage/DashboardPage';

function App() {
	return (
		<AuthProvider>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<MenuProvider>
					<Router>
						<Navbar />
						<Routes>
							<Route path="/login" element={<LoginPage />} />
							<Route
								path="/*"
								element={
									<ProtectedRoute>
										<Routes>
											{/* Your existing routes */}
											<Route
												path="/"
												element={<DashboardPage />}
											/>
											<Route
												path="/menus"
												element={<MenuList />}
											/>
											<Route
												path="/menu/new"
												element={<MenuEditor />}
											/>
											<Route
												path="/menu/:menuId"
												element={<MenuEditor />}
											/>
											<Route
												path="/menu/:menuId/items"
												element={<ItemList />}
											/>
											<Route
												path="/menu/:menuId/items/new"
												element={<ItemEditor />}
											/>
											<Route
												path="/menu/:menuId/items/:itemId"
												element={<ItemEditor />}
											/>
											<Route
												path="/search"
												element={<SearchPage />}
											/>
											<Route
												path="/events"
												element={<EventList />}
											/>
											<Route
												path="/events/new"
												element={<EventEditor />}
											/>
											<Route
												path="/events/:eventId"
												element={<EventEditor />}
											/>
											<Route
												path="/opening-hours"
												element={<OpeningHoursEditor />}
											/>
										</Routes>
									</ProtectedRoute>
								}
							/>
						</Routes>
					</Router>
				</MenuProvider>
			</ThemeProvider>
		</AuthProvider>
	);
}

export default App;
