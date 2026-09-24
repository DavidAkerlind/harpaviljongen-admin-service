import { useState } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

// TextField with a show/hide button. autoComplete: 'new-password' or 'current-password'.
export function PasswordField({ autoComplete = 'new-password', ...props }) {
	const [visible, setVisible] = useState(false);

	return (
		<TextField
			type={visible ? 'text' : 'password'}
			{...props}
			slotProps={{
				htmlInput: { autoComplete },
				input: {
					endAdornment: (
						<InputAdornment position="end">
							<IconButton
								onClick={() => setVisible((v) => !v)}
								aria-label={visible ? 'Dölj lösenord' : 'Visa lösenord'}
								edge="end"
								size="small">
								{visible ? <VisibilityOff /> : <Visibility />}
							</IconButton>
						</InputAdornment>
					),
				},
			}}
		/>
	);
}
