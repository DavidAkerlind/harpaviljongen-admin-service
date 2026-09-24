import { useCallback, useEffect, useState } from 'react';
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Divider,
	Link,
	Skeleton,
	Switch,
	Typography,
} from '@mui/material';
import { OpenInNew } from '@mui/icons-material';
import { api } from '../api';
import { SITE_URL } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { useNotify } from '../components/Notifications';
import { SITE_PAGES } from '../utils/sitePages';

const PLACEMENTS = [
	{
		key: 'navbar',
		label: 'Länk i menyn',
		hint: 'Syns i navigeringen högst upp på alla sidor',
	},
	{
		key: 'home',
		label: 'Knapp på startsidan',
		hint: 'Syns bredvid Meny och Vinlista på startsidan',
	},
];

export function PagesPage() {
	const notify = useNotify();
	const [pages, setPages] = useState(null);
	const [error, setError] = useState(null);
	const [saving, setSaving] = useState(null); // "chambre.navbar" while that switch saves

	const load = useCallback(async () => {
		setError(null);
		try {
			const settings = await api.getSiteSettings();
			setPages(settings.pages);
		} catch (err) {
			setError(err.message);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	// Saves right away; the switch flips immediately and flips back if saving fails
	const toggle = async (page, placement, value) => {
		const previous = pages;
		setPages((prev) => ({
			...prev,
			[page.key]: { ...prev[page.key], [placement.key]: value },
		}));
		setSaving(`${page.key}.${placement.key}`);
		try {
			const settings = await api.updateSiteSettings({
				[page.key]: { [placement.key]: value },
			});
			setPages(settings.pages);
			notify(
				`${page.label}: ${placement.label.toLowerCase()} ${value ? 'visas' : 'är dold'}`
			);
		} catch (err) {
			setPages(previous);
			notify(err.message, 'error');
		} finally {
			setSaving(null);
		}
	};

	return (
		<>
			<PageHeader
				title="Sidor"
				description="Välj vilka sidor som syns på hemsidan. Ändringar sparas direkt. Dolda sidor går fortfarande att öppna med en direktlänk."
			/>

			{error ? (
				<Alert
					severity="error"
					action={
						<Button color="inherit" size="small" onClick={load}>
							Försök igen
						</Button>
					}>
					Kunde inte hämta inställningarna. {error}
				</Alert>
			) : (
				<Box
					sx={{
						display: 'grid',
						gap: 2,
						gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
					}}>
					{SITE_PAGES.map((page) => (
						<Card key={page.key}>
							<CardContent sx={{ p: 2.5 }}>
								<Typography variant="h2">{page.label}</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ mt: 0.5 }}>
									{page.description}
								</Typography>
								<Link
									href={`${SITE_URL}${page.path}`}
									target="_blank"
									rel="noopener noreferrer"
									variant="body2"
									sx={{
										display: 'inline-flex',
										alignItems: 'center',
										gap: 0.5,
										mt: 1,
										color: 'primary.light',
									}}>
									Öppna sidan <OpenInNew sx={{ fontSize: 14 }} />
								</Link>
							</CardContent>
							<Divider />
							{PLACEMENTS.map((placement, index) => {
								const id = `${page.key}-${placement.key}`;
								return (
									<Box key={placement.key}>
										{index > 0 && <Divider />}
										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
												gap: 1,
												px: 2.5,
												py: 1.5,
											}}>
											<Box sx={{ flex: 1 }}>
												<Typography
													component="label"
													htmlFor={id}
													sx={{ fontWeight: 500, cursor: 'pointer' }}>
													{placement.label}
												</Typography>
												<Typography variant="body2" color="text.secondary">
													{placement.hint}
												</Typography>
											</Box>
											{pages ? (
												<Switch
													id={id}
													checked={Boolean(pages[page.key]?.[placement.key])}
													disabled={saving === `${page.key}.${placement.key}`}
													onChange={(e) =>
														toggle(page, placement, e.target.checked)
													}
												/>
											) : (
												<Skeleton variant="rounded" width={52} height={30} />
											)}
										</Box>
									</Box>
								);
							})}
						</Card>
					))}
				</Box>
			)}
		</>
	);
}
