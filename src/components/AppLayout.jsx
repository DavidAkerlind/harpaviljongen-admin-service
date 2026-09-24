import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
	AppBar,
	Avatar,
	BottomNavigation,
	BottomNavigationAction,
	Box,
	Button,
	Divider,
	IconButton,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Paper,
	Toolbar,
	Tooltip,
	Typography,
} from '@mui/material';
import {
	SpaceDashboardOutlined,
	MenuBookOutlined,
	ScheduleOutlined,
	WebOutlined,
	OpenInNew,
	Logout,
	PeopleOutline,
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { ROLES } from '../api';
import { SITE_URL } from '../api/client';
import { brand } from '../theme';
import hareLogo from '../assets/hare-logo-white.svg';

const DRAWER_WIDTH = 248;

const NAV_ITEMS = [
	{ label: 'Översikt', to: '/', icon: <SpaceDashboardOutlined /> },
	{
		label: 'Menyer',
		to: '/menyer/meny',
		match: '/menyer',
		icon: <MenuBookOutlined />,
	},
	{ label: 'Öppettider', to: '/oppettider', icon: <ScheduleOutlined /> },
	{ label: 'Sidor', to: '/sidor', icon: <WebOutlined /> },
];

// Only for admins: in the sidebar on desktop, in the account menu on phones
const USERS_ITEM = {
	label: 'Användare',
	to: '/anvandare',
	icon: <PeopleOutline />,
};

const isActive = (item, pathname) =>
	item.to === '/'
		? pathname === '/'
		: pathname.startsWith(item.match ?? item.to);

function Brand() {
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
			<Box
				component="img"
				src={hareLogo}
				alt=""
				sx={{ width: 34, height: 34 }}
			/>
			<Box sx={{ lineHeight: 1.1 }}>
				<Typography
					sx={{
						fontWeight: 700,
						letterSpacing: '0.06em',
						fontSize: '0.95rem',
					}}>
					HARPAVILJONGEN
				</Typography>
				<Typography sx={{ fontSize: '0.75rem', opacity: 0.7 }}>
					Admin
				</Typography>
			</Box>
		</Box>
	);
}

function UserAvatar({ user, size = 32 }) {
	return (
		<Avatar
			sx={{
				width: size,
				height: size,
				bgcolor: brand.moss,
				color: '#fff',
				fontSize: Math.round(size * 0.45),
			}}>
			{user?.username?.[0]?.toUpperCase()}
		</Avatar>
	);
}

function Sidebar() {
	const { pathname } = useLocation();
	const { user, isAdmin, logout } = useAuth();
	const items = isAdmin ? [...NAV_ITEMS, USERS_ITEM] : NAV_ITEMS;

	return (
		<Box
			component="nav"
			sx={{
				display: { xs: 'none', md: 'flex' },
				flexDirection: 'column',
				position: 'fixed',
				inset: '0 auto 0 0',
				width: DRAWER_WIDTH,
				bgcolor: brand.green,
				color: '#fff',
				p: 2.5,
			}}>
			<Brand />
			<List sx={{ mt: 4, display: 'grid', gap: 0.5 }}>
				{items.map((item) => {
					const active = isActive(item, pathname);
					return (
						<ListItemButton
							key={item.to}
							component={NavLink}
							to={item.to}
							sx={{
								borderRadius: 2,
								color: active ? '#fff' : 'rgba(255,255,255,0.75)',
								bgcolor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
								'&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
							}}>
							<ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}>
								{item.icon}
							</ListItemIcon>
							<ListItemText
								primary={item.label}
								slotProps={{ primary: { fontWeight: active ? 600 : 500 } }}
							/>
						</ListItemButton>
					);
				})}
			</List>

			<Box sx={{ mt: 'auto', display: 'grid', gap: 1.5 }}>
				<Button
					href={SITE_URL}
					target="_blank"
					rel="noopener noreferrer"
					endIcon={<OpenInNew fontSize="small" />}
					sx={{ color: brand.sage, justifyContent: 'flex-start' }}>
					Öppna hemsidan
				</Button>
				<Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<UserAvatar user={user} />
					<Box sx={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
						<Typography sx={{ fontSize: '0.9rem' }} noWrap>
							{user?.username}
						</Typography>
						<Typography sx={{ fontSize: '0.75rem', opacity: 0.65 }}>
							{ROLES[user?.role]?.label}
						</Typography>
					</Box>
					<Tooltip title="Logga ut">
						<IconButton
							onClick={logout}
							sx={{ color: 'rgba(255,255,255,0.75)' }}
							aria-label="Logga ut">
							<Logout fontSize="small" />
						</IconButton>
					</Tooltip>
				</Box>
			</Box>
		</Box>
	);
}

function AccountMenu() {
	const { user, isAdmin, logout } = useAuth();
	const [anchor, setAnchor] = useState(null);
	const close = () => setAnchor(null);

	return (
		<>
			<IconButton
				onClick={(e) => setAnchor(e.currentTarget)}
				aria-label="Konto"
				aria-haspopup="menu"
				sx={{ p: 0.5 }}>
				<UserAvatar user={user} size={30} />
			</IconButton>
			<Menu
				anchorEl={anchor}
				open={Boolean(anchor)}
				onClose={close}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				slotProps={{ paper: { sx: { minWidth: 220, mt: 1 } } }}>
				<Box sx={{ px: 2, py: 1 }}>
					<Typography sx={{ fontWeight: 600 }} noWrap>
						{user?.username}
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{ROLES[user?.role]?.label}
					</Typography>
				</Box>
				<Divider />
				{isAdmin && (
					<MenuItem component={NavLink} to={USERS_ITEM.to} onClick={close}>
						<ListItemIcon>{USERS_ITEM.icon}</ListItemIcon>
						{USERS_ITEM.label}
					</MenuItem>
				)}
				<MenuItem
					onClick={() => {
						close();
						logout();
					}}>
					<ListItemIcon>
						<Logout />
					</ListItemIcon>
					Logga ut
				</MenuItem>
			</Menu>
		</>
	);
}

function MobileBars() {
	const { pathname } = useLocation();
	const current = NAV_ITEMS.findIndex((item) => isActive(item, pathname));

	return (
		<>
			<AppBar
				position="sticky"
				elevation={0}
				sx={{ display: { md: 'none' }, bgcolor: brand.green }}>
				<Toolbar sx={{ gap: 1 }}>
					<Box sx={{ flex: 1 }}>
						<Brand />
					</Box>
					<IconButton
						href={SITE_URL}
						target="_blank"
						rel="noopener noreferrer"
						color="inherit"
						aria-label="Öppna hemsidan">
						<OpenInNew />
					</IconButton>
					<AccountMenu />
				</Toolbar>
			</AppBar>
			<Paper
				elevation={0}
				sx={{
					display: { md: 'none' },
					position: 'fixed',
					insetInline: 0,
					bottom: 0,
					zIndex: 10,
					borderRadius: 0,
					borderTop: `1px solid ${brand.border}`,
					pb: 'env(safe-area-inset-bottom)',
				}}>
				<BottomNavigation showLabels value={current}>
					{NAV_ITEMS.map((item) => (
						<BottomNavigationAction
							key={item.to}
							label={item.label}
							icon={item.icon}
							component={NavLink}
							to={item.to}
						/>
					))}
				</BottomNavigation>
			</Paper>
		</>
	);
}

export function AppLayout() {
	return (
		<Box sx={{ minHeight: '100vh' }}>
			<Sidebar />
			<MobileBars />
			<Box
				component="main"
				sx={{
					ml: { md: `${DRAWER_WIDTH}px` },
					px: { xs: 2, sm: 3, md: 5 },
					pt: { xs: 3, md: 5 },
					pb: { xs: 'calc(96px + env(safe-area-inset-bottom))', md: 6 },
				}}>
				<Box sx={{ maxWidth: 1080, mx: 'auto' }}>
					<Outlet />
				</Box>
			</Box>
		</Box>
	);
}
