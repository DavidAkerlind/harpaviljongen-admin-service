import { Box, Card, CardActionArea, Typography } from '@mui/material';
import { AddPhotoAlternateOutlined } from '@mui/icons-material';
import { brand } from '../../theme';

// Last in the grid, the same size as a photo: click to pick photos (the page takes photos
// dropped anywhere on it). large: the empty state, when there are no photos yet.
export function HeroUploadCard({ onPick, dragging, large = false, children }) {
	return (
		<Card
			sx={{
				border: `2px dashed ${dragging ? brand.green : brand.sage}`,
				bgcolor: dragging ? brand.sageLight : 'transparent',
				transition: 'border-color .15s ease, background-color .15s ease',
				'&:hover': { borderColor: brand.green },
			}}>
			<CardActionArea
				onClick={onPick}
				sx={{
					height: '100%',
					minHeight: large ? 220 : 0,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					textAlign: 'center',
					gap: 1,
					p: large ? 4 : 2,
					aspectRatio: large ? 'auto' : undefined,
				}}>
				<Box
					sx={{
						width: large ? 64 : 48,
						height: large ? 64 : 48,
						borderRadius: '50%',
						bgcolor: brand.paper,
						color: brand.green,
						display: 'grid',
						placeItems: 'center',
						boxShadow: '0 2px 8px rgba(6,52,36,.12)',
					}}>
					<AddPhotoAlternateOutlined sx={{ fontSize: large ? 32 : 26 }} />
				</Box>
				<Typography sx={{ fontWeight: 600, fontSize: large ? '1.1rem' : '1rem' }}>
					{dragging ? 'Släpp bilderna här' : large ? 'Ladda upp dina bilder' : 'Ladda upp bilder'}
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440 }}>
					{children ?? 'Klicka eller dra hit en eller flera bilder'}
				</Typography>
			</CardActionArea>
		</Card>
	);
}
