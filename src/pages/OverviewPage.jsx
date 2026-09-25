import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import {
	Add,
	Check,
	DashboardCustomizeOutlined,
	Refresh,
} from '@mui/icons-material';
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	SortableContext,
	arrayMove,
	rectSortingStrategy,
	sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { api } from '../api';
import { useAuth } from '../auth/AuthContext';
import { useNotify } from '../components/Notifications';
import { PageHeader } from '../components/PageHeader';
import { AddWidgetCard, WidgetCard } from '../components/dashboard/WidgetCard';
import { AddWidgetDialog } from '../components/dashboard/AddWidgetDialog';
import {
	DASHBOARD_GRID,
	DEFAULT_LAYOUT,
	WIDGETS,
	layoutFor,
} from '../components/dashboard/registry';
import { firstName } from '../utils/user';

const SAVE_DELAY = 600;

// Screen reader texts while moving a widget with the keyboard
const title = (id) => WIDGETS[id]?.title ?? id;
const dndAccessibility = {
	screenReaderInstructions: {
		draggable:
			'Tryck mellanslag för att lyfta widgeten, flytta den med piltangenterna och tryck mellanslag igen för att släppa den. Escape avbryter.',
	},
	announcements: {
		onDragStart: ({ active }) => `Lyfte ${title(active.id)}.`,
		onDragOver: ({ active, over }) =>
			over ? `${title(active.id)} är vid ${title(over.id)}.` : undefined,
		onDragEnd: ({ active, over }) =>
			over ? `Släppte ${title(active.id)} vid ${title(over.id)}.` : `Släppte ${title(active.id)}.`,
		onDragCancel: ({ active }) => `Flytten av ${title(active.id)} avbröts.`,
	},
};

// Översikt: the widgets each person has chosen, saved on their account.
// "Anpassa" lets them add, remove, resize and drag the widgets around.
export function OverviewPage() {
	const { user, updateUser } = useAuth();
	const notify = useNotify();
	const [layout, setLayout] = useState(() => layoutFor(user?.dashboard));
	const [editing, setEditing] = useState(false);
	const [adding, setAdding] = useState(false);
	const [reloadKey, setReloadKey] = useState(0);
	const pending = useRef(null); // { timer, widgets } waiting to be saved

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	const save = useCallback(
		async (widgets) => {
			try {
				const { user: saved } = await api.saveDashboard(widgets);
				updateUser(saved);
			} catch (err) {
				notify(`Kunde inte spara översikten. ${err.message}`, 'error');
			}
		},
		[notify, updateUser]
	);

	const flush = useCallback(() => {
		if (!pending.current) return;
		clearTimeout(pending.current.timer);
		save(pending.current.widgets);
		pending.current = null;
	}, [save]);

	// Saved shortly after the last change, so dragging around doesn't send a request per move
	const change = (next) => {
		setLayout(next);
		clearTimeout(pending.current?.timer);
		pending.current = { widgets: next, timer: setTimeout(flush, SAVE_DELAY) };
	};

	// Don't lose a change when leaving the page right after it
	useEffect(() => flush, [flush]);

	const reset = async () => {
		clearTimeout(pending.current?.timer);
		pending.current = null;
		setLayout(DEFAULT_LAYOUT);
		await save(null);
		notify('Översikten är återställd');
	};

	const ids = layout.map((w) => w.id);
	const canAdd = ids.length < Object.keys(WIDGETS).length;

	return (
		<>
			<PageHeader
				title={`Hej${user ? `, ${firstName(user)}` : ''}!`}
				description={
					editing
						? 'Dra i widgetarna för att flytta dem, ändra storlek eller ta bort. Allt sparas direkt.'
						: 'Här är läget på hemsidan just nu.'
				}
				actions={
					editing ? (
						<>
							<Button
								variant="outlined"
								startIcon={<Add />}
								onClick={() => setAdding(true)}
								disabled={!canAdd}>
								Lägg till
							</Button>
							<Button color="inherit" onClick={reset}>
								Återställ
							</Button>
							<Button
								variant="contained"
								startIcon={<Check />}
								onClick={() => {
									flush();
									setEditing(false);
								}}>
								Klar
							</Button>
						</>
					) : (
						<>
							<Tooltip title="Uppdatera">
								<IconButton onClick={() => setReloadKey((k) => k + 1)} aria-label="Uppdatera">
									<Refresh />
								</IconButton>
							</Tooltip>
							<Button
								variant="outlined"
								startIcon={<DashboardCustomizeOutlined />}
								onClick={() => setEditing(true)}>
								Anpassa
							</Button>
						</>
					)
				}
			/>

			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				accessibility={dndAccessibility}
				onDragEnd={({ active, over }) => {
					if (over && active.id !== over.id) {
						change(arrayMove(layout, ids.indexOf(active.id), ids.indexOf(over.id)));
					}
				}}>
				<SortableContext items={ids} strategy={rectSortingStrategy}>
					<Box sx={DASHBOARD_GRID}>
						{layout.map((widget) => (
							<WidgetCard
								key={widget.id}
								widget={widget}
								editing={editing}
								reloadKey={reloadKey}
								onResize={(id, size) =>
									change(layout.map((w) => (w.id === id ? { ...w, size } : w)))
								}
								onRemove={(id) => change(layout.filter((w) => w.id !== id))}
							/>
						))}
						{editing && canAdd && <AddWidgetCard onClick={() => setAdding(true)} />}
					</Box>
				</SortableContext>
			</DndContext>

			{layout.length === 0 && !editing && (
				<Box sx={{ textAlign: 'center', py: 6 }}>
					<Typography color="text.secondary" sx={{ mb: 2 }}>
						Din översikt är tom.
					</Typography>
					<Button
						variant="contained"
						startIcon={<Add />}
						onClick={() => {
							setEditing(true);
							setAdding(true);
						}}>
						Lägg till widget
					</Button>
				</Box>
			)}

			<AddWidgetDialog
				open={adding}
				used={ids}
				onClose={() => setAdding(false)}
				onAdd={(id) => {
					setAdding(false);
					change([...layout, { id, size: 'medium' }]);
				}}
			/>
		</>
	);
}
