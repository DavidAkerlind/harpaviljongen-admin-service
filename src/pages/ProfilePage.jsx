import { useRef, useState } from 'react';
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	TextField,
	Typography,
} from '@mui/material';
import {
	DeleteOutline,
	KeyOutlined,
	PhotoCameraOutlined,
} from '@mui/icons-material';
import { api, ROLES } from '../api';
import { useAuth } from '../auth/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { PasswordDialog } from '../components/PasswordDialog';
import { UserAvatar } from '../components/UserAvatar';
import { useNotify } from '../components/Notifications';
import { squareJpeg } from '../utils/image';
import { displayName } from '../utils/user';
import { brand } from '../theme';

// Same rules as the API
const USERNAME_PATTERN = /^[\p{L}\p{N}._-]{3,30}$/u;
const MAX_NAME = 50;

export function ProfilePage() {
	const { user, updateUser, changePassword } = useAuth();
	const notify = useNotify();

	return (
		<>
			<PageHeader
				title="Min profil"
				description="Ditt namn och din bild syns för de andra i admin, till exempel under Senaste ändringar."
			/>
			<Box sx={{ display: 'grid', gap: 2, maxWidth: 680 }}>
				<PictureCard user={user} onChange={updateUser} notify={notify} />
				<DetailsCard user={user} onChange={updateUser} notify={notify} />
				<PasswordCard changePassword={changePassword} notify={notify} />
			</Box>
		</>
	);
}

function PictureCard({ user, onChange, notify }) {
	const inputRef = useRef(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState(null);
	const hasPicture = Boolean(user?.avatarUrl);

	const pick = async (file) => {
		if (!file) return;
		setBusy(true);
		setError(null);
		try {
			const image = await squareJpeg(file);
			const { user: updated } = await api.uploadAvatar(image);
			onChange(updated);
			notify(hasPicture ? 'Profilbilden är bytt' : 'Profilbilden är sparad');
		} catch (err) {
			setError(err.message);
		} finally {
			setBusy(false);
		}
	};

	const remove = async () => {
		setBusy(true);
		setError(null);
		try {
			const { user: updated } = await api.deleteAvatar();
			onChange(updated);
			notify('Profilbilden är borttagen');
		} catch (err) {
			setError(err.message);
		} finally {
			setBusy(false);
		}
	};

	return (
		<Card>
			<CardContent
				sx={{
					p: { xs: 2, sm: 3 },
					display: 'flex',
					flexWrap: 'wrap',
					alignItems: 'center',
					gap: { xs: 2, sm: 3 },
				}}>
				<Box
					component="button"
					type="button"
					onClick={() => !busy && inputRef.current?.click()}
					aria-label={hasPicture ? 'Byt profilbild' : 'Lägg till profilbild'}
					sx={{
						position: 'relative',
						p: 0,
						border: 0,
						borderRadius: '50%',
						bgcolor: 'transparent',
						cursor: busy ? 'default' : 'pointer',
						'&:hover .camera, &:focus-visible .camera': { opacity: 1 },
						'&:focus-visible': {
							outline: `3px solid ${brand.sage}`,
							outlineOffset: 3,
						},
					}}>
					<UserAvatar user={user} size={96} tone="moss" />
					<Box
						className="camera"
						sx={{
							position: 'absolute',
							inset: 0,
							borderRadius: '50%',
							display: 'grid',
							placeItems: 'center',
							bgcolor: 'rgba(6,52,36,.55)',
							color: '#fff',
							opacity: busy ? 1 : 0,
							transition: 'opacity .15s ease',
						}}>
						{busy ? (
							<CircularProgress size={28} sx={{ color: '#fff' }} />
						) : (
							<PhotoCameraOutlined />
						)}
					</Box>
				</Box>
				<input
					ref={inputRef}
					type="file"
					accept="image/*"
					hidden
					onChange={(e) => {
						pick(e.target.files?.[0]);
						e.target.value = '';
					}}
				/>

				<Box sx={{ flex: 1, minWidth: 200 }}>
					<Typography variant="h2" sx={{ wordBreak: 'break-word' }}>
						{displayName(user)}
					</Typography>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 1,
							mt: 0.5,
							flexWrap: 'wrap',
						}}>
						{user?.name && (
							<Typography color="text.secondary">{user.username}</Typography>
						)}
						<Chip size="small" label={ROLES[user?.role]?.label} />
					</Box>
					<Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
						<Button
							variant="outlined"
							size="small"
							startIcon={<PhotoCameraOutlined />}
							disabled={busy}
							onClick={() => inputRef.current?.click()}>
							{hasPicture ? 'Byt bild' : 'Lägg till bild'}
						</Button>
						{hasPicture && (
							<Button
								size="small"
								color="inherit"
								startIcon={<DeleteOutline />}
								disabled={busy}
								onClick={remove}>
								Ta bort bild
							</Button>
						)}
					</Box>
				</Box>
				{error && (
					<Alert severity="error" sx={{ width: '100%' }}>
						{error}
					</Alert>
				)}
			</CardContent>
		</Card>
	);
}

function DetailsCard({ user, onChange, notify }) {
	const [name, setName] = useState(user?.name ?? '');
	const [username, setUsername] = useState(user?.username ?? '');
	const [touched, setTouched] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);

	const trimmedName = name.trim();
	const trimmedUsername = username.trim();
	const nameChanged = trimmedName !== (user?.name ?? '');
	const usernameChanged = trimmedUsername !== user?.username;
	const usernameProblem =
		usernameChanged && !USERNAME_PATTERN.test(trimmedUsername)
			? '3–30 tecken: bokstäver, siffror, punkt, - eller _'
			: null;

	const save = async (e) => {
		e.preventDefault();
		setTouched(true);
		if (usernameProblem || (!nameChanged && !usernameChanged)) return;
		setSaving(true);
		setError(null);
		try {
			// Only send what changed
			const { user: updated } = await api.updateMe({
				...(nameChanged && { name: trimmedName || null }),
				...(usernameChanged && { username: trimmedUsername }),
			});
			onChange(updated);
			setName(updated.name ?? '');
			setUsername(updated.username);
			setTouched(false);
			notify(
				usernameChanged
					? `Sparat. Logga in som ${updated.username} nästa gång.`
					: 'Sparat'
			);
		} catch (err) {
			setError(err.message);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Card component="form" onSubmit={save} noValidate>
			<CardContent sx={{ p: { xs: 2, sm: 3 }, display: 'grid', gap: 2.5 }}>
				<Typography variant="h3">Namn och användarnamn</Typography>
				<TextField
					label="Namn"
					value={name}
					onChange={(e) => setName(e.target.value)}
					helperText="Visas i admin, t.ex. “Anna Svensson”. Lämna tomt för att visa användarnamnet."
					disabled={saving}
					slotProps={{ htmlInput: { maxLength: MAX_NAME } }}
				/>
				<TextField
					label="Användarnamn"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					error={touched && Boolean(usernameProblem)}
					helperText={
						touched && usernameProblem
							? usernameProblem
							: 'Det du loggar in med. Stora och små bokstäver spelar ingen roll.'
					}
					disabled={saving}
					slotProps={{
						htmlInput: {
							maxLength: 30,
							autoCapitalize: 'none',
							autoComplete: 'username',
							spellCheck: false,
						},
					}}
				/>
				{error && <Alert severity="error">{error}</Alert>}
				<Box>
					<Button
						type="submit"
						variant="contained"
						disabled={saving || (!nameChanged && !usernameChanged)}>
						Spara
					</Button>
				</Box>
			</CardContent>
		</Card>
	);
}

function PasswordCard({ changePassword, notify }) {
	const [open, setOpen] = useState(false);

	return (
		<Card>
			<CardContent
				sx={{
					p: { xs: 2, sm: 3 },
					display: 'flex',
					flexWrap: 'wrap',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 2,
				}}>
				<Box>
					<Typography variant="h3">Lösenord</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
						När du byter loggas du ut på dina andra enheter.
					</Typography>
				</Box>
				<Button
					variant="outlined"
					startIcon={<KeyOutlined />}
					onClick={() => setOpen(true)}>
					Byt lösenord
				</Button>
			</CardContent>
			<PasswordDialog
				open={open}
				askCurrent
				title="Byt lösenord"
				description="Du loggas ut på dina andra enheter, men inte här."
				submitText="Byt lösenord"
				onSubmit={async ({ current, password }) => {
					await changePassword(current, password);
					setOpen(false);
					notify('Lösenordet är bytt');
				}}
				onClose={() => setOpen(false)}
			/>
		</Card>
	);
}
