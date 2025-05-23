import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export const ProtectedRoute = ({ children }) => {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (!user) {
		return <Navigate to="/login" />;
	}

	return children;
};
