import { Avatar } from '@mui/material';
import { brand } from '../theme';
import { displayName, initial } from '../utils/user';

const TONES = {
	moss: { bgcolor: brand.moss, color: '#fff' },
	green: { bgcolor: brand.green, color: '#fff' },
	light: { bgcolor: brand.sageLight, color: brand.green },
};

// Profile picture, or the first letter of the name on a coloured circle.
// user: { name, username, avatarUrl } (or name + avatarUrl from the change log)
// Hidden from screen readers: the name is always written next to it.
export function UserAvatar({ user, size = 32, tone = 'moss', sx }) {
	const name = displayName(user);
	return (
		<Avatar
			src={user?.avatarUrl || undefined}
			alt=""
			aria-hidden
			sx={{
				width: size,
				height: size,
				fontSize: Math.round(size * 0.42),
				fontWeight: 600,
				...TONES[tone],
				...sx,
			}}>
			{initial(name)}
		</Avatar>
	);
}
