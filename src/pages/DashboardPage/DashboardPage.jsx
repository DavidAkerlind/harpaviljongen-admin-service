import { useState, useEffect } from 'react';
import {
	Container,
	Grid,
	Paper,
	Typography,
	Box,
	CircularProgress,
	Card,
	CardContent,
	Chip,
	LinearProgress,
	IconButton,
	Tooltip,
} from '@mui/material';
import {
	Assessment,
	Storage,
	Cloud,
	CheckCircle,
	Error,
	Refresh,
	Restaurant,
	LocalBar,
	Coffee,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/apiService';

export const DashboardPage = () => {
	const navigate = useNavigate();
	const [stats, setStats] = useState({
		totalMenus: 0,
		totalItems: 0,
		activeItems: 0,
		menuBreakdown: [],
	});
	const [systemStatus, setSystemStatus] = useState({
		api: { status: 'checking', latency: 0 },
		database: { status: 'checking', latency: 0 },
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadStats();
		checkSystemStatus();
		// Check system status every 30 seconds
		const interval = setInterval(checkSystemStatus, 30000);
		return () => clearInterval(interval);
	}, []);

	const checkSystemStatus = async () => {
		try {
			const start = Date.now();
			await api.getAllMenus();
			const apiLatency = Date.now() - start;
			setSystemStatus((prev) => ({
				...prev,
				api: { status: 'healthy', latency: apiLatency },
			}));
		} catch (error) {
			setSystemStatus((prev) => ({
				...prev,
				api: { status: 'error', latency: 0 },
			}));
		}
	};

	const loadStats = async () => {
		try {
			setLoading(true);
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
					type: menu.type,
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

	const getMenuIcon = (type) => {
		switch (type) {
			case 'wine':
				return <LocalBar />;
			case 'small bubbels':
				return <LocalBar />;
			case 'small beer':
				return <LocalBar />;
			case 'small cocktails':
				return <LocalBar />;
			default:
				return <Restaurant />;
		}
	};

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
				<CircularProgress />
			</Box>
		);
	}
	const handleMenuClick = (menuId) => {
		navigate(`/menu/${menuId}`);
	};

	return (
		<Container maxWidth="lg">
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: 4,
					mt: 3,
				}}>
				<Typography
					variant="h4"
					sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<Assessment /> Dashboard
				</Typography>
				<Tooltip title="Refresh Data">
					<IconButton onClick={loadStats}>
						<Refresh />
					</IconButton>
				</Tooltip>
			</Box>

			<Grid container spacing={3}>
				{/* System Status Cards */}
				<Grid item xs={12}>
					<Paper sx={{ p: 2, mb: 3 }}>
						<Typography
							variant="h6"
							sx={{
								mb: 2,
								display: 'flex',
								alignItems: 'center',
								gap: 1,
							}}>
							<Storage /> System Status
						</Typography>
						<Grid container spacing={2}>
							<Grid item xs={12} md={6}>
								<Card>
									<CardContent>
										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'space-between',
											}}>
											<Typography
												variant="h6"
												sx={{
													display: 'flex',
													alignItems: 'center',
													gap: 1,
												}}>
												<Cloud /> API Status
											</Typography>
											<Chip
												icon={
													systemStatus.api.status ===
													'healthy' ? (
														<CheckCircle />
													) : (
														<Error />
													)
												}
												label={`${systemStatus.api.status} (${systemStatus.api.latency}ms)`}
												color={
													systemStatus.api.status ===
													'healthy'
														? 'success'
														: 'error'
												}
											/>
										</Box>
										<LinearProgress
											variant="determinate"
											value={Math.min(
												100,
												(systemStatus.api.latency /
													1000) *
													100
											)}
											sx={{ mt: 2 }}
										/>
									</CardContent>
								</Card>
							</Grid>
							<Grid item xs={12} md={6}>
								<Card>
									<CardContent>
										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'space-between',
											}}>
											<Typography
												variant="h6"
												sx={{
													display: 'flex',
													alignItems: 'center',
													gap: 1,
												}}>
												<Storage /> Database Status
											</Typography>
											<Chip
												icon={
													systemStatus.database
														.status ===
													'healthy' ? (
														<CheckCircle />
													) : (
														<Error />
													)
												}
												label={
													systemStatus.database.status
												}
												color={
													systemStatus.database
														.status === 'healthy'
														? 'success'
														: 'error'
												}
											/>
										</Box>
									</CardContent>
								</Card>
							</Grid>
						</Grid>
					</Paper>
				</Grid>

				{/* Statistics Cards */}
				<Grid item xs={12} md={4}>
					<Card sx={{ height: '100%' }}>
						<CardContent>
							<Typography color="textSecondary" gutterBottom>
								Total Menus
							</Typography>
							<Typography variant="h3">
								{stats.totalMenus}
							</Typography>
							<LinearProgress
								variant="determinate"
								value={(stats.totalMenus / 10) * 100}
								sx={{ mt: 2 }}
							/>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12} md={4}>
					<Card sx={{ height: '100%' }}>
						<CardContent>
							<Typography color="textSecondary" gutterBottom>
								Total Items
							</Typography>
							<Typography variant="h3">
								{stats.totalItems}
							</Typography>
							<LinearProgress
								variant="determinate"
								value={
									(stats.activeItems / stats.totalItems) * 100
								}
								sx={{ mt: 2 }}
							/>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12} md={4}>
					<Card sx={{ height: '100%' }}>
						<CardContent>
							<Typography color="textSecondary" gutterBottom>
								Active Items
							</Typography>
							<Typography variant="h3">
								{stats.activeItems}
							</Typography>
							<Box
								sx={{
									display: 'flex',
									alignItems: 'center',
									mt: 2,
								}}>
								<Typography
									variant="body2"
									color="textSecondary">
									{(
										(stats.activeItems / stats.totalItems) *
										100
									).toFixed(1)}
									% of total
								</Typography>
							</Box>
						</CardContent>
					</Card>
				</Grid>

				{/* Menu Breakdown */}
				<Grid item xs={12}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>
								Menu Breakdown
							</Typography>
							<Grid container spacing={1}>
								{stats.menuBreakdown.map((menu) => (
									<Grid item xs={12} md={4} key={menu.id}>
										<Paper
											sx={{ p: 2 }}
											onClick={() =>
												handleMenuClick(menu.id)
											}>
											<Box
												sx={{
													width: 30,
													p: 1,
													cursor: 'pointer',
													transition:
														'transform 0.2s, box-shadow 0.2s',
													'&:hover': {
														transform:
															'translateY(-4px)',
														boxShadow:
															'0 4px 20px rgba(0,0,0,0.25)',
													},
												}}>
												{getMenuIcon(menu.type)}
												<Typography variant="subtitle1">
													{menu.title}
												</Typography>
											</Box>
											<Typography variant="body2">
												Items: {menu.itemCount} (Active:{' '}
												{menu.activeItems})
											</Typography>
											<LinearProgress
												variant="determinate"
												value={
													(menu.activeItems /
														menu.itemCount) *
													100
												}
												sx={{ mt: 0.5 }}
											/>
										</Paper>
									</Grid>
								))}
							</Grid>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Container>
	);
};
