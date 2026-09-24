import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom';
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
	DeleteOutline,
	OpenInNew,
	Public,
	PublicOff,
	VisibilityOutlined,
} from '@mui/icons-material';
import { api, PDF_LISTS } from '../api';
import { PageHeader } from '../components/PageHeader';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useNotify } from '../components/Notifications';
import { PdfThumbnail } from '../components/pdf/PdfThumbnail';
import { PdfPreviewDialog } from '../components/pdf/PdfPreviewDialog';
import { UploadPdfDialog } from '../components/pdf/UploadPdfDialog';
import { UploadPdfCard } from '../components/pdf/UploadPdfCard';
import { formatBytes, formatDate, formatDateTime } from '../utils/format';
import { brand } from '../theme';

const FALLBACK_NAME = '“Ny meny kommer snart”';

export function MenusPage() {
	const { list: listKey } = useParams();
	const list = PDF_LISTS[listKey];
	if (!list) return <Navigate to="/menyer/meny" replace />;

	return (
		<>
			<PageHeader
				title="Menyer"
				description="Ladda upp menyn och vinlistan som PDF. Den som är aktiv öppnas när gästerna klickar på knapparna på hemsidan."
			/>
			<Tabs
				value={listKey}
				sx={{ mb: 3, borderBottom: `1px solid ${brand.border}` }}
				aria-label="Välj lista">
				{Object.entries(PDF_LISTS).map(([key, item]) => (
					<Tab
						key={key}
						value={key}
						label={item.label}
						component={RouterLink}
						to={`/menyer/${key}`}
					/>
				))}
			</Tabs>
			{/* key: start fresh when switching between Meny and Vinlista */}
			<PdfManager key={listKey} list={list} />
		</>
	);
}

function PdfManager({ list }) {
	const notify = useNotify();
	const isPhone = useMediaQuery((theme) => theme.breakpoints.down('sm'));
	const [pdfs, setPdfs] = useState(null);
	const [error, setError] = useState(null);
	// key remounts the dialog on every open; file = a PDF dropped on the upload card
	const [upload, setUpload] = useState({ open: false, file: null, key: 0 });
	const [preview, setPreview] = useState(null);
	const [confirm, setConfirm] = useState(null); // { kind: 'delete' | 'deactivate', pdf }
	const [busy, setBusy] = useState(false);

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
								<Typography variant="h2" sx={{ wordBreak: 'break-word' }}>
									{active.title || active.originalName}
								</Typography>
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
						Ingen {list.label.toLowerCase()} är aktiv. Knappen “{list.label}” på
						hemsidan öppnar reservfilen {FALLBACK_NAME} tills du väljer en PDF
						nedan eller laddar upp en ny.
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
						? `Inga PDF:er uppladdade än. Ladda upp ${list.noun} för att komma igång.`
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
										<Typography
											sx={{
												fontWeight: 600,
												lineHeight: 1.3,
												wordBreak: 'break-word',
											}}>
											{pdf.title || pdf.originalName}
										</Typography>
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

			<PdfPreviewDialog
				pdf={preview}
				busy={busy}
				onClose={() => setPreview(null)}
				onActivate={activate}
			/>

			<ConfirmDialog
				open={Boolean(confirm)}
				busy={busy}
				danger={confirm?.kind === 'delete'}
				title={
					confirm?.kind === 'delete'
						? 'Ta bort PDF?'
						: 'Sluta visa på hemsidan?'
				}
				confirmText={confirm?.kind === 'delete' ? 'Ta bort' : 'Sluta visa'}
				onConfirm={confirmAction}
				onClose={() => setConfirm(null)}>
				{confirm?.kind === 'delete' && !confirm.pdf.isActive && (
					<>{name(confirm.pdf)} raderas permanent.</>
				)}
				{confirm?.kind === 'delete' && confirm.pdf.isActive && (
					<>
						{name(confirm.pdf)} visas just nu på hemsidan och raderas permanent.
						Knappen “{list.label}” öppnar då reservfilen {FALLBACK_NAME} tills
						du väljer en annan PDF.
					</>
				)}
				{confirm?.kind === 'deactivate' && (
					<>
						Knappen “{list.label}” på hemsidan öppnar då reservfilen{' '}
						{FALLBACK_NAME} tills du väljer en annan PDF. {name(confirm.pdf)}{' '}
						finns kvar här.
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
