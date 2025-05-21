import { useState } from 'react';
import { BackButton } from '../../components/BackButton/BackButton';

import {
	Container,
	Paper,
	TextField,
	Typography,
	List,
	ListItem,
	ListItemText,
	IconButton,
	Box,
	CircularProgress,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/apiService';

export const SearchPage = () => {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSearch = async (e) => {
		e.preventDefault();
		if (!query.trim()) return;

		try {
			setLoading(true);
			const response = await api.searchItems(query);
			setResults(response.data);
		} catch (error) {
			console.error('Search error:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container maxWidth="md">
			<BackButton />
			<Paper sx={{ p: 3, mt: 3 }}>
				<Typography variant="h5" gutterBottom>
					Search Menu Items
				</Typography>

				<form onSubmit={handleSearch}>
					<TextField
						fullWidth
						label="Search items..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						margin="normal"
					/>
				</form>

				{loading ? (
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							p: 3,
						}}>
						<CircularProgress />
					</Box>
				) : (
					<List>
						{results.map((menu) => (
							<Box key={menu.menuId} sx={{ mb: 3 }}>
								<Typography variant="h6">
									{menu.menuTitle}
								</Typography>
								{menu.items.map((item) => (
									<ListItem
										key={item.id}
										secondaryAction={
											<IconButton
												onClick={() =>
													navigate(
														`/menu/${menu.menuId}/items/${item.id}`
													)
												}>
												<Edit />
											</IconButton>
										}>
										<ListItemText
											primary={item.title}
											secondary={`${
												item.description ||
												'No description'
											} - ${item.price || 0} kr`}
										/>
									</ListItem>
								))}
							</Box>
						))}
					</List>
				)}
			</Paper>
		</Container>
	);
};
