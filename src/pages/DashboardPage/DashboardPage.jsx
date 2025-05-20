import { useState, useEffect } from 'react';
import {
	Container,
	Grid,
	Paper,
	Typography,
	Box,
	CircularProgress,
} from '@mui/material';
import { api } from '../../services/apiService';

export const DashboardPage = () => {
	const [stats, setStats] = useState({
		totalMenus: 0,
		totalItems: 0,
		activeItems: 0,
		menuBreakdown: [],
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadStats();
	}, []);

	const loadStats = async () => {
		try {
			const response = await api.getAllMenus();
			const menus = response.data.data;

			const statistics = {
				totalMenus: menus.length,
				totalItems: 0,
				activeItems: 0,
				menuBreakdown: [],
			};

			menus.forEach((menu) => {
				const menuStats = {
					id: menu.id,
					title: menu.title,
					itemCount: menu.items.length,
					activeItems: menu.items.filter((item) => item.active)
						.length,
				};

				statistics.totalItems += menuStats.itemCount;
				statistics.activeItems += menuStats.activeItems;
				statistics.menuBreakdown.push(menuStats);
			});

			setStats(statistics);
		} catch (error) {
			console.error('Error loading stats:', error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Container maxWidth="lg">
			<Typography variant="h4" sx={{ mb: 3, mt: 3 }}>
				Dashboard
			</Typography>

			<Grid container spacing={3}>
				<Grid item xs={12} md={4}>
					<Paper sx={{ p: 2 }}>
						<Typography variant="h6">Total Menus</Typography>
						<Typography variant="h3">{stats.totalMenus}</Typography>
					</Paper>
				</Grid>

				<Grid item xs={12} md={4}>
					<Paper sx={{ p: 2 }}>
						<Typography variant="h6">Total Items</Typography>
						<Typography variant="h3">{stats.totalItems}</Typography>
					</Paper>
				</Grid>

				<Grid item xs={12} md={4}>
					<Paper sx={{ p: 2 }}>
						<Typography variant="h6">Active Items</Typography>
						<Typography variant="h3">
							{stats.activeItems}
						</Typography>
					</Paper>
				</Grid>

				<Grid item xs={12}>
					<Paper sx={{ p: 2 }}>
						<Typography variant="h6" gutterBottom>
							Menu Breakdown
						</Typography>
						{stats.menuBreakdown.map((menu) => (
							<Box key={menu.id} sx={{ mb: 2 }}>
								<Typography variant="subtitle1">
									{menu.title}
								</Typography>
								<Typography variant="body2">
									Items: {menu.itemCount} (Active:{' '}
									{menu.activeItems})
								</Typography>
							</Box>
						))}
					</Paper>
				</Grid>
			</Grid>
		</Container>
	);
};
