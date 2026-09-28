import { useState } from 'react';
import {
	Box,
	ButtonBase,
	Card,
	Chip,
	FormControlLabel,
	IconButton,
	LinearProgress,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Switch,
	Tooltip,
	Typography,
} from '@mui/material';
import {
	CenterFocusStrongOutlined,
	DeleteOutline,
	DragIndicator,
	MoreVert,
	Star,
	StarOutline,
	VisibilityOffOutlined,
} from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QualityChip } from './QualityChip';
import { focusPosition, heroThumb } from '../../utils/hero';
import { brand } from '../../theme';

// The top left badge: "Först" on the photo the website starts with, then its place in
// the order ("2", "3" …) unless the order is shuffled, "Dold" when it isn't shown
function PlaceBadge({ place, first, shuffle }) {
	if (place === null) {
		return (
			<Chip
				size="small"
				icon={<VisibilityOffOutlined />}
				label="Dold"
				sx={{ bgcolor: 'rgba(29,42,34,.78)', color: '#fff', '& .MuiChip-icon': { color: '#fff' } }}
			/>
		);
	}
	if (first) {
		return (
			<Chip
				size="small"
				icon={<Star />}
				label="Visas först"
				sx={{ bgcolor: brand.green, color: '#fff', '& .MuiChip-icon': { color: '#f2c14e' } }}
			/>
		);
	}
	if (shuffle) return null;
	return (
		<Box
			aria-label={`Plats ${place}`}
			sx={{
				minWidth: 26,
				height: 26,
				px: 0.75,
				borderRadius: 999,
				display: 'grid',
				placeItems: 'center',
				bgcolor: 'rgba(255,255,255,.92)',
				color: brand.green,
				fontWeight: 700,
				fontSize: '0.8rem',
				boxShadow: '0 1px 3px rgba(0,0,0,.18)',
			}}>
			{place}
		</Box>
	);
}

// One photo in the grid. Drag it (or its handle, on touch screens and with the keyboard)
// to change the order; click it to set its focus point and see how it looks.
export function HeroImageCard({
	image,
	place, // 1, 2 … among the shown photos; null when hidden
	shuffle,
	saving,
	onToggleShown,
	onOpen,
	onMakeFirst,
	onDelete,
}) {
	const [menuAnchor, setMenuAnchor] = useState(null);
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: image.id });
	const first = place === 1;
	const name = image.originalName || 'Bild';

	return (
		<Card
			ref={setNodeRef}
			style={{ transform: CSS.Translate.toString(transform), transition }}
			sx={{
				position: 'relative',
				zIndex: isDragging ? 3 : 'auto',
				boxShadow: isDragging ? '0 12px 32px rgba(6,52,36,.22)' : 'none',
				borderColor: first ? brand.green : undefined,
				outline: first ? `1px solid ${brand.green}` : 'none',
				bgcolor: 'background.paper',
			}}>
			<Box
				// Mouse: drag the whole photo. Touch and keyboard: the handle
				onPointerDown={(e) => e.pointerType === 'mouse' && listeners?.onPointerDown?.(e)}
				sx={{ position: 'relative', cursor: isDragging ? 'grabbing' : 'grab' }}>
				<ButtonBase
					onClick={() => onOpen(image)}
					aria-label={`Fokus och förhandsvisning för ${name}`}
					sx={{ display: 'block', width: '100%', cursor: 'inherit' }}>
					<Box
						component="img"
						src={heroThumb(image.url, 640)}
						alt=""
						loading="lazy"
						draggable={false}
						sx={{
							display: 'block',
							width: '100%',
							aspectRatio: '16 / 9',
							objectFit: 'cover',
							objectPosition: focusPosition(image.focus),
							bgcolor: brand.sageLight,
							filter: place === null ? 'grayscale(1)' : 'none',
							opacity: place === null ? 0.5 : 1,
							transition: 'opacity .2s ease, filter .2s ease',
						}}
					/>
				</ButtonBase>
				<Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 0.75 }}>
					<Tooltip title="Dra för att flytta">
						<IconButton
							ref={setActivatorNodeRef}
							size="small"
							{...attributes}
							// A mouse is handled by the whole photo above
							onPointerDown={(e) => e.pointerType !== 'mouse' && listeners?.onPointerDown?.(e)}
							onKeyDown={listeners?.onKeyDown}
							aria-label={`Flytta ${name}`}
							sx={{
								touchAction: 'none',
								cursor: 'inherit',
								width: 26,
								height: 26,
								bgcolor: 'rgba(255,255,255,.92)',
								color: brand.green,
								boxShadow: '0 1px 3px rgba(0,0,0,.18)',
								'&:hover': { bgcolor: '#fff' },
							}}>
							<DragIndicator sx={{ fontSize: 18 }} />
						</IconButton>
					</Tooltip>
					<PlaceBadge place={place} first={first} shuffle={shuffle} />
				</Box>
				<Box sx={{ position: 'absolute', left: 8, bottom: 8 }}>
					<QualityChip image={image} />
				</Box>
			</Box>
			{saving && <LinearProgress sx={{ height: 2 }} />}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: 1.5, pr: 0.5, py: 0.5 }}>
				<FormControlLabel
					sx={{ flex: 1, minWidth: 0, mr: 0 }}
					control={
						<Switch
							size="small"
							checked={image.shown}
							disabled={saving}
							onChange={(e) => onToggleShown(image, e.target.checked)}
						/>
					}
					label={
						<Box sx={{ minWidth: 0 }}>
							<Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
								{image.shown ? 'Visas' : 'Visas inte'}
							</Typography>
							<Typography variant="caption" color="text.secondary" noWrap component="div" title={name}>
								{name}
							</Typography>
						</Box>
					}
					slotProps={{ typography: { sx: { minWidth: 0 } } }}
				/>
				<IconButton
					aria-label={`Mer för ${name}`}
					aria-haspopup="menu"
					onClick={(e) => setMenuAnchor(e.currentTarget)}>
					<MoreVert />
				</IconButton>
				<Menu
					anchorEl={menuAnchor}
					open={Boolean(menuAnchor)}
					onClose={() => setMenuAnchor(null)}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
					transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
					<MenuItem
						onClick={() => {
							setMenuAnchor(null);
							onOpen(image);
						}}>
						<ListItemIcon>
							<CenterFocusStrongOutlined fontSize="small" />
						</ListItemIcon>
						<ListItemText>Fokus och förhandsvisning</ListItemText>
					</MenuItem>
					<MenuItem
						disabled={first}
						onClick={() => {
							setMenuAnchor(null);
							onMakeFirst(image);
						}}>
						<ListItemIcon>
							<StarOutline fontSize="small" />
						</ListItemIcon>
						<ListItemText>{first ? 'Visas redan först' : 'Visa först'}</ListItemText>
					</MenuItem>
					<MenuItem
						onClick={() => {
							setMenuAnchor(null);
							onDelete(image);
						}}
						sx={{ color: 'error.main' }}>
						<ListItemIcon sx={{ color: 'inherit' }}>
							<DeleteOutline fontSize="small" />
						</ListItemIcon>
						<ListItemText>Ta bort</ListItemText>
					</MenuItem>
				</Menu>
			</Box>
		</Card>
	);
}

// A photo on its way up: the local preview, dimmed, with the progress
export function UploadingCard({ upload }) {
	const status = upload.preparing
		? 'Förbereder bilden…'
		: upload.progress === 0
			? 'Väntar på sin tur…'
			: upload.progress < 100
				? `Laddar upp ${upload.progress} %`
				: 'Kontrollerar kvaliteten…';
	return (
		<Card sx={{ position: 'relative' }}>
			<Box
				component={upload.preview ? 'img' : 'div'}
				src={upload.preview ?? undefined}
				alt=""
				sx={{
					display: 'block',
					width: '100%',
					aspectRatio: '16 / 9',
					objectFit: 'cover',
					opacity: 0.45,
					bgcolor: brand.sageLight,
				}}
			/>
			<LinearProgress
				variant={upload.progress > 0 && upload.progress < 100 ? 'determinate' : 'indeterminate'}
				value={upload.progress}
				sx={{ height: 3 }}
			/>
			<Box sx={{ px: 1.5, py: 1.1 }}>
				<Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
					{status}
				</Typography>
				<Typography variant="caption" color="text.secondary" noWrap component="div">
					{upload.name}
				</Typography>
			</Box>
		</Card>
	);
}
