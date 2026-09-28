import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, Button, Skeleton, Typography } from '@mui/material';
import { DragIndicator, FileUploadOutlined, OpenInNew } from '@mui/icons-material';
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
import { SITE_URL } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useNotify } from '../components/Notifications';
import { HeroSettingsCard } from '../components/hero/HeroSettingsCard';
import { HeroImageCard, UploadingCard } from '../components/hero/HeroImageCard';
import { HeroUploadCard } from '../components/hero/HeroUploadCard';
import { HeroFocusDialog } from '../components/hero/HeroFocusDialog';
import { prepareHeroUpload } from '../utils/hero';

const GRID = {
	display: 'grid',
	gridTemplateColumns: {
		xs: '1fr',
		sm: 'repeat(2, minmax(0, 1fr))',
		lg: 'repeat(3, minmax(0, 1fr))',
		xl: 'repeat(4, minmax(0, 1fr))',
	},
	gap: 2,
};

const quoted = (image) => `“${image.originalName || 'Bilden'}”`;
const photos = (n) => `${n} ${n === 1 ? 'bild' : 'bilder'}`;
const hasFiles = (e) => [...(e.dataTransfer?.types ?? [])].includes('Files');

export function HeroPage() {
	const notify = useNotify();
	const [data, setData] = useState(null); // { settings, images }
	const [error, setError] = useState(null);
	const [uploads, setUploads] = useState([]); // [{ key, name, preview, progress }]
	const [saving, setSaving] = useState(() => new Set()); // image ids
	const [focusImage, setFocusImage] = useState(null);
	const [deleting, setDeleting] = useState(null);
	const [deleteBusy, setDeleteBusy] = useState(false);
	const [dragging, setDragging] = useState(false);
	const fileInput = useRef(null);
	const dragEndedAt = useRef(0);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	const load = useCallback(async () => {
		setError(null);
		try {
			setData(await api.getHero());
		} catch (err) {
			setError(err.message);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const images = useMemo(() => data?.images ?? [], [data]);
	const shown = images.filter((image) => image.shown);
	const placeOf = (image) => (image.shown ? shown.indexOf(image) + 1 : null);
	const nameOf = (id) => {
		const image = images.find((i) => i.id === id);
		return image ? quoted(image) : 'bilden';
	};

	const setImages = (update) =>
		setData((prev) => ({ ...prev, images: update(prev.images) }));
	const replaceImage = (image) =>
		setImages((list) => list.map((i) => (i.id === image.id ? image : i)));
	const markSaving = (id, on) =>
		setSaving((prev) => {
			const next = new Set(prev);
			if (on) next.add(id);
			else next.delete(id);
			return next;
		});

	// ---- Upload: one photo at a time, each shown with its progress until it's done
	const uploadFiles = async (fileList) => {
		const isImage = (f) =>
			f.type.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name);
		const all = [...(fileList ?? [])];
		const files = all.filter(isImage);
		const skipped = all.filter((f) => !isImage(f));
		if (!files.length) {
			if (all.length) notify('Välj bilder (JPG, PNG eller WebP).', 'error');
			return;
		}
		const queue = files.map((file, i) => ({
			key: `${Date.now()}-${i}`,
			file,
			name: file.name,
			preview: null,
			progress: 0,
		}));
		setUploads((prev) => [...prev, ...queue]);
		const update = (key, fields) =>
			setUploads((prev) => prev.map((u) => (u.key === key ? { ...u, ...fields } : u)));

		const done = [];
		const failed = skipped.map((f) => ({ name: f.name, message: 'Det är ingen bild.' }));
		for (const item of queue) {
			let preview = null;
			try {
				update(item.key, { preparing: true });
				const prepared = await prepareHeroUpload(item.file);
				preview = prepared.preview;
				update(item.key, { preview, preparing: false, progress: 1 });
				const image = await api.uploadHeroImage(prepared.file, (progress) =>
					update(item.key, { progress: Math.max(1, progress) })
				);
				setImages((list) => [...list, image]);
				done.push(image);
			} catch (err) {
				failed.push({ name: item.name, message: err.message });
			} finally {
				setUploads((prev) => prev.filter((u) => u.key !== item.key));
				if (preview) URL.revokeObjectURL(preview);
			}
		}

		// One message: what was uploaded (and if any is blurry), then what couldn't be
		const poor = done.filter((image) => image.quality.rating === 'poor');
		const lines = [];
		if (done.length === 1) {
			lines.push(
				poor.length
					? `${quoted(done[0])} är uppladdad men har låg kvalitet (${done[0].quality.score}/10) och kan bli suddig.`
					: `${quoted(done[0])} är uppladdad och visas på hemsidan.`
			);
		} else if (done.length) {
			lines.push(
				`${photos(done.length)} uppladdade och visas på hemsidan.` +
					(poor.length ? ` ${poor.length} av dem har låg kvalitet och kan bli suddiga.` : '')
			);
		}
		if (failed.length === 1) {
			const [{ name, message }] = failed;
			lines.push(`Kunde inte ladda upp ${name}. ${message.replace(`${name}: `, '')}`);
		} else if (failed.length) {
			lines.push(`${failed.length} filer kunde inte laddas upp. ${failed[0].message}`);
		}
		const severity =
			failed.length && !done.length ? 'error' : failed.length || poor.length ? 'warning' : 'success';
		const text = lines.join(' ');
		notify(severity === 'success' ? text.replace(/\.$/, '') : text, severity);
	};

	const pickFiles = () => fileInput.current?.click();

	// ---- Changes, saved right away. The page changes first and goes back if saving fails.
	const toggleShown = async (image, value) => {
		replaceImage({ ...image, shown: value });
		markSaving(image.id, true);
		try {
			replaceImage(await api.updateHeroImage(image.id, { shown: value }));
			notify(value ? `${quoted(image)} visas på hemsidan` : `${quoted(image)} visas inte längre`);
		} catch (err) {
			replaceImage(image);
			notify(err.message, 'error');
		} finally {
			markSaving(image.id, false);
		}
	};

	const saveOrder = async (next, previous, message) => {
		setImages(() => next);
		try {
			const saved = await api.reorderHero(next.map((i) => i.id));
			setData((prev) => ({ ...prev, images: saved }));
			notify(message(saved));
		} catch (err) {
			setData((prev) => ({ ...prev, images: previous }));
			notify(err.message, 'error');
		}
	};

	const firstChangedMessage = (before) => (saved) => {
		const first = saved.find((i) => i.shown);
		return first && first.id !== before?.id
			? `${quoted(first)} visas nu först`
			: 'Ordningen är sparad';
	};

	const onDragEnd = ({ active, over }) => {
		dragEndedAt.current = Date.now();
		if (!over || active.id === over.id) return;
		const ids = images.map((i) => i.id);
		const next = arrayMove(images, ids.indexOf(active.id), ids.indexOf(over.id));
		saveOrder(next, images, firstChangedMessage(shown[0]));
	};

	const makeFirst = async (image) => {
		const before = shown[0];
		if (!image.shown) await toggleShown(image, true);
		const rest = images.filter((i) => i.id !== image.id);
		saveOrder([{ ...image, shown: true }, ...rest], images, firstChangedMessage(before));
	};

	// A click that ends a drag is not a click on the photo
	const openFocus = (image) => {
		if (Date.now() - dragEndedAt.current > 250) setFocusImage(image);
	};

	const saveFocus = async (image, focus) => {
		try {
			replaceImage(await api.updateHeroImage(image.id, { focus }));
			notify('Fokus sparat');
		} catch (err) {
			notify(err.message, 'error');
			throw err;
		}
	};

	const confirmDelete = async () => {
		setDeleteBusy(true);
		try {
			await api.deleteHeroImage(deleting.id);
			setImages((list) => list.filter((i) => i.id !== deleting.id));
			notify(`${quoted(deleting)} är borttagen`);
			setDeleting(null);
		} catch (err) {
			notify(err.message, 'error');
		} finally {
			setDeleteBusy(false);
		}
	};

	// Several changes can be on their way at once (the slider with the keyboard); only the
	// answer to the latest one is used
	const settingsRequest = useRef(0);
	const changeSettings = async (change) => {
		const previous = data.settings;
		const request = ++settingsRequest.current;
		setData((prev) => ({ ...prev, settings: { ...prev.settings, ...change } }));
		try {
			const settings = await api.updateHeroSettings(change);
			if (request !== settingsRequest.current) return;
			setData((prev) => ({ ...prev, settings }));
			if ('slideshow' in change) {
				notify(change.slideshow ? 'Bildspelet är på' : 'Bildspelet är av. En bild visas.');
			} else if ('intervalSeconds' in change) {
				notify(`Varje bild visas i ${change.intervalSeconds} sekunder`);
			} else if ('shuffle' in change) {
				notify(change.shuffle ? 'Bilderna visas i slumpad ordning' : 'Bilderna visas i din ordning');
			}
		} catch (err) {
			if (request === settingsRequest.current) {
				setData((prev) => ({ ...prev, settings: previous }));
			}
			notify(err.message, 'error');
		}
	};

	// Photos can be dropped anywhere on the page
	const dropProps = {
		onDragOver: (e) => {
			if (!hasFiles(e)) return;
			e.preventDefault();
			setDragging(true);
		},
		onDragLeave: (e) => {
			if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false);
		},
		onDrop: (e) => {
			if (!hasFiles(e)) return;
			e.preventDefault();
			setDragging(false);
			uploadFiles(e.dataTransfer.files);
		},
	};

	const dndAccessibility = {
		screenReaderInstructions: {
			draggable:
				'Tryck mellanslag för att lyfta bilden, flytta den med piltangenterna och tryck mellanslag igen för att släppa den. Escape avbryter.',
		},
		announcements: {
			onDragStart: ({ active }) => `Lyfte ${nameOf(active.id)}.`,
			onDragOver: ({ active, over }) =>
				over ? `${nameOf(active.id)} är vid ${nameOf(over.id)}.` : undefined,
			onDragEnd: ({ active, over }) =>
				over ? `Släppte ${nameOf(active.id)} vid ${nameOf(over.id)}.` : `Släppte ${nameOf(active.id)}.`,
			onDragCancel: ({ active }) => `Flytten av ${nameOf(active.id)} avbröts.`,
		},
	};

	const uploading = uploads.length > 0;

	return (
		<Box {...dropProps} sx={{ minHeight: '70vh' }}>
			<PageHeader
				title="Startbild"
				description="Bilderna högst upp på startsidan. Allt du ändrar här syns på hemsidan direkt."
				actions={
					<>
						<Button variant="outlined" startIcon={<OpenInNew />} href={SITE_URL} target="_blank" rel="noopener">
							Visa hemsidan
						</Button>
						<Button variant="contained" startIcon={<FileUploadOutlined />} onClick={pickFiles}>
							Ladda upp bilder
						</Button>
					</>
				}
			/>
			<input
				ref={fileInput}
				type="file"
				accept="image/*"
				multiple
				hidden
				onChange={(e) => {
					uploadFiles(e.target.files);
					e.target.value = '';
				}}
			/>

			{error && (
				<Alert severity="error" action={<Button color="inherit" onClick={load}>Försök igen</Button>} sx={{ mb: 2 }}>
					Kunde inte hämta bilderna. {error}
				</Alert>
			)}

			{!data && !error && (
				<>
					<Skeleton variant="rounded" height={88} sx={{ mb: 3 }} />
					<Box sx={GRID}>
						{[0, 1, 2].map((i) => (
							<Skeleton key={i} variant="rounded" sx={{ aspectRatio: '16 / 11', height: 'auto' }} />
						))}
					</Box>
				</>
			)}

			{data && (
				<>
					<Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
						<Typography variant="h2">Bilder</Typography>
						{images.length > 0 && (
							<Typography variant="body2" color="text.secondary">
								{shown.length} av {images.length} visas
								{images.length > 1 && (
									<>
										{' · Dra i '}
										<DragIndicator
											aria-label="handtaget"
											sx={{ fontSize: 16, verticalAlign: 'text-bottom' }}
										/>
										{' för att ändra ordning'}
									</>
								)}
							</Typography>
						)}
					</Box>

					{images.length > 0 && shown.length === 0 && (
						<Alert severity="warning" sx={{ mb: 2 }}>
							Ingen bild är påslagen, så hemsidan visar sina inbyggda bilder. Slå på
							“Visas” på minst en bild.
						</Alert>
					)}
					{!data.settings.slideshow && shown.length > 1 && (
						<Alert severity="info" sx={{ mb: 2 }}>
							Bildspelet är av, så bara bilden märkt “Visas först” syns på hemsidan. Dra
							en annan bild först, eller välj “Visa först” i dess meny, för att byta.
						</Alert>
					)}

					{images.length === 0 && !uploading ? (
						<HeroUploadCard onPick={pickFiles} dragging={dragging} large>
							Hemsidan visar sina inbyggda bilder tills du laddar upp egna. Klicka här eller
							dra hit en eller flera bilder. Foton från mobilen fungerar bra, liggande blir
							skarpast på datorer.
						</HeroUploadCard>
					) : (
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							accessibility={dndAccessibility}
							onDragEnd={onDragEnd}
							onDragCancel={() => (dragEndedAt.current = Date.now())}>
							<SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy} disabled={uploading}>
								<Box sx={GRID}>
									{images.map((image) => (
										<HeroImageCard
											key={image.id}
											image={image}
											place={placeOf(image)}
											shuffle={data.settings.shuffle}
											saving={saving.has(image.id)}
											onToggleShown={toggleShown}
											onOpen={openFocus}
											onMakeFirst={makeFirst}
											onDelete={setDeleting}
										/>
									))}
									{uploads.map((upload) => (
										<UploadingCard key={upload.key} upload={upload} />
									))}
									<HeroUploadCard onPick={pickFiles} dragging={dragging} />
								</Box>
							</SortableContext>
						</DndContext>
					)}

					<Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: 720 }}>
						Varje bild får ett betyg från 1 till 10 för hur skarp den blir på datorer och
						mobiler, utifrån dess storlek. Grön är bra, gul duger och röd blir suddig. Klicka
						på en bild för att se hur den ser ut på hemsidan och välja vad som ska hållas i bild.
					</Typography>

					<Typography variant="h2" sx={{ mt: 4, mb: 1.5 }}>
						Visning
					</Typography>
					<HeroSettingsCard settings={data.settings} onChange={changeSettings} />
				</>
			)}

			<HeroFocusDialog
				image={focusImage}
				open={Boolean(focusImage)}
				onClose={() => setFocusImage(null)}
				onSave={saveFocus}
			/>
			<ConfirmDialog
				open={Boolean(deleting)}
				title="Ta bort bilden?"
				confirmText="Ta bort"
				danger
				busy={deleteBusy}
				onConfirm={confirmDelete}
				onClose={() => setDeleting(null)}>
				{deleting && (
					<>
						{quoted(deleting)} tas bort från hemsidan och kan inte återställas.
						{deleting.shown && shown[0]?.id === deleting.id && shown.length > 1 &&
							` ${quoted(shown[1])} visas då först.`}
						{deleting.shown && shown.length === 1 &&
							' Det är den enda bilden som visas, så hemsidan visar sina inbyggda bilder igen.'}
					</>
				)}
			</ConfirmDialog>
		</Box>
	);
}
