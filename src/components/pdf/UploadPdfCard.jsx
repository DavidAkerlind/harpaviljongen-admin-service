import { useState } from 'react';
import { Box, Card, CardActionArea, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { brand } from '../../theme';

// Sits first in the PDF grid with the same layout as a PDF card, so it lines up with them.
// Click to pick a file, or drop a PDF on it. onSelect(file | null) opens the upload dialog.
export function UploadPdfCard({ list, onSelect }) {
	const [dragging, setDragging] = useState(false);

	return (
		<Card
			onDragOver={(e) => {
				e.preventDefault();
				setDragging(true);
			}}
			onDragLeave={(e) => {
				// Moving over the card's own children also fires dragleave
				if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
			}}
			onDrop={(e) => {
				e.preventDefault();
				setDragging(false);
				onSelect(e.dataTransfer.files?.[0] ?? null);
			}}
			sx={{
				// 2px dashed instead of 1px solid, so the inner spacing is 1px smaller to keep the size
				border: `2px dashed ${dragging ? brand.green : brand.sage}`,
				bgcolor: dragging ? brand.sageLight : 'transparent',
				transition: 'border-color .15s ease, background-color .15s ease',
				'&:hover': { borderColor: brand.green },
			}}>
			<CardActionArea
				onClick={() => onSelect(null)}
				sx={{
					height: '100%',
					display: 'flex',
					flexDirection: { xs: 'row', sm: 'column' },
					alignItems: 'stretch',
					justifyContent: 'flex-start',
				}}>
				<Box
					sx={{
						p: '11px',
						pr: { xs: 0, sm: '11px' },
						pb: { sm: 0 },
						width: { xs: 95, sm: 'auto' },
						flexShrink: 0,
					}}>
					<Box
						sx={{
							aspectRatio: '1 / 1.414',
							borderRadius: 2,
							bgcolor: brand.sageLight,
							display: 'grid',
							placeItems: 'center',
						}}>
						<Box
							sx={{
								width: { xs: 40, sm: 56 },
								height: { xs: 40, sm: 56 },
								borderRadius: '50%',
								bgcolor: brand.paper,
								color: brand.green,
								display: 'grid',
								placeItems: 'center',
								boxShadow: '0 2px 8px rgba(6,52,36,.12)',
							}}>
							<Add sx={{ fontSize: { xs: 24, sm: 32 } }} />
						</Box>
					</Box>
				</Box>
				<Box
					sx={{
						p: '11px',
						flex: 1,
						minWidth: 0,
						display: 'flex',
						flexDirection: 'column',
						justifyContent: { xs: 'center', sm: 'flex-start' },
					}}>
					<Typography sx={{ fontWeight: 600, lineHeight: 1.3 }}>
						Ladda upp ny {list.label.toLowerCase()}
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
						{dragging ? 'Släpp PDF:en här' : 'Klicka eller dra hit en PDF'}
					</Typography>
				</Box>
			</CardActionArea>
		</Card>
	);
}
