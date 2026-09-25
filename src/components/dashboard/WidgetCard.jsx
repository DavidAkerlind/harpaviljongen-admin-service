import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
	Box,
	Button,
	Card,
	CardActionArea,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Tooltip,
	Typography,
} from '@mui/material';
import {
	Add,
	ArrowForward,
	Check,
	Close,
	DragIndicator,
	PhotoSizeSelectLargeOutlined,
} from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SIZES, WIDGETS, WIDGET_HEIGHT, WIDGET_SPAN } from './registry';
import { brand } from '../../theme';

export function WidgetCard({ widget, editing, reloadKey, onResize, onRemove }) {
	const def = WIDGETS[widget.id];
	const [sizeAnchor, setSizeAnchor] = useState(null);
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: widget.id, disabled: !editing });
	const { Component } = def;

	return (
		<Card
			ref={setNodeRef}
			style={{ transform: CSS.Translate.toString(transform), transition }}
			sx={{
				gridColumn: WIDGET_SPAN[widget.size],
				height: WIDGET_HEIGHT,
				minHeight: { xs: 0, md: 260 },
				display: 'flex',
				flexDirection: 'column',
				position: 'relative',
				zIndex: isDragging ? 3 : 'auto',
				boxShadow: isDragging ? '0 12px 32px rgba(6,52,36,.18)' : 'none',
				...(editing && { borderStyle: 'dashed', borderColor: brand.sage }),
			}}>
			<Box
				// Mouse users can drag the whole title bar; touch and keyboard use the handle
				onPointerDown={editing ? listeners?.onPointerDown : undefined}
				sx={{
					display: 'flex',
					alignItems: 'center',
					gap: 0.5,
					px: 2.5,
					pt: editing ? 1 : 2,
					pb: editing ? 0.5 : 1,
					pl: editing ? 1 : 2.5,
					pr: editing ? 1 : 2.5,
					cursor: editing ? (isDragging ? 'grabbing' : 'grab') : 'default',
				}}>
				{editing && (
					<Tooltip title="Dra för att flytta">
						<IconButton
							ref={setActivatorNodeRef}
							size="small"
							{...attributes}
							onKeyDown={listeners?.onKeyDown}
							aria-label={`Flytta ${def.title}`}
							sx={{ touchAction: 'none', cursor: 'inherit', color: 'text.secondary' }}>
							<DragIndicator fontSize="small" />
						</IconButton>
					</Tooltip>
				)}
				<Typography variant="overline" color="text.secondary" noWrap sx={{ flex: 1, lineHeight: 2 }}>
					{def.title}
				</Typography>
				{editing && (
					<>
						<Tooltip title="Storlek">
							<IconButton
								size="small"
								aria-label={`Storlek på ${def.title}`}
								aria-haspopup="menu"
								onClick={(e) => setSizeAnchor(e.currentTarget)}
								sx={{ color: 'text.secondary' }}>
								<PhotoSizeSelectLargeOutlined fontSize="small" />
							</IconButton>
						</Tooltip>
						<Tooltip title="Ta bort">
							<IconButton
								size="small"
								aria-label={`Ta bort ${def.title}`}
								onClick={() => onRemove(widget.id)}
								sx={{ color: 'text.secondary' }}>
								<Close fontSize="small" />
							</IconButton>
						</Tooltip>
						<Menu
							anchorEl={sizeAnchor}
							open={Boolean(sizeAnchor)}
							onClose={() => setSizeAnchor(null)}
							anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
							transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
							{SIZES.map((size) => (
								<MenuItem
									key={size.value}
									selected={widget.size === size.value}
									onClick={() => {
										setSizeAnchor(null);
										onResize(widget.id, size.value);
									}}>
									<ListItemIcon>
										{widget.size === size.value && <Check fontSize="small" />}
									</ListItemIcon>
									<ListItemText primary={size.label} secondary={size.description} />
								</MenuItem>
							))}
						</Menu>
					</>
				)}
			</Box>

			<Box
				// While arranging, the content can't be clicked
				inert={editing || undefined}
				sx={{
					flex: 1,
					minHeight: 0,
					overflow: 'auto',
					display: 'flex',
					flexDirection: 'column',
					px: 2.5,
					pb: def.link ? 0.5 : 2.5,
					opacity: editing ? 0.7 : 1,
				}}>
				<Component size={widget.size} reloadKey={reloadKey} />
			</Box>

			{def.link && (
				<Box sx={{ px: 2.5, pb: 1.25, pt: 0.5 }}>
					<Button
						component={RouterLink}
						to={def.link.to}
						endIcon={<ArrowForward />}
						disabled={editing}
						sx={{ px: 0 }}>
						{def.link.label}
					</Button>
				</Box>
			)}
		</Card>
	);
}

// Last in the grid while arranging: the same size as a small widget, click to add one
export function AddWidgetCard({ onClick }) {
	return (
		<Card
			sx={{
				gridColumn: WIDGET_SPAN.small,
				height: WIDGET_HEIGHT,
				minHeight: { xs: 120, md: 260 },
				border: `2px dashed ${brand.sage}`,
				bgcolor: 'transparent',
				'&:hover': { borderColor: brand.green },
			}}>
			<CardActionArea
				onClick={onClick}
				sx={{ height: '100%', display: 'grid', placeItems: 'center', p: 2 }}>
				<Box sx={{ textAlign: 'center' }}>
					<Box
						sx={{
							width: 48,
							height: 48,
							mx: 'auto',
							mb: 1,
							borderRadius: '50%',
							bgcolor: brand.paper,
							color: brand.green,
							display: 'grid',
							placeItems: 'center',
							boxShadow: '0 2px 8px rgba(6,52,36,.12)',
						}}>
						<Add />
					</Box>
					<Typography sx={{ fontWeight: 600 }}>Lägg till widget</Typography>
				</Box>
			</CardActionArea>
		</Card>
	);
}
