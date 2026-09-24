import { Box, Typography } from '@mui/material';

export function PageHeader({ title, description, actions }) {
	return (
		<Box
			sx={{
				display: 'flex',
				flexWrap: 'wrap',
				alignItems: 'flex-end',
				justifyContent: 'space-between',
				gap: 2,
				mb: 3,
			}}>
			<Box sx={{ minWidth: 0 }}>
				<Typography variant="h1">{title}</Typography>
				{description && (
					<Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 640 }}>
						{description}
					</Typography>
				)}
			</Box>
			{actions && (
				<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{actions}</Box>
			)}
		</Box>
	);
}
