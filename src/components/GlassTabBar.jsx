import { useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import GlassSurface from './reactbits/GlassSurface';
import './glass-tab-bar.css';

const MotionSpan = motion.span;
const MotionDiv = motion.div;
const TAP_SLOP = 8; // px a finger can move and still count as a tap
const PILL_SPRING = { type: 'spring', stiffness: 480, damping: 34, mass: 0.9 };
const PADDING = 6;

const stroke = {
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 1.8,
	strokeLinecap: 'round',
	strokeLinejoin: 'round',
};

// Outlined like iOS: a house with a door step, and three dots for "Mer"
export const HomeIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true" {...stroke}>
		<path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19Z" />
		<path d="M9.5 16.5h5" />
	</svg>
);
export const MoreIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
		<circle cx="5" cy="12" r="1.7" />
		<circle cx="12" cy="12" r="1.7" />
		<circle cx="19" cy="12" r="1.7" />
	</svg>
);

// The item under a point on the screen, as its index
function indexAt(x, y) {
	const el = document.elementFromPoint(x, y)?.closest('[data-tab-index]');
	return el ? Number(el.dataset.tabIndex) : null;
}

// The phone's bar at the bottom in iOS's liquid glass style: a glass pill with the pages
// as icons, and the current one on a lighter pill that slides over when another is chosen.
// A finger can slide along the bar: the pill follows it and the page's name shows above,
// and lifting the finger opens that page. Real liquid glass (the page bent at the edges)
// where the browser can, frosted glass elsewhere (see reactbits/GlassSurface.jsx).
// items: { key, label, icon, active } with to (a page) or onClick (a button, e.g. "Mer").
export function GlassTabBar({ items, label, height = 64 }) {
	const reduce = useReducedMotion();
	const pillId = useId();
	const touch = useRef(null);
	const bar = useRef(null);
	const [pressed, setPressed] = useState(null);
	const pillIndex = pressed ?? items.findIndex((item) => item.active);
	const transition = reduce ? { duration: 0 } : PILL_SPRING;

	const reset = () => {
		touch.current = null;
		setPressed(null);
	};

	const onPointerDown = (e) => {
		if (e.pointerType === 'mouse') return;
		// Let the events follow the finger from item to item
		try {
			e.target.releasePointerCapture?.(e.pointerId);
		} catch {
			// not captured
		}
		const index = indexAt(e.clientX, e.clientY);
		touch.current = { id: e.pointerId, x0: e.clientX, start: index, moved: false };
		setPressed(index);
	};

	const onPointerMove = (e) => {
		const t = touch.current;
		if (!t || t.id !== e.pointerId) return;
		if (Math.abs(e.clientX - t.x0) > TAP_SLOP) t.moved = true;
		const index = indexAt(e.clientX, e.clientY);
		if (index !== null) setPressed(index);
	};

	const onPointerUp = (e) => {
		const t = touch.current;
		if (!t || t.id !== e.pointerId) return;
		const index = indexAt(e.clientX, e.clientY) ?? pressed;
		reset();
		// A tap clicks by itself; after sliding to another item, open the one under the finger
		if (t.moved && index !== null && index !== t.start) {
			bar.current?.querySelector(`[data-tab-index="${index}"]`)?.click();
		}
	};

	return (
		<nav
			ref={bar}
			className="glass-tab-bar"
			aria-label={label}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={reset}>
			<GlassSurface
				width="100%"
				height={height}
				borderRadius={height / 2}
				backgroundOpacity={0.55}
				saturation={1.8}
				brightness={50}
				opacity={0.93}
				blur={8}
				displace={0.4}
				distortionScale={-36}
				greenOffset={3}
				blueOffset={6}
				className="glass-tab-bar__glass"
				contentClassName="glass-tab-bar__items">
				{items.map((item, index) => {
					const props = {
						className: `glass-tab-bar__item${item.active ? ' glass-tab-bar__item--active' : ''}`,
						'aria-label': item.label,
						'data-tab-index': index,
					};
					const content = (
						<>
							{pillIndex === index && (
								<MotionSpan
									layoutId={pillId}
									className="glass-tab-bar__pill"
									transition={transition}
									animate={{ scale: pressed === index && !reduce ? 1.08 : 1 }}
								/>
							)}
							<span className="glass-tab-bar__icon">{item.icon}</span>
						</>
					);
					return item.to ? (
						<Link
							key={item.key}
							to={item.to}
							aria-current={item.active ? 'page' : undefined}
							{...props}>
							{content}
						</Link>
					) : (
						<button
							key={item.key}
							type="button"
							onClick={item.onClick}
							aria-haspopup={item.haspopup}
							{...props}>
							{content}
						</button>
					);
				})}
			</GlassSurface>
			{/* The name above the finger while it's on the bar (outside the glass, which clips) */}
			<AnimatePresence>
				{pressed !== null && (
					<MotionDiv
						key="label"
						className="glass-tab-bar__label"
						aria-hidden="true"
						initial={{ opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 6 }}
						transition={{ duration: reduce ? 0 : 0.16 }}
						style={{
							left: `calc(${PADDING}px + (100% - ${PADDING * 2}px) * ${(pressed + 0.5) / items.length})`,
						}}>
						{items[pressed]?.label}
					</MotionDiv>
				)}
			</AnimatePresence>
		</nav>
	);
}
