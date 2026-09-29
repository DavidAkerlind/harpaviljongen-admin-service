import { createContext, useCallback, useContext, useRef, useState } from 'react';
import {
	CheckCircleRounded,
	ErrorRounded,
	InfoRounded,
	WarningRounded,
} from '@mui/icons-material';
import SwipeToast from './reactbits/SwipeToast';
import { brand } from '../theme';
import './notifications.css';

const NotifyContext = createContext(() => {});

// At most this many at once; a new one pushes the oldest out
const MAX_TOASTS = 3;

// The toast's colours per kind. The line along the bottom burns down until it closes.
const LOOKS = {
	success: { icon: CheckCircleRounded, background: brand.green, iconColor: '#9fd8a8', fuse: brand.sage, duration: 4000 },
	info: { icon: InfoRounded, background: brand.green, iconColor: '#b9cfe8', fuse: brand.sage, duration: 4000 },
	warning: { icon: WarningRounded, background: brand.green, iconColor: '#f2c14e', fuse: '#f2c14e', duration: 6000 },
	// A deep wine red, so a failure never looks like a success at a glance
	error: { icon: ErrorRounded, background: '#6e1f1b', iconColor: '#ffb4a9', fuse: '#ffb4a9', duration: 8000 },
};

// "Menyn är skapad. Ladda upp en PDF till den." → title "Menyn är skapad", the rest below it
function splitMessage(message) {
	const text = String(message ?? '');
	const match = text.match(/^(.+?)\.\s+(?=[A-ZÅÄÖ“"])(.+)$/s);
	if (!match) return { title: text.replace(/\.$/, ''), description: '' };
	return { title: match[1], description: match[2] };
}

export function NotificationProvider({ children }) {
	const [toasts, setToasts] = useState([]);
	const nextId = useRef(0);

	// notify('Sparat'), notify('Något gick fel', 'error') or, with a button on the toast,
	// notify('Bilden är dold', 'success', { actionLabel: 'Ångra', onAction: () => … })
	const notify = useCallback((message, severity = 'success', options = {}) => {
		const id = ++nextId.current;
		setToasts((list) => {
			const open = list.filter((t) => t.open);
			// Close the oldest ones (they slide away) to make room for the new one
			const closing = new Set(open.slice(0, Math.max(0, open.length - MAX_TOASTS + 1)).map((t) => t.id));
			return [
				...list.map((t) => (closing.has(t.id) ? { ...t, open: false } : t)),
				{ id, message, severity: LOOKS[severity] ? severity : 'success', open: true, ...options },
			];
		});
	}, []);

	const remove = (id) => setToasts((list) => list.filter((t) => t.id !== id));

	return (
		<NotifyContext.Provider value={notify}>
			{children}
			<div className="toast-stack">
				{toasts.map((toast) => {
					const look = LOOKS[toast.severity];
					const Icon = look.icon;
					const { title, description } = splitMessage(toast.message);
					return (
						<SwipeToast
							key={toast.id}
							inline
							open={toast.open}
							onClose={() => remove(toast.id)}
							title={title}
							description={description}
							icon={<Icon sx={{ color: look.iconColor }} />}
							actionLabel={toast.actionLabel}
							onAction={toast.onAction}
							background={look.background}
							color="#ffffff"
							fuseColor={look.fuse}
							width={380}
							radius={14}
							duration={toast.duration ?? look.duration}
							closeButton={toast.severity === 'error'}
							closeLabel="Stäng"
							className={`toast toast--${toast.severity}`}
						/>
					);
				})}
			</div>
		</NotifyContext.Provider>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNotify = () => useContext(NotifyContext);
