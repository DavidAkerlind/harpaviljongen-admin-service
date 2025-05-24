import { IconButton, Tooltip } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const BackButton = () => {
	const navigate = useNavigate();

	return (
		<Tooltip title="Go Back">
			<IconButton
				onClick={() => navigate(-1)}
				sx={{
					position: 'absolute',
					zIndex: '999',
					left: 16,
					top: 95,
					bgcolor: 'primary.main',
					color: 'background.default',
					'&:hover': {
						bgcolor: 'primary.dark',
						transform: 'scale(1.1)',
					},
					transition: 'all 0.2s',
				}}>
				<ArrowBack />
			</IconButton>
		</Tooltip>
	);
};
