import { Box, Typography } from '@mui/material';
import { UserAvatar } from '../UserAvatar';
import { describeActivity } from '../../utils/activity';
import { formatDateTime } from '../../utils/format';
import { brand } from '../../theme';

// One change: "[picture] Anna laddade upp “Höstmeny” (Meny)" with a time underneath.
// time: the text to show, e.g. "för 5 min sedan" or "14:05". isMe shows "Du".
export function ActivityRow({ item, isMe, time }) {
	return (
		<Box
			component="li"
			sx={{
				display: 'flex',
				gap: 1.5,
				py: 1.25,
				'& + &': { borderTop: `1px solid ${brand.border}` },
			}}>
			<UserAvatar
				user={item.user}
				size={32}
				tone={isMe ? 'green' : 'light'}
				sx={{ mt: 0.25 }}
			/>
			<Box sx={{ minWidth: 0, flex: 1 }}>
				<Typography sx={{ wordBreak: 'break-word' }}>
					<Box component="span" sx={{ fontWeight: 600 }}>
						{isMe ? 'Du' : (item.user?.name ?? item.username)}
					</Box>{' '}
					{describeActivity(item)}
				</Typography>
				<Typography
					variant="body2"
					color="text.secondary"
					title={formatDateTime(item.createdAt)}>
					{time}
				</Typography>
			</Box>
		</Box>
	);
}
