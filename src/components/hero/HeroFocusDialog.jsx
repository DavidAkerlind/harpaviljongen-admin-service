import { useEffect, useState } from 'react';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material';
import { QualityChip } from './QualityChip';
import { focusPosition, heroThumb, qualityText } from '../../utils/hero';
import heroLogo from '../../assets/hero-logo.svg';
import { brand } from '../../theme';

const STEP = 2; // % per arrow key press

// The home page's top as the website draws it: the photo filling the screen, the dark
// filter, the hare and BOKA BORD. logo: the hare's width as a share of the screen's width.
function ScreenPreview({ image, focus, ratio, logo, label, width }) {
	return (
		<Box sx={{ width, flexShrink: 0 }}>
			<Box
				sx={{
					position: 'relative',
					aspectRatio: ratio,
					borderRadius: 1.5,
					overflow: 'hidden',
					bgcolor: '#000',
					border: '3px solid #1d2a22',
					containerType: 'inline-size',
				}}>
				<Box
					component="img"
					src={heroThumb(image.url, 1280)}
					alt=""
					sx={{
						position: 'absolute',
						inset: 0,
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						objectPosition: focusPosition(focus),
					}}
				/>
				<Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,.6)' }} />
				<Box
					sx={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						gap: `${logo / 10}cqw`,
					}}>
					<Box component="img" src={heroLogo} alt="" sx={{ width: `${logo}cqw` }} />
					<Box
						sx={{
							border: '1px solid #a7b19c',
							color: '#a7b19c',
							bgcolor: 'rgba(255,255,255,.08)',
							// In proportion to the hare, as on the website (245 px hare, 1.3rem text)
							fontSize: `${logo / 11.8}cqw`,
							px: `${logo / 14}cqw`,
							py: `${logo / 38}cqw`,
							lineHeight: 1.2,
							whiteSpace: 'nowrap',
						}}>
						BOKA BORD
					</Box>
				</Box>
			</Box>
			<Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
				{label}
			</Typography>
		</Box>
	);
}

// Click the most important part of the photo; it stays in view when a phone or a wide
// screen cuts the photo. Shows how it looks on a computer and a phone.
export function HeroFocusDialog({ image, open, onClose, onSave }) {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
	const [focus, setFocus] = useState(image?.focus ?? { x: 50, y: 50 });
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (open && image) setFocus(image.focus);
	}, [open, image]);

	if (!image) return null;
	const changed = focus.x !== image.focus.x || focus.y !== image.focus.y;
	const { verdict, size } = qualityText(image);

	const pick = (e) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const clamp = (n) => Math.min(100, Math.max(0, Math.round(n * 10) / 10));
		setFocus({
			x: clamp(((e.clientX - rect.left) / rect.width) * 100),
			y: clamp(((e.clientY - rect.top) / rect.height) * 100),
		});
	};

	const onKeyDown = (e) => {
		const move = { ArrowLeft: [-STEP, 0], ArrowRight: [STEP, 0], ArrowUp: [0, -STEP], ArrowDown: [0, STEP] }[e.key];
		if (!move) return;
		e.preventDefault();
		setFocus((f) => ({
			x: Math.min(100, Math.max(0, f.x + move[0])),
			y: Math.min(100, Math.max(0, f.y + move[1])),
		}));
	};

	const save = async () => {
		setSaving(true);
		try {
			await onSave(image, focus);
			onClose();
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth fullScreen={fullScreen}>
			<DialogTitle sx={{ fontWeight: 600, pb: 0.5 }}>
				Fokus och förhandsvisning
				<Typography variant="body2" color="text.secondary" noWrap>
					{image.originalName}
				</Typography>
			</DialogTitle>
			<DialogContent>
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: '1fr', md: '1.15fr 1fr' },
						gap: { xs: 2.5, md: 3 },
						alignItems: 'start',
						pt: 1,
					}}>
					<Box>
						<Typography variant="body2" sx={{ mb: 1 }}>
							<strong>Klicka på det viktigaste i bilden.</strong> Det hålls i bild när
							skärmen skär bort kanterna, som på mobilen.
						</Typography>
						<Box sx={{ display: 'flex', justifyContent: 'center', bgcolor: brand.sageLight, borderRadius: 2, p: 1 }}>
							<Box
								role="button"
								tabIndex={0}
								aria-label={`Fokuspunkt ${Math.round(focus.x)} % från vänster, ${Math.round(focus.y)} % uppifrån. Flytta med piltangenterna.`}
								onClick={pick}
								onKeyDown={onKeyDown}
								sx={{
									position: 'relative',
									display: 'inline-block',
									cursor: 'crosshair',
									lineHeight: 0,
									borderRadius: 1,
									'&:focus-visible': { outline: `3px solid ${brand.green}`, outlineOffset: 2 },
								}}>
								<Box
									component="img"
									src={heroThumb(image.url, 1280)}
									alt=""
									draggable={false}
									sx={{
										display: 'block',
										maxWidth: '100%',
										maxHeight: { xs: '42vh', md: '52vh' },
										borderRadius: 1,
										userSelect: 'none',
									}}
								/>
								<Box
									aria-hidden
									sx={{
										position: 'absolute',
										left: `${focus.x}%`,
										top: `${focus.y}%`,
										width: 34,
										height: 34,
										transform: 'translate(-50%, -50%)',
										borderRadius: '50%',
										border: '3px solid #fff',
										boxShadow: '0 0 0 2px rgba(6,52,36,.9), 0 2px 10px rgba(0,0,0,.5)',
										transition: 'left .15s ease, top .15s ease',
										pointerEvents: 'none',
										'&::after': {
											content: '""',
											position: 'absolute',
											left: '50%',
											top: '50%',
											width: 6,
											height: 6,
											borderRadius: '50%',
											bgcolor: '#fff',
											transform: 'translate(-50%, -50%)',
										},
									}}
								/>
							</Box>
						</Box>
					</Box>
					<Box>
						<Typography variant="overline" color="text.secondary">
							Så ser det ut på hemsidan
						</Typography>
						<Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', mt: 0.5 }}>
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<ScreenPreview image={image} focus={focus} ratio="16 / 9" logo={17} label="Dator" width="100%" />
							</Box>
							<ScreenPreview image={image} focus={focus} ratio="9 / 19.5" logo={63} label="Mobil" width={{ xs: 92, sm: 108 }} />
						</Box>
						<Box sx={{ mt: 2.5, p: 1.5, borderRadius: 2, bgcolor: brand.background }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
								<Typography variant="body2" sx={{ fontWeight: 600 }}>
									Kvalitet
								</Typography>
								<QualityChip image={image} size="medium" tooltip={false} />
							</Box>
							<Typography variant="body2" sx={{ mt: 0.75 }}>
								{verdict}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								{size}. Skarpast blir bilder som är minst 2560 px breda.
							</Typography>
						</Box>
					</Box>
				</Box>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
				<Button
					color="inherit"
					onClick={() => setFocus({ x: 50, y: 50 })}
					disabled={saving || (focus.x === 50 && focus.y === 50)}
					sx={{ mr: 'auto' }}>
					Mitten av bilden
				</Button>
				<Button color="inherit" onClick={onClose} disabled={saving}>
					{changed ? 'Avbryt' : 'Stäng'}
				</Button>
				{changed && (
					<Button variant="contained" onClick={save} disabled={saving}>
						Spara fokus
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
}
