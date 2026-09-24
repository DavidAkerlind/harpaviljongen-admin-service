import { useRef, useState } from 'react';
import {
	Alert,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	LinearProgress,
	Switch,
	TextField,
	Typography,
} from '@mui/material';
import { CloudUploadOutlined, PictureAsPdfOutlined } from '@mui/icons-material';
import { api } from '../../api';
import { formatBytes } from '../../utils/format';
import { brand } from '../../theme';

const MAX_MB = 10;

const fileProblem = (file) => {
	if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
		return 'Filen måste vara en PDF.';
	}
	if (file.size > MAX_MB * 1024 * 1024) {
		return `Filen är för stor (${formatBytes(file.size)}). Max ${MAX_MB} MB.`;
	}
	return null;
};

const titleFromFile = (file) => file.name.replace(/\.pdf$/i, '');

// initialFile: a file dropped on the upload card. The parent remounts the dialog
// (new key) each time it opens, so it starts from that file.
export function UploadPdfDialog({
	open,
	list,
	initialFile = null,
	onClose,
	onUploaded,
}) {
	const inputRef = useRef(null);
	const initialProblem = initialFile ? fileProblem(initialFile) : null;
	const startFile = initialFile && !initialProblem ? initialFile : null;
	const [file, setFile] = useState(startFile);
	const [title, setTitle] = useState(startFile ? titleFromFile(startFile) : '');
	const [activate, setActivate] = useState(false);
	const [dragging, setDragging] = useState(false);
	const [progress, setProgress] = useState(null);
	const [error, setError] = useState(initialProblem);
	const uploading = progress !== null;

	const reset = () => {
		setFile(null);
		setTitle('');
		setActivate(false);
		setProgress(null);
		setError(null);
	};

	const close = () => {
		if (uploading) return;
		reset();
		onClose();
	};

	const pick = (picked) => {
		setError(null);
		if (!picked) return;
		const problem = fileProblem(picked);
		if (problem) return setError(problem);
		setFile(picked);
		if (!title) setTitle(titleFromFile(picked));
	};

	const upload = async () => {
		setError(null);
		setProgress(0);
		try {
			const pdf = await api.uploadPdf(
				{ file, type: list.type, title: title.trim(), activate },
				setProgress
			);
			reset();
			onUploaded(pdf);
		} catch (err) {
			setProgress(null);
			setError(err.message);
		}
	};

	return (
		<Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
			<DialogTitle sx={{ fontWeight: 600 }}>
				Ladda upp ny {list.label.toLowerCase()}
			</DialogTitle>
			<DialogContent sx={{ display: 'grid', gap: 2.5 }}>
				<Box
					onClick={() => !uploading && inputRef.current?.click()}
					onDragOver={(e) => {
						e.preventDefault();
						setDragging(true);
					}}
					onDragLeave={() => setDragging(false)}
					onDrop={(e) => {
						e.preventDefault();
						setDragging(false);
						if (!uploading) pick(e.dataTransfer.files?.[0]);
					}}
					sx={{
						mt: 1,
						p: 3,
						borderRadius: 3,
						border: `2px dashed ${dragging ? brand.green : brand.sage}`,
						bgcolor: dragging ? brand.sageLight : '#fafaf7',
						textAlign: 'center',
						cursor: uploading ? 'default' : 'pointer',
						transition: 'all .15s ease',
					}}>
					<input
						ref={inputRef}
						type="file"
						accept="application/pdf,.pdf"
						hidden
						onChange={(e) => {
							pick(e.target.files?.[0]);
							e.target.value = '';
						}}
					/>
					{file ? (
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 1.5,
								justifyContent: 'center',
							}}>
							<PictureAsPdfOutlined sx={{ color: brand.moss, fontSize: 36 }} />
							<Box sx={{ textAlign: 'left', minWidth: 0 }}>
								<Typography sx={{ fontWeight: 600 }} noWrap>
									{file.name}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{formatBytes(file.size)} · klicka för att byta fil
								</Typography>
							</Box>
						</Box>
					) : (
						<>
							<CloudUploadOutlined sx={{ fontSize: 40, color: brand.moss }} />
							<Typography sx={{ fontWeight: 600, mt: 1 }}>
								Dra hit en PDF eller klicka för att välja
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Max {MAX_MB} MB
							</Typography>
						</>
					)}
				</Box>

				<TextField
					label="Namn"
					helperText="Visas bara här i admin, t.ex. “Höstmeny 2026”"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					slotProps={{ htmlInput: { maxLength: 100 } }}
					disabled={uploading}
					fullWidth
				/>

				<FormControlLabel
					control={
						<Switch
							checked={activate}
							onChange={(e) => setActivate(e.target.checked)}
							disabled={uploading}
						/>
					}
					label={
						<Box>
							<Typography sx={{ fontWeight: 500 }}>
								Visa på hemsidan direkt
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Av: ladda upp och förhandsgranska först, publicera sen.
							</Typography>
						</Box>
					}
					sx={{ alignItems: 'flex-start', '& .MuiSwitch-root': { mt: -0.5 } }}
				/>

				{uploading && (
					<Box>
						<LinearProgress
							variant={progress < 100 ? 'determinate' : 'indeterminate'}
							value={progress}
						/>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mt: 0.75 }}>
							{progress < 100 ? `Laddar upp… ${progress}%` : 'Sparar…'}
						</Typography>
					</Box>
				)}
				{error && <Alert severity="error">{error}</Alert>}
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2.5 }}>
				<Button onClick={close} disabled={uploading} color="inherit">
					Avbryt
				</Button>
				<Button
					variant="contained"
					onClick={upload}
					disabled={!file || uploading}>
					Ladda upp
				</Button>
			</DialogActions>
		</Dialog>
	);
}
