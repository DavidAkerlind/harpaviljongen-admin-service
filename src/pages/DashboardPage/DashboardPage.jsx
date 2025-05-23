import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDateTime } from '../../utils/formatDateTime';
import {
	Container,
	Grid,
	Box,
	CircularProgress,
	Card,
	CardContent,
	Typography,
	Fade,
	Paper,
} from '@mui/material';
import {
	MenuBook,
	CheckBox,
	Restaurant,
	Grid3x3Outlined,
} from '@mui/icons-material';
import { api } from '../../services/apiService';
import { DashboardHeader } from '../../components/DashboardComponents/DashboardHeader';
import { SystemStatus } from '../../components/DashboardComponents/SystemStatus';
import { StatCard } from '../../components/DashboardComponents/StatCard';
import { QuickActions } from '../../components/DashboardComponents/QuickActions';

export const DashboardPage = () => {
	const navigate = useNavigate();
	const [data, setData] = useState({
		menus: [],
		events: [],
		stats: {
			totalMenus: 0,
			totalItems: 0,
			activeItems: 0,
			menuBreakdown: [],
		},
	});
	const [systemStatus, setSystemStatus] = useState({
		api: { status: 'checking', latency: 0 },
		database: { status: 'checking', latency: 0 },
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		loadDashboardData();
		const interval = setInterval(checkSystemStatus, 30000);
		return () => clearInterval(interval);
	}, []);

	const checkSystemStatus = async () => {
		try {
			const start = Date.now();
			const response = await api.getAllMenus();
			const apiLatency = Date.now() - start;
			setSystemStatus({
				api: { status: 'healthy', latency: apiLatency },
				database: {
					status: response.data ? 'healthy' : 'error',
					latency: apiLatency,
				},
			});
		} catch (error) {
			setSystemStatus({
				api: { status: 'error', latency: 0 },
				database: { status: 'error', latency: 0 },
			});
		}
	};

	const loadDashboardData = async () => {
		try {
			setLoading(true);
			setError(null);

			const menusRes = await api.getAllMenus();
			const menus = menusRes.data || [];

			const stats = {
				totalMenus: menus.length,
				totalItems: 0,
				activeItems: 0,
				menuBreakdown: menus.map((menu) => ({
					id: menu.id,
					title: menu.title,
					type: menu.type,
					itemCount: menu.items.length,
					activeItems: menu.items.filter((item) => item.active)
						.length,
					updatedAt: menu.updatedAt,
				})),
			};

			stats.totalItems = menus.reduce(
				(sum, menu) => sum + menu.items.length,
				0
			);
			stats.activeItems = menus.reduce(
				(sum, menu) =>
					sum + menu.items.filter((item) => item.active).length,
				0
			);

			let events = [];
			try {
				const eventsRes = await api.getAllEvents();
				events = eventsRes.data || [];
			} catch (eventError) {
				console.warn('Events could not be loaded:', eventError);
			}

			setData({ menus, events, stats });
			await checkSystemStatus();
		} catch (error) {
			console.error('Error loading dashboard data:', error);
			setError(error.message);
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
			<Fade in={true} timeout={800}>
				<Box sx={{ py: 3 }}>
					<DashboardHeader onRefresh={loadDashboardData} />

					{error && (
						<Typography color="error" sx={{ mb: 2 }}>
							{error}
						</Typography>
					)}

					<Grid container spacing={3}>
						{/* System Status with Quick Actions */}

						<Grid item xs={12} md={6}>
							<SystemStatus systemStatus={systemStatus} />
						</Grid>

						<Paper sx={{ p: 2 }}>
							<Typography>Quick Actions</Typography>
							<QuickActions />
						</Paper>

						{/* Statistics */}
						<StatCard
							title="Total Menus"
							value={data.stats.totalMenus}
							icon={<MenuBook />}
							color="#4CAF50"
						/>

						<StatCard
							title="Total Items"
							value={data.stats.totalItems}
							icon={<Restaurant />}
							color="#2196F3"
							progress={
								(data.stats.activeItems /
									data.stats.totalItems) *
								100
							}
						/>

						<StatCard
							title="Active Items"
							value={data.stats.activeItems}
							icon={<CheckBox />}
							color="#FF9800"
							subtitle={`${(
								(data.stats.activeItems /
									data.stats.totalItems) *
								100
							).toFixed(1)}% of total`}
						/>

						{/* Menu List */}
						<Grid item xs={12} md={6}>
							<Card sx={{ height: '100%' }}>
								<CardContent>
									<Box
										sx={{
											display: 'flex',
											justifyContent: 'space-between',
											mb: 2,
										}}>
										<Typography variant="h6">
											Menus
										</Typography>
										<Typography
											variant="caption"
											color="text.secondary">
											Last updated:{' '}
											{formatDateTime(new Date())}
										</Typography>
									</Box>
									{data.stats.menuBreakdown.map((menu) => (
										<Paper
											key={menu.id}
											sx={{
												p: 2,
												mb: 2,
												cursor: 'pointer',
												transition: 'transform 0.2s',
												'&:hover': {
													transform:
														'translateX(8px)',
												},
											}}
											onClick={() =>
												navigate(`/menu/${menu.id}`)
											}>
											<Box
												sx={{
													display: 'flex',
													justifyContent:
														'space-between',
													alignItems: 'center',
												}}>
												<Box>
													<Typography variant="subtitle1">
														{menu.title}
													</Typography>
													<Typography
														variant="body2"
														color="text.secondary">
														{menu.activeItems}{' '}
														active /{' '}
														{menu.itemCount} total
														items
													</Typography>
													{menu.updatedAt && (
														<Typography
															variant="caption"
															color="text.secondary">
															Updated:{' '}
															{formatDateTime(
																menu.updatedAt
															)}
														</Typography>
													)}
												</Box>
												<Box sx={{ width: 100 }}>
													<Box
														sx={{
															width: '100%',
															height: 4,
															bgcolor:
																'rgba(0,0,0,0.1)',
															borderRadius: 1,
														}}>
														<Box
															sx={{
																width: `${
																	(menu.activeItems /
																		menu.itemCount) *
																	100
																}%`,
																height: '100%',
																bgcolor:
																	'#4CAF50',
																borderRadius: 1,
															}}
														/>
													</Box>
												</Box>
											</Box>
										</Paper>
									))}
								</CardContent>
							</Card>
						</Grid>

						{/* Events List */}
						<Grid item xs={12} md={6}>
							<Card sx={{ height: '100%' }}>
								<CardContent>
									<Box
										sx={{
											display: 'flex',
											justifyContent: 'space-between',
											mb: 2,
										}}>
										<Typography variant="h6">
											Events
										</Typography>
										<Typography
											variant="caption"
											color="text.secondary">
											Last updated:{' '}
											{formatDateTime(new Date())}
										</Typography>
									</Box>
									{data.events.map((event) => (
										<Paper
											key={event.eventId}
											sx={{
												p: 2,
												mb: 2,
												cursor: 'pointer',
												transition: 'transform 0.2s',
												'&:hover': {
													transform:
														'translateX(8px)',
												},
											}}
											onClick={() =>
												navigate(
													`/events/${event.eventId}`
												)
											}>
											<Typography variant="subtitle1">
												{event.title}
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary">
												{new Date(
													event.date
												).toLocaleDateString()}{' '}
												• {event.startTime}-
												{event.endTime}
											</Typography>
											{event.updatedAt && (
												<Typography
													variant="caption"
													color="text.secondary">
													Updated:{' '}
													{formatDateTime(
														event.updatedAt
													)}
												</Typography>
											)}
										</Paper>
									))}
									{data.events.length === 0 && (
										<Typography
											color="text.secondary"
											align="center">
											No events found
										</Typography>
									)}
								</CardContent>
							</Card>
						</Grid>
					</Grid>
				</Box>
			</Fade>
		</Container>
	);
};
