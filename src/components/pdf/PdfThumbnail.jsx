import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { PictureAsPdfOutlined } from '@mui/icons-material';
import { pdfThumbnailUrl } from '../../utils/format';
import { brand } from '../../theme';

// First page of the PDF when Cloudinary can render it, otherwise a neutral PDF card.
// compact: icon only, for small sizes where the title wouldn't fit.
export function PdfThumbnail({ url, title, onClick, compact = false, sx }) {
	const [failed, setFailed] = useState(false);
	const thumb = pdfThumbnailUrl(url);

	return (
		<Box
			onClick={onClick}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
			onKeyDown={(e) =>
				onClick && (e.key === 'Enter' || e.key === ' ') && onClick()
			}
			aria-label={onClick ? `Förhandsgranska ${title}` : undefined}
			sx={{
				position: 'relative',
				aspectRatio: '1 / 1.414',
				borderRadius: 2,
				overflow: 'hidden',
				bgcolor: brand.sageLight,
				border: `1px solid ${brand.border}`,
				cursor: onClick ? 'pointer' : 'default',
				transition: 'transform .15s ease, box-shadow .15s ease',
				'&:hover': onClick
					? {
							transform: 'translateY(-2px)',
							boxShadow: '0 6px 18px rgba(6,52,36,.12)',
						}
					: undefined,
				...sx,
			}}>
			{thumb && !failed ? (
				<Box
					component="img"
					src={thumb}
					alt=""
					loading="lazy"
					onError={() => setFailed(true)}
					sx={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						objectPosition: 'top',
					}}
				/>
			) : (
				<Box
					sx={{
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 1,
						p: 1.5,
						color: brand.moss,
						textAlign: 'center',
					}}>
					<PictureAsPdfOutlined sx={{ fontSize: compact ? 30 : 40 }} />
					{!compact && (
						<Typography
							variant="caption"
							sx={{
								fontWeight: 600,
								display: '-webkit-box',
								WebkitLineClamp: 3,
								WebkitBoxOrient: 'vertical',
								overflow: 'hidden',
							}}>
							{title}
						</Typography>
					)}
				</Box>
			)}
		</Box>
	);
}
