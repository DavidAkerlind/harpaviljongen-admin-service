import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Deployed on Cloudflare Pages at https://admin.harpaviljongen.com
// Port 5174 so it can run next to the public site (5173) locally.
export default defineConfig({
	plugins: [react()],
	base: '/',
	server: { port: 5174 },
	preview: { port: 4174 },
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					react: ['react', 'react-dom', 'react-router-dom'],
					mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
				},
			},
		},
	},
});
