import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { MenuProvider } from './contexts/MenuContext.jsx';
import { theme } from './utils/theme';
import { Navbar } from './components/Navbar/Navbar';
import { MenuList } from './components/MenuList/MenuList';
import { MenuEditor } from './components/MenuEditor/MenuEditor';
import { ItemList } from './components/ItemList/ItemList';
import { ItemEditor } from './components/ItemEditor/ItemEditor';
//  PAGES
import { SearchPage } from './pages/SearchPage/SearchPage';
import { DashboardPage } from './pages/DashboardPage/DashboardPage';

function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<MenuProvider>
				<Router>
					<Navbar />
					<Routes>
						<Route path="/" element={<DashboardPage />} />
						<Route path="/menus" element={<MenuList />} />
						<Route path="/menu/new" element={<MenuEditor />} />
						<Route path="/menu/:menuId" element={<MenuEditor />} />
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
						<Route path="/search" element={<SearchPage />} />
					</Routes>
				</Router>
			</MenuProvider>
		</ThemeProvider>
	);
}

export default App;
