import React from 'react';
import { useState, useEffect } from 'react';
import { formatDateTime } from '../../utils/formatDateTime';
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
	Fade,
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
	MenuBook,
	TrendingUp,
	CheckBox,
	Cake,
	LocalDining,
	CoffeeOutlined,
	Liquor,
	BrunchDining,
	SportsBar,
	LocalDrink,
	LocalPizza,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/apiService';
import { getMenuIcon } from '../../utils/menuIcons';

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
			const response = await api.getAllMenus();
			const apiLatency = Date.now() - start;
			setSystemStatus((prev) => ({
				api: {
					status: 'healthy',
					latency: apiLatency,
				},
				database: {
					status: response.data ? 'healthy' : 'error',
					latency: apiLatency,
				},
			}));
		} catch (error) {
			// If there's an error, both services might be down
			setSystemStatus((prev) => ({
				api: {
					status: 'error',
					latency: 0,
				},
				database: {
					status: 'error',
					latency: 0,
				},
			}));
		}
	};

	const loadStats = async () => {
		try {
			setLoading(true);
			const response = await api.getAllMenus();
			const menus = response.data;

			const statistics = {
				totalMenus: menus.length,
				totalItems: 0,
				activeItems: 0,
				menuBreakdown: [],
				lastUpdated: null,
			};

			menus.forEach((menu) => {
				const menuStats = {
					id: menu.id,
					title: menu.title,
					type: menu.type,
					itemCount: menu.items.length,
					activeItems: menu.items.filter((item) => item.active)
						.length,
					updatedAt: menu.updatedAt,
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
	const handleMenuClick = (menuId) => {
		navigate(`/menu/${menuId}`);
	};

	return (
		<Container maxWidth="lg">
			{/* Header */}
			<Fade in={true} timeout={800}>
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
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 2,
							fontWeight: 600,
						}}>
						<Assessment sx={{ color: 'primary.main' }} />
						Dashboard Overview
					</Typography>
					<Tooltip title="Refresh Data">
						<IconButton
							onClick={loadStats}
							sx={{
								bgcolor: 'background.paper',
								'&:hover': { bgcolor: 'background.default' },
							}}>
							<Refresh />
						</IconButton>
					</Tooltip>
				</Box>
			</Fade>

			<Grid container spacing={3}>
				{/* System Status */}
				<Grid item xs={12}>
					<Fade in={true} timeout={1000}>
						<Card
							sx={{
								background: 'rgba(19, 47, 76, 0.4)',
								backdropFilter: 'blur(10px)',
								borderRadius: 2,
							}}>
							<CardContent sx={{ p: 3 }}>
								<Typography
									variant="h6"
									sx={{
										mb: 3,
										display: 'flex',
										alignItems: 'center',
										gap: 1,
									}}>
									<Storage sx={{ color: 'primary.main' }} />
									System Health Monitor
								</Typography>
								<Grid container spacing={2}>
									<Grid item xs={12} md={6}>
										<StatusCard
											title="API Status"
											icon={<Cloud />}
											status={systemStatus.api.status}
											latency={systemStatus.api.latency}
										/>
									</Grid>
									<Grid item xs={12} md={6}>
										<StatusCard
											title="Database Status"
											icon={<Storage />}
											status={
												systemStatus.database.status
											}
											latency={
												systemStatus.database.latency
											}
										/>
									</Grid>
								</Grid>
							</CardContent>
						</Card>
					</Fade>
				</Grid>

				{/* Statistics Cards */}
				<Grid item xs={12} md={4}>
					<Fade in={true} timeout={1200}>
						<Card sx={statCardStyle}>
							<StatCard
								title="Total Menus"
								value={stats.totalMenus}
								icon={<MenuBook />}
								color="#4CAF50"
								updatedAt={stats.updatedAt}
							/>
						</Card>
					</Fade>
				</Grid>

				<Grid item xs={12} md={4}>
					<Fade in={true} timeout={1400}>
						<Card sx={statCardStyle}>
							<StatCard
								title="Total Items"
								value={stats.totalItems}
								icon={<Restaurant />}
								color="#2196F3"
								progress={
									(stats.activeItems / stats.totalItems) * 100
								}
							/>
						</Card>
					</Fade>
				</Grid>

				<Grid item xs={12} md={3}>
					<Fade in={true} timeout={1600}>
						<Card sx={statCardStyle}>
							<StatCard
								title="Active Items"
								value={stats.activeItems}
								icon={<CheckBox />}
								color="#FF9800"
								subtitle={`${(
									(stats.activeItems / stats.totalItems) *
									100
								).toFixed(1)}% of total`}
							/>
						</Card>
					</Fade>
				</Grid>

				{/* Menu Breakdown */}
				<Grid item xs={12}>
					<Fade in={true} timeout={1800}>
						<Card
							sx={{
								background: 'rgba(19, 47, 76, 0.4)',
								backdropFilter: 'blur(10px)',
								borderRadius: 2,
							}}>
							<CardContent>
								<Typography
									variant="h6"
									gutterBottom
									sx={{
										mb: 1,
										display: 'flex',
										alignItems: 'center',
										gap: 1,
									}}>
									<TrendingUp
										sx={{ color: 'primary.main' }}
									/>
									Menu Analytics
								</Typography>
								<Grid container spacing={2}>
									{stats.menuBreakdown.map((menu) => (
										<Grid item xs={12} md={4} key={menu.id}>
											<MenuCard
												menu={menu}
												onClick={() =>
													handleMenuClick(menu.id)
												}
											/>
										</Grid>
									))}
								</Grid>
							</CardContent>
						</Card>
					</Fade>
				</Grid>
				{/* Menu Analytics */}
				<Grid item xs={12}>
					<Fade in={true} timeout={1800}>
						<Card
							sx={{
								background: 'rgba(19, 47, 76, 0.4)',
								backdropFilter: 'blur(10px)',
								borderRadius: 2,
							}}>
							<CardContent>
								<Typography
									variant="h6"
									gutterBottom
									sx={{
										mb: 3,
										display: 'flex',
										alignItems: 'center',
										gap: 1,
									}}>
									<TrendingUp
										sx={{ color: 'primary.main' }}
									/>
									Menu Analytics 2
								</Typography>

								{stats.menuBreakdown.map((menu) => (
									<Card
										key={menu.id}
										onClick={() => handleMenuClick(menu.id)}
										sx={{
											mb: 2,
											cursor: 'pointer',
											transition: 'all 0.2s',
											'&:hover': {
												transform: 'translateX(8px)',
												bgcolor:
													'rgba(255, 255, 255, 0.05)',
											},
										}}>
										<CardContent
											sx={{
												display: 'flex',
												alignItems: 'center',
												flexDirection: {
													xs: 'column',
													sm: 'row',
												},
												gap: { xs: 2, sm: 0 },
												p: { xs: 2, sm: 3 },
												'&:last-child': { pb: 2 },
											}}>
											<Box
												sx={{
													gap: 1,
													display: 'flex',
													alignItems: 'center',
													flex: 1,
												}}>
												<Box
													sx={{
														p: 1,
														borderRadius: 1,
														bgcolor:
															'rgba(144, 202, 249, 0.08)',
													}}>
													{getMenuIcon(menu.type)}
												</Box>
												<Box sx={{ gap: 1 }}>
													<Typography
														variant="subtitle1"
														sx={{
															fontWeight: 500,
														}}>
														{menu.title}
													</Typography>
													{menu.updatedAt && (
														<Typography
															variant="caption"
															color="text.secondary">
															Last updated:{' '}
															{formatDateTime(
																menu.updatedAt
															)}
														</Typography>
													)}
													<Typography
														variant="body2"
														color="textSecondary">
														Type: {menu.type}
													</Typography>
												</Box>
											</Box>

											<Box
												sx={{
													display: 'flex',
													alignItems: 'center',
													gap: 3,
												}}>
												<Box
													sx={{ textAlign: 'right' }}>
													<Typography
														variant="body2"
														color="textSecondary">
														Total Items
													</Typography>
													<Typography
														variant="subtitle1"
														sx={{
															fontWeight: 500,
														}}>
														{menu.itemCount}
													</Typography>
												</Box>

												<Box
													sx={{
														textAlign: 'right',
														minWidth: 100,
													}}>
													<Typography
														variant="body2"
														color="textSecondary">
														Active Items
													</Typography>
													<Typography
														variant="subtitle1"
														sx={{
															fontWeight: 500,
															color:
																menu.activeItems >
																0
																	? 'success.main'
																	: 'error.main',
														}}>
														{menu.activeItems} (
														{Math.round(
															(menu.activeItems /
																menu.itemCount) *
																100
														)}
														%)
													</Typography>
												</Box>

												<Box sx={{ width: 100 }}>
													<Box
														sx={{
															display: {
																xs: 'none',
																sm: 'block',
															},
															width: '100%',
															height: 4,
															bgcolor:
																'rgba(144, 202, 249, 0.2)',
															borderRadius: 2,
														}}>
														<Box
															sx={{
																display: {
																	xs: 'none',
																	sm: 'block',
																},
																width: `${
																	(menu.activeItems /
																		menu.itemCount) *
																	100
																}%`,
																height: '100%',
																bgcolor:
																	'#90caf9',
																borderRadius: 2,
																transition:
																	'width 1s ease-in-out',
															}}
														/>
													</Box>
												</Box>
											</Box>
										</CardContent>
									</Card>
								))}
							</CardContent>
						</Card>
					</Fade>
				</Grid>
			</Grid>
		</Container>
	);
};

// Helper Components
const StatusCard = ({ title, icon, status, latency }) => (
	<Paper
		elevation={0}
		sx={{
			p: 3,
			height: '100%',
			transition: 'all 0.3s ease',
			background:
				status === 'healthy'
					? 'rgba(76, 175, 80, 0.15)'
					: 'rgba(244, 67, 54, 0.15)',
			borderLeft: '4px solid',
			borderColor: status === 'healthy' ? 'success.main' : 'error.main',
			'&:hover': {
				transform: 'translateY(-4px)',
				background:
					status === 'healthy'
						? 'rgba(76, 175, 80, 0.25)'
						: 'rgba(244, 67, 54, 0.25)',
			},
		}}>
		<Box
			sx={{
				display: 'flex',
				flexDirection: { xs: 'column', sm: 'row' },
				alignItems: { xs: 'flex-start', sm: 'center' },
				justifyContent: 'space-between',
				gap: 2,
			}}>
			<Box sx={{ display: 'flex', alignItems: 'center' }}>
				{React.cloneElement(icon, {
					sx: {
						color:
							status === 'healthy'
								? 'success.main'
								: 'error.main',
						fontSize: '2rem',
					},
				})}
				<Box>
					<Typography variant="h6" sx={{ fontWeight: 500 }}>
						{title}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Status:{' '}
						{status.charAt(0).toUpperCase() + status.slice(1)}
					</Typography>
				</Box>
			</Box>
			<Typography
				variant="h6"
				sx={{
					color: status === 'healthy' ? 'success.main' : 'error.main',
					fontWeight: 500,
				}}>
				{latency}ms
			</Typography>
		</Box>
	</Paper>
);

const StatCard = ({
	title,
	value,
	icon,
	color,
	progress,
	subtitle,
	updatedAt,
}) => (
	<Paper
		elevation={0}
		sx={{
			height: '100%',
			background: 'rgba(255, 255, 255, 0.05)',
			borderLeft: '4px solid',
			borderColor: color,
			transition: 'all 0.3s ease',
			'&:hover': {
				transform: 'translateY(-4px)',
				background: 'rgba(255, 255, 255, 0.08)',
			},
		}}>
		<Box sx={{ p: 3 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
				<Box
					sx={{
						p: 1,
						borderRadius: 1,
						bgcolor: `${color}15`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}>
					{React.cloneElement(icon, { sx: { color } })}
				</Box>
				<Box sx={{ flex: 1 }}>
					<Typography color="text.secondary" variant="body2">
						{title}
					</Typography>
					<Typography variant="h4" sx={{ fontWeight: 600, color }}>
						{value}
					</Typography>
				</Box>
			</Box>

			{subtitle && (
				<Typography variant="body2" color="text.secondary">
					{subtitle}
				</Typography>
			)}

			{progress && (
				<Box sx={{ mt: 2 }}>
					<Box
						sx={{
							width: '100%',
							height: 4,
							bgcolor: `${color}22`,
							borderRadius: '8px',
							overflow: 'hidden',
						}}>
						<Box
							sx={{
								width: `${progress}%`,
								height: '100%',
								bgcolor: color,
								borderRadius: '8px',
								transition: 'width 1s ease-in-out',
							}}
						/>
					</Box>
				</Box>
			)}
			{updatedAt && (
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{
						mt: 2,
						display: 'flex',
						alignItems: 'center',
						gap: 0.5,
					}}>
					Last updated: {formatDateTime(updatedAt)}
				</Typography>
			)}
		</Box>
	</Paper>
);

const MenuCard = ({ menu, onClick }) => (
	<Card
		sx={{
			p: 2,
			cursor: 'pointer',
			transition: 'all 0.2s',
			'&:hover': {
				transform: 'translateY(-4px)',
				boxShadow: 3,
			},
		}}
		onClick={onClick}>
		<Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
			{getMenuIcon(menu.type)}
			<Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 500 }}>
				{menu.title}
			</Typography>
		</Box>
		<Typography variant="body2" color="textSecondary">
			{menu.itemCount} items ({menu.activeItems} active)
		</Typography>
		{menu.updatedAt && (
			<Typography variant="caption" color="text.secondary">
				Last updated: {formatDateTime(menu.updatedAt)}
			</Typography>
		)}
		<Box
			sx={{
				width: '100%',
				height: 4,
				bgcolor: 'rgba(144, 202, 249, 0.2)',
				borderRadius: '8px',
				mt: 2,
			}}>
			<Box
				sx={{
					width: `${(menu.activeItems / menu.itemCount) * 100}%`,
					height: '100%',
					bgcolor: '#90caf9',
					borderRadius: 2,
					transition: 'width 1s ease-in-out',
				}}
			/>
		</Box>
	</Card>
);

const statCardStyle = {
	height: '100%',
	background: 'rgba(19, 47, 76, 0.4)',
	backdropFilter: 'blur(10px)',
	borderRadius: 2,
	transition: 'transform 0.2s',
	'&:hover': {
		transform: 'translateY(-4px)',
	},
};
