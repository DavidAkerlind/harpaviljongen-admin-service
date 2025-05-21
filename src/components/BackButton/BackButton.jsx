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
					left: 10,
					top: 90,
					bgcolor: 'background.paper',
					'&:hover': {
						bgcolor: 'background.default',
						transform: 'scale(1.1)',
					},
					transition: 'all 0.2s',
				}}>
				<ArrowBack />
			</IconButton>
		</Tooltip>
	);
};
