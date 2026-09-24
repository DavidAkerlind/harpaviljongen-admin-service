import { useCallback, useEffect, useState } from 'react';
import {
	Alert,
	Avatar,
	Box,
	Button,
	Card,
	Chip,
	Divider,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Skeleton,
	Typography,
} from '@mui/material';
import {
	AdminPanelSettingsOutlined,
	DeleteOutline,
	KeyOutlined,
	MoreVert,
	PersonAddAlt1Outlined,
	PersonOutline,
} from '@mui/icons-material';
import { api, ROLES } from '../api';
import { useAuth } from '../auth/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useNotify } from '../components/Notifications';
import { CreateUserDialog } from '../components/users/CreateUserDialog';
import { PasswordDialog } from '../components/PasswordDialog';
import { formatDate } from '../utils/format';
import { brand } from '../theme';

export function UsersPage() {
	const notify = useNotify();
	const { user: me } = useAuth();
	const [users, setUsers] = useState(null);
	const [error, setError] = useState(null);
	const [createOpen, setCreateOpen] = useState(false);
	const [menu, setMenu] = useState(null); // { anchor, user }
	const [confirm, setConfirm] = useState(null); // { kind: 'role' | 'delete', user }
	const [passwordFor, setPasswordFor] = useState(null); // user getting a new password
	const [busy, setBusy] = useState(false);

	const load = useCallback(async () => {
		setError(null);
		try {
			setUsers(await api.getUsers());
		} catch (err) {
			setError(err.message);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const openConfirm = (kind) => {
		setConfirm({ kind, user: menu.user });
		setMenu(null);
	};

	const confirmAction = async () => {
		const { kind, user } = confirm;
		const newRole = user.role === 'admin' ? 'employee' : 'admin';
		setBusy(true);
		try {
			if (kind === 'delete') {
				await api.deleteUser(user.userId);
				notify(`${user.username} är borttagen`);
			} else {
				await api.updateUserRole(user.userId, newRole);
				notify(`${user.username} är nu ${ROLES[newRole].label.toLowerCase()}`);
			}
			setConfirm(null);
			await load();
		} catch (err) {
			notify(err.message, 'error');
		} finally {
			setBusy(false);
		}
	};

	const target = confirm?.user;
	const makesAdmin = target?.role === 'employee';

	return (
		<>
			<PageHeader
				title="Användare"
				description="Vilka som kan logga in i admin. Personal kan ändra menyer, öppettider och sidor. Admin kan dessutom lägga till och ta bort användare."
				actions={
					<Button
						variant="contained"
						startIcon={<PersonAddAlt1Outlined />}
						onClick={() => setCreateOpen(true)}>
						Ny användare
					</Button>
				}
			/>

			{error ? (
				<Alert
					severity="error"
					action={
						<Button color="inherit" size="small" onClick={load}>
							Försök igen
						</Button>
					}>
					Kunde inte hämta användarna. {error}
				</Alert>
			) : (
				<Card>
					{users === null
						? [1, 2, 3].map((i) => (
								<Box key={i} sx={{ p: 2, display: 'flex', gap: 2 }}>
									<Skeleton variant="circular" width={40} height={40} />
									<Skeleton variant="text" sx={{ flex: 1 }} />
								</Box>
							))
						: users.map((user, index) => {
								const isMe = user.userId === me?.userId;
								return (
									<Box key={user.userId}>
										{index > 0 && <Divider />}
										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
												gap: 2,
												px: { xs: 2, sm: 2.5 },
												py: 1.75,
											}}>
											<Avatar
												sx={{
													bgcolor:
														user.role === 'admin'
															? brand.green
															: brand.sageLight,
													color: user.role === 'admin' ? '#fff' : brand.green,
													fontWeight: 600,
												}}>
												{user.username[0]?.toUpperCase()}
											</Avatar>
											<Box sx={{ flex: 1, minWidth: 0 }}>
												<Box
													sx={{
														display: 'flex',
														alignItems: 'center',
														gap: 1,
													}}>
													<Typography sx={{ fontWeight: 600 }} noWrap>
														{user.username}
													</Typography>
													{isMe && (
														<Chip
															label="Du"
															size="small"
															variant="outlined"
															sx={{ height: 20, fontSize: '0.7rem' }}
														/>
													)}
												</Box>
												<Box
													sx={{
														display: 'flex',
														alignItems: 'center',
														gap: 1,
														mt: 0.25,
													}}>
													{/* On phones the role sits under the name, so the name gets the width */}
													<RoleChip
														role={user.role}
														sx={{ display: { sm: 'none' } }}
													/>
													{user.createdAt && (
														<Typography
															variant="body2"
															color="text.secondary"
															noWrap>
															Tillagd {formatDate(user.createdAt)}
														</Typography>
													)}
												</Box>
											</Box>
											<RoleChip
												role={user.role}
												sx={{ display: { xs: 'none', sm: 'flex' } }}
											/>
											{/* Your own role and account can't be changed here */}
											<IconButton
												aria-label={`Ändra ${user.username}`}
												disabled={isMe}
												onClick={(e) =>
													setMenu({ anchor: e.currentTarget, user })
												}
												sx={{ visibility: isMe ? 'hidden' : 'visible' }}>
												<MoreVert />
											</IconButton>
										</Box>
									</Box>
								);
							})}
				</Card>
			)}

			<Menu
				anchorEl={menu?.anchor}
				open={Boolean(menu)}
				onClose={() => setMenu(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
				<MenuItem onClick={() => openConfirm('role')}>
					<ListItemIcon>
						{menu?.user.role === 'admin' ? (
							<PersonOutline />
						) : (
							<AdminPanelSettingsOutlined />
						)}
					</ListItemIcon>
					{menu?.user.role === 'admin' ? 'Gör till personal' : 'Gör till admin'}
				</MenuItem>
				<MenuItem
					onClick={() => {
						setPasswordFor(menu.user);
						setMenu(null);
					}}>
					<ListItemIcon>
						<KeyOutlined />
					</ListItemIcon>
					Nytt lösenord
				</MenuItem>
				<MenuItem
					onClick={() => openConfirm('delete')}
					disabled={menu?.user.role !== 'employee'}
					sx={{ color: 'error.main' }}>
					<ListItemIcon sx={{ color: 'inherit' }}>
						<DeleteOutline />
					</ListItemIcon>
					<ListItemText
						primary="Ta bort"
						secondary={
							menu?.user.role === 'employee'
								? undefined
								: 'Gör till personal först'
						}
					/>
				</MenuItem>
			</Menu>

			<PasswordDialog
				open={Boolean(passwordFor)}
				title={`Nytt lösenord för ${passwordFor?.username ?? ''}`}
				description={`${passwordFor?.username ?? ''} loggas ut överallt och loggar sedan in med det nya lösenordet. Ge det till dem på ett säkert sätt.`}
				submitText="Spara lösenord"
				onSubmit={async ({ password }) => {
					await api.resetUserPassword(passwordFor.userId, password);
					notify(`${passwordFor.username} har fått ett nytt lösenord`);
					setPasswordFor(null);
				}}
				onClose={() => setPasswordFor(null)}
			/>

			<CreateUserDialog
				open={createOpen}
				onClose={() => setCreateOpen(false)}
				onCreated={(user) => {
					setCreateOpen(false);
					notify(
						`${user.username} är tillagd som ${ROLES[user.role].label.toLowerCase()}`
					);
					load();
				}}
			/>

			<ConfirmDialog
				open={Boolean(confirm)}
				busy={busy}
				danger={confirm?.kind === 'delete'}
				title={
					confirm?.kind === 'delete'
						? `Ta bort ${target?.username}?`
						: makesAdmin
							? `Gör ${target?.username} till admin?`
							: `Gör ${target?.username} till personal?`
				}
				confirmText={
					confirm?.kind === 'delete'
						? 'Ta bort'
						: makesAdmin
							? 'Gör till admin'
							: 'Gör till personal'
				}
				onConfirm={confirmAction}
				onClose={() => setConfirm(null)}>
				{confirm?.kind === 'delete' && (
					<>
						{target.username} kan inte logga in längre, inte ens om de är
						inloggade just nu. Det går inte att ångra.
					</>
				)}
				{confirm?.kind === 'role' && makesAdmin && (
					<>
						{target.username} kan då också lägga till, ändra och ta bort
						användare.
					</>
				)}
				{confirm?.kind === 'role' && !makesAdmin && (
					<>
						{target.username} kan fortfarande ändra menyer, öppettider och
						sidor, men inte hantera användare.
					</>
				)}
			</ConfirmDialog>
		</>
	);
}

function RoleChip({ role, sx }) {
	const isAdmin = role === 'admin';
	return (
		<Chip
			icon={isAdmin ? <AdminPanelSettingsOutlined /> : <PersonOutline />}
			label={ROLES[role]?.label ?? role}
			size="small"
			color={isAdmin ? 'primary' : 'default'}
			variant={isAdmin ? 'filled' : 'outlined'}
			sx={sx}
		/>
	);
}
