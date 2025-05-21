import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
// https://davidakerlind.github.io/harpaviljongen-admin-service/
export default defineConfig({
	plugins: [react()],
	base: '/harpaviljongen-admin-service',
	server: {
		proxy: {
			'/api': {
				target: 'https://harpaviljongen-db-api.onrender.com',
				changeOrigin: true,
				secure: false,
			},
		},
	},
});
