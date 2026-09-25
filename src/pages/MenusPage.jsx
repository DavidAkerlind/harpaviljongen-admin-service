import { useCallback, useEffect, useState } from 'react';
import {
	Link as RouterLink,
	Navigate,
	useNavigate,
	useParams,
} from 'react-router-dom';
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	IconButton,
	Skeleton,
	Tab,
	Tabs,
	Tooltip,
	Typography,
	useMediaQuery,
} from '@mui/material';
import {
	Add,
	DeleteOutline,
	EditOutlined,
	OpenInNew,
	Public,
	PublicOff,
	TuneOutlined,
	VisibilityOutlined,
} from '@mui/icons-material';
import { api, LEGACY_MENU_PATHS } from '../api';
import { useMenuLists } from '../menus/MenuListsContext';
import { MenuDialog } from '../components/menus/MenuDialog';
import { PageHeader } from '../components/PageHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useNotify } from '../components/Notifications';
import { PdfThumbnail } from '../components/pdf/PdfThumbnail';
import { PdfPreviewDialog } from '../components/pdf/PdfPreviewDialog';
import { UploadPdfDialog } from '../components/pdf/UploadPdfDialog';
import { UploadPdfCard } from '../components/pdf/UploadPdfCard';
import { RenamePdfDialog } from '../components/pdf/RenamePdfDialog';
import { formatBytes, formatDate, formatDateTime } from '../utils/format';
import { brand } from '../theme';

const FALLBACK_NAME = '“Ny meny kommer snart”';

export function MenusPage() {
	const { list: type } = useParams();
	const { lists, error, reload } = useMenuLists();
	const navigate = useNavigate();
	const notify = useNotify();
	// key remounts the dialog on every open, so it starts empty
	const [creating, setCreating] = useState({ open: false, key: 0 });

	if (LEGACY_MENU_PATHS[type]) {
		return <Navigate to={`/menyer/${LEGACY_MENU_PATHS[type]}`} replace />;
	}
	const list = lists?.find((l) => l.type === type);
	if (lists && !list) return <Navigate to="/menyer/food" replace />;

	return (
		<>
			<PageHeader
				title="Menyer"
				description="Ladda upp menyerna som PDF. Den som är aktiv öppnas när gästerna klickar på menyns knapp på hemsidan."
				actions={
					<Button
						variant="contained"
						startIcon={<Add />}
						onClick={() =>
							setCreating((prev) => ({ open: true, key: prev.key + 1 }))
						}>
						Ny meny
					</Button>
				}
			/>
			{error ? (
				<Alert
					severity="error"
					action={
						<Button color="inherit" size="small" onClick={reload}>
							Försök igen
						</Button>
					}>
					Kunde inte hämta menyerna. {error}
				</Alert>
			) : !lists ? (
				<Skeleton variant="rounded" height={48} sx={{ mb: 3 }} />
			) : (
				<>
					<Tabs
						value={type}
						variant="scrollable"
						scrollButtons="auto"
						allowScrollButtonsMobile
						sx={{ mb: 3, borderBottom: `1px solid ${brand.border}` }}
						aria-label="Välj meny">
						{lists.map((item) => (
							<Tab
								key={item.type}
								value={item.type}
								label={item.label}
								component={RouterLink}
								to={`/menyer/${item.type}`}
							/>
						))}
					</Tabs>
					{/* key: start fresh when switching between menus */}
					<PdfManager key={type} list={list} />
				</>
			)}

			<MenuDialog
				key={creating.key}
				open={creating.open}
				menu={null}
				onClose={() => setCreating((prev) => ({ ...prev, open: false }))}
				onSaved={async (menu) => {
					setCreating((prev) => ({ ...prev, open: false }));
					await reload();
					notify(`Menyn “${menu.label}” är skapad. Ladda upp en PDF till den.`);
					navigate(`/menyer/${menu.type}`);
				}}
			/>
		</>
	);
}

// "Knapp i menyn och på startsidan" – where the website shows the menu's button
function buttonPlacesText({ navbar, home }) {
	if (navbar && home) return 'Knapp i menyn och på startsidan';
	if (navbar) return 'Knapp i menyn på hemsidan';
	if (home) return 'Knapp på startsidan';
	return 'Ingen knapp på hemsidan';
}

function PdfManager({ list }) {
	const notify = useNotify();
	const navigate = useNavigate();
	const { reload: reloadLists } = useMenuLists();
	const [settings, setSettings] = useState({ open: false, key: 0 });
	const isPhone = useMediaQuery((theme) => theme.breakpoints.down('sm'));
	const [pdfs, setPdfs] = useState(null);
	const [error, setError] = useState(null);
	// key remounts the dialog on every open; file = a PDF dropped on the upload card
	const [upload, setUpload] = useState({ open: false, file: null, key: 0 });
	const [preview, setPreview] = useState(null);
	const [confirm, setConfirm] = useState(null); // { kind: 'delete' | 'deactivate', pdf }
	const [busy, setBusy] = useState(false);
	const [renaming, setRenaming] = useState(null);

	const load = useCallback(async () => {
		setError(null);
		try {
			setPdfs(await api.getPdfs(list.type));
		} catch (err) {
			setError(err.message);
		}
	}, [list.type]);

	useEffect(() => {
		load();
	}, [load]);

	const openUpload = (file) =>
		setUpload((prev) => ({ open: true, file, key: prev.key + 1 }));
	const closeUpload = () => setUpload((prev) => ({ ...prev, open: false }));

	const active = pdfs?.find((pdf) => pdf.isActive);
	const name = (pdf) => `“${pdf.title || pdf.originalName}”`;
	// What the website does when this menu has no active PDF
	const withoutActiveText = list.builtIn
		? `Knappen “${list.label}” på hemsidan öppnar då reservfilen ${FALLBACK_NAME} tills du väljer en annan PDF.`
		: `Knappen “${list.label}” visas då inte på hemsidan förrän du väljer en annan PDF.`;

	const run = async (action, successMessage) => {
		setBusy(true);
		try {
			const result = await action();
			notify(successMessage);
			await load();
			return result;
		} catch (err) {
			notify(err.message, 'error');
		} finally {
			setBusy(false);
		}
	};

	const activate = async (pdf) => {
		const updated = await run(
			() => api.activatePdf(pdf._id),
			`${name(pdf)} visas nu på hemsidan`
		);
		if (updated && preview?._id === pdf._id) setPreview(updated);
	};

	const confirmAction = async () => {
		const { kind, pdf } = confirm;
		if (kind === 'deleteMenu') {
			setBusy(true);
			try {
				await api.deleteMenuList(list.type);
				setConfirm(null);
				notify(`Menyn “${list.label}” är borttagen`);
				await reloadLists();
				navigate('/menyer/food', { replace: true });
			} catch (err) {
				notify(err.message, 'error');
				setBusy(false);
			}
			return;
		}
		if (kind === 'delete') {
			await run(() => api.deletePdf(pdf._id), `${name(pdf)} är borttagen`);
		} else {
			await run(
				() => api.deactivatePdf(pdf._id),
				`${name(pdf)} visas inte längre på hemsidan`
			);
		}
		setConfirm(null);
	};

	if (error) {
		return (
			<Alert
				severity="error"
				action={
					<Button color="inherit" size="small" onClick={load}>
						Försök igen
					</Button>
				}>
				Kunde inte hämta PDF:erna. {error}
			</Alert>
		);
	}

	return (
		<Box sx={{ display: 'grid', gap: 4 }}>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 1,
					mt: -1.5,
				}}>
				<Typography variant="body2" color="text.secondary">
					{buttonPlacesText(list)}
				</Typography>
				<Button
					size="small"
					color="inherit"
					startIcon={<TuneOutlined />}
					onClick={() =>
						setSettings((prev) => ({ open: true, key: prev.key + 1 }))
					}>
					Inställningar
				</Button>
			</Box>

			{/* Aktiv just nu */}
			<Box>
				<Typography variant="h2" sx={{ mb: 1.5 }}>
					Visas på hemsidan nu
				</Typography>
				{pdfs === null ? (
					<Skeleton variant="rounded" height={190} />
				) : active ? (
					<Card>
						<CardContent
							sx={{
								display: 'grid',
								gridTemplateColumns: { xs: '84px 1fr', sm: '130px 1fr' },
								gridTemplateAreas: {
									xs: '"thumb info" "actions actions"',
									sm: '"thumb info" "thumb actions"',
								},
								alignContent: 'start',
								columnGap: { xs: 2, sm: 3 },
								rowGap: 2,
								p: { xs: 2, sm: 3 },
							}}>
							<PdfThumbnail
								url={active.url}
								title={active.title}
								onClick={() => setPreview(active)}
								compact
								sx={{ gridArea: 'thumb', alignSelf: 'start' }}
							/>
							<Box sx={{ gridArea: 'info', minWidth: 0, alignSelf: 'end' }}>
								<Chip
									icon={<Public />}
									label="Aktiv"
									color="success"
									size="small"
									sx={{ mb: 1 }}
								/>
								<TitleWithRename
									variant="h2"
									title={active.title || active.originalName}
									onRename={() => setRenaming(active)}
								/>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ mt: 0.5 }}>
									Uppladdad {formatDateTime(active.uploadedAt)}
									{active.bytes ? ` · ${formatBytes(active.bytes)}` : ''}
								</Typography>
							</Box>
							<Box
								sx={{
									gridArea: 'actions',
									display: 'flex',
									flexWrap: 'wrap',
									gap: 1,
									alignSelf: 'start',
								}}>
								<Button
									variant="outlined"
									startIcon={<VisibilityOutlined />}
									onClick={() => setPreview(active)}>
									Förhandsgranska
								</Button>
								<Button
									href={active.url}
									target="_blank"
									rel="noopener noreferrer"
									startIcon={<OpenInNew />}
									color="inherit">
									Öppna
								</Button>
								<Button
									startIcon={<PublicOff />}
									color="inherit"
									disabled={busy}
									onClick={() =>
										setConfirm({ kind: 'deactivate', pdf: active })
									}>
									Sluta visa
								</Button>
							</Box>
						</CardContent>
					</Card>
				) : (
					<Alert
						severity="warning"
						variant="outlined"
						sx={{ bgcolor: 'background.paper' }}>
						{list.builtIn ? (
							<>
								Ingen {list.label.toLowerCase()} är aktiv. Knappen “{list.label}”
								på hemsidan öppnar reservfilen {FALLBACK_NAME} tills du väljer en
								PDF nedan eller laddar upp en ny.
							</>
						) : (
							<>
								Ingen PDF är aktiv, så knappen “{list.label}” visas inte på
								hemsidan. Välj en PDF nedan eller ladda upp en ny.
							</>
						)}
					</Alert>
				)}
			</Box>

			{/* Alla PDF:er */}
			<Box>
				<Typography variant="h2" sx={{ mb: 0.5 }}>
					Alla uppladdade{pdfs?.length ? ` (${pdfs.length})` : ''}
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
					{pdfs?.length === 0
						? 'Inga PDF:er uppladdade än. Ladda upp en för att komma igång.'
						: 'Klicka på en PDF för att förhandsgranska den. Bara en i taget kan visas på hemsidan.'}
				</Typography>

				<Box sx={gridSx}>
					<UploadPdfCard list={list} onSelect={openUpload} />
					{pdfs === null
						? [1, 2].map((i) => (
								<Skeleton key={i} variant="rounded" sx={{ minHeight: 300 }} />
							))
						: pdfs.map((pdf) => (
								<Card
									key={pdf._id}
									sx={{
										display: 'flex',
										flexDirection: { xs: 'row', sm: 'column' },
										borderColor: pdf.isActive ? 'success.main' : undefined,
									}}>
									<Box
										sx={{
											p: 1.5,
											pr: { xs: 0, sm: 1.5 },
											pb: { sm: 0 },
											position: 'relative',
											width: { xs: 96, sm: 'auto' },
											flexShrink: 0,
										}}>
										<PdfThumbnail
											url={pdf.url}
											title={pdf.title}
											onClick={() => setPreview(pdf)}
											compact={isPhone}
										/>
										{pdf.isActive && (
											<Chip
												label="Aktiv"
												color="success"
												size="small"
												sx={{
													position: 'absolute',
													top: 20,
													left: 20,
													display: { xs: 'none', sm: 'flex' },
												}}
											/>
										)}
									</Box>
									<Box
										sx={{
											p: 1.5,
											flex: 1,
											minWidth: 0,
											display: 'flex',
											flexDirection: 'column',
										}}>
										<TitleWithRename
											title={pdf.title || pdf.originalName}
											onRename={() => setRenaming(pdf)}
										/>
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ mt: 0.25 }}>
											{formatDate(pdf.uploadedAt)}
											{pdf.bytes ? ` · ${formatBytes(pdf.bytes)}` : ''}
										</Typography>
										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
												gap: 0.5,
												mt: 'auto',
												pt: 1.5,
											}}>
											{pdf.isActive ? (
												<Typography
													variant="body2"
													sx={{
														color: 'success.main',
														fontWeight: 600,
														flex: 1,
													}}>
													Visas nu
												</Typography>
											) : (
												<Button
													size="small"
													variant="outlined"
													disabled={busy}
													onClick={() => activate(pdf)}
													sx={{ flex: 1, whiteSpace: 'nowrap' }}>
													Visa på hemsidan
												</Button>
											)}
											<Tooltip title="Förhandsgranska">
												<IconButton
													size="small"
													onClick={() => setPreview(pdf)}
													aria-label="Förhandsgranska">
													<VisibilityOutlined fontSize="small" />
												</IconButton>
											</Tooltip>
											<Tooltip title="Ta bort">
												<IconButton
													size="small"
													disabled={busy}
													onClick={() => setConfirm({ kind: 'delete', pdf })}
													aria-label="Ta bort">
													<DeleteOutline fontSize="small" />
												</IconButton>
											</Tooltip>
										</Box>
									</Box>
								</Card>
							))}
				</Box>
			</Box>

			<UploadPdfDialog
				key={upload.key}
				open={upload.open}
				initialFile={upload.file}
				list={list}
				onClose={closeUpload}
				onUploaded={(pdf) => {
					closeUpload();
					notify(
						pdf.isActive
							? `${name(pdf)} är uppladdad och visas nu på hemsidan`
							: `${name(pdf)} är uppladdad. Förhandsgranska och välj “Visa på hemsidan” när du är redo.`
					);
					load();
				}}
			/>

			<RenamePdfDialog
				key={renaming?._id}
				pdf={renaming}
				onClose={() => setRenaming(null)}
				onRenamed={(pdf) => {
					setRenaming(null);
					notify(`Bytt namn till ${name(pdf)}`);
					if (preview?._id === pdf._id) setPreview(pdf);
					load();
				}}
			/>

			<MenuDialog
				key={`settings-${settings.key}`}
				open={settings.open}
				menu={list}
				onClose={() => setSettings((prev) => ({ ...prev, open: false }))}
				onSaved={async (menu) => {
					setSettings((prev) => ({ ...prev, open: false }));
					await reloadLists();
					notify(`Menyn “${menu.label}” är sparad`);
				}}
				onDelete={() => {
					setSettings((prev) => ({ ...prev, open: false }));
					setConfirm({ kind: 'deleteMenu' });
				}}
			/>

			<PdfPreviewDialog
				pdf={preview}
				busy={busy}
				onClose={() => setPreview(null)}
				onActivate={activate}
			/>

			<ConfirmDialog
				open={Boolean(confirm)}
				busy={busy}
				danger={confirm?.kind === 'delete' || confirm?.kind === 'deleteMenu'}
				title={
					confirm?.kind === 'deleteMenu'
						? `Ta bort menyn ${list.label}?`
						: confirm?.kind === 'delete'
							? 'Ta bort PDF?'
							: 'Sluta visa på hemsidan?'
				}
				confirmText={
					confirm?.kind === 'deleteMenu'
						? 'Ta bort menyn'
						: confirm?.kind === 'delete'
							? 'Ta bort'
							: 'Sluta visa'
				}
				onConfirm={confirmAction}
				onClose={() => setConfirm(null)}>
				{confirm?.kind === 'deleteMenu' && (
					<>
						{`Knappen “${list.label}” försvinner från hemsidan${
							pdfs?.length
								? ` och ${pdfs.length === 1 ? 'menyns PDF' : `alla ${pdfs.length} PDF:er`} raderas permanent`
								: ''
						}. Det går inte att ångra.`}
					</>
				)}
				{confirm?.kind === 'delete' && !confirm.pdf.isActive && (
					<>{name(confirm.pdf)} raderas permanent.</>
				)}
				{confirm?.kind === 'delete' && confirm.pdf.isActive && (
					<>
						{name(confirm.pdf)} visas just nu på hemsidan och raderas permanent.{' '}
						{withoutActiveText}
					</>
				)}
				{confirm?.kind === 'deactivate' && (
					<>
						{withoutActiveText} {name(confirm.pdf)} finns kvar här.
					</>
				)}
			</ConfirmDialog>
		</Box>
	);
}

const gridSx = {
	display: 'grid',
	gridTemplateColumns: {
		xs: '1fr',
		sm: 'repeat(auto-fill, minmax(230px, 1fr))',
	},
	gap: 2,
};

// The PDF's name with a small pencil to rename it
function TitleWithRename({ title, variant, onRename }) {
	return (
		<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
			<Typography
				variant={variant}
				sx={{
					flex: 1,
					minWidth: 0,
					wordBreak: 'break-word',
					...(variant ? {} : { fontWeight: 600, lineHeight: 1.3 }),
				}}>
				{title}
			</Typography>
			<Tooltip title="Byt namn">
				<IconButton
					size="small"
					onClick={onRename}
					aria-label={`Byt namn på ${title}`}
					sx={{ mt: -0.5, mr: -0.75, color: 'text.secondary' }}>
					<EditOutlined fontSize="small" />
				</IconButton>
			</Tooltip>
		</Box>
	);
}
