import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import GlassSurface from './reactbits/GlassSurface';
import './glass-tab-bar.css';

const MotionSpan = motion.span;
const MotionDiv = motion.div;
const TAP_SLOP = 8; // px a finger can move and still count as a tap
const LABEL_DELAY = 300; // ms a finger rests on an item before its name shows
const EDGE_SLOP = 24; // px above or below the bar a finger still counts as on it
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

// The item under a finger, as its index: the nearest one along the bar (so the edges and the
// gaps count too), or null when the finger is off the bar
function indexAt(nav, x, y) {
	const bar = nav.getBoundingClientRect();
	if (x < bar.left || x > bar.right || y < bar.top - EDGE_SLOP || y > bar.bottom + EDGE_SLOP) {
		return null;
	}
	let nearest = null;
	let nearestDistance = Infinity;
	for (const el of nav.querySelectorAll('[data-tab-index]')) {
		const box = el.getBoundingClientRect();
		const distance = Math.max(box.left - x, 0, x - box.right);
		if (distance < nearestDistance) {
			nearest = Number(el.dataset.tabIndex);
			nearestDistance = distance;
		}
	}
	return nearest;
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
	const labelTimer = useRef(null);
	const bar = useRef(null);
	const [pressed, setPressed] = useState(null);
	const [showLabel, setShowLabel] = useState(false);
	// A page just chosen keeps the pill until its route shows, so the pill doesn't jump back
	const [opening, setOpening] = useState(null);
	const activeIndex = items.findIndex((item) => item.active);
	const pillIndex = pressed ?? opening ?? activeIndex;
	const transition = reduce ? { duration: 0 } : PILL_SPRING;

	useEffect(() => setOpening(null), [activeIndex]);

	// Fingers open the items themselves (onPointerUp), so the browser's own click after a
	// touch is cancelled: Safari on iPhone drops that click on quick taps when something on
	// the bar changes under the finger (the pill), and it would open "Mer" a second time
	useEffect(() => {
		const nav = bar.current;
		const cancel = (e) => {
			if (e.cancelable) e.preventDefault();
		};
		nav.addEventListener('touchend', cancel, { passive: false });
		return () => nav.removeEventListener('touchend', cancel);
	}, []);

	useEffect(() => () => clearTimeout(labelTimer.current), []);

	const reset = () => {
		touch.current = null;
		clearTimeout(labelTimer.current);
		setPressed(null);
		setShowLabel(false);
	};

	const onPointerDown = (e) => {
		// Fingers only (a mouse or a pen clicks as usual), and only the first finger
		if (e.pointerType !== 'touch' || !e.isPrimary) return;
		const index = indexAt(bar.current, e.clientX, e.clientY);
		if (index === null) return;
		// The bar follows the finger until it lifts, also when it slides off the bar
		try {
			bar.current.setPointerCapture(e.pointerId);
		} catch {
			// the finger is already gone
		}
		touch.current = { id: e.pointerId, x0: e.clientX };
		setPressed(index);
		// The name shows when the finger rests or slides, not on a quick tap
		clearTimeout(labelTimer.current);
		labelTimer.current = setTimeout(() => setShowLabel(true), LABEL_DELAY);
	};

	const onPointerMove = (e) => {
		const t = touch.current;
		if (!t || t.id !== e.pointerId) return;
		if (Math.abs(e.clientX - t.x0) > TAP_SLOP) setShowLabel(true);
		// Off the bar the pill goes back, and lifting there opens nothing
		setPressed(indexAt(bar.current, e.clientX, e.clientY));
	};

	const onPointerUp = (e) => {
		const t = touch.current;
		if (!t || t.id !== e.pointerId) return;
		const index = indexAt(bar.current, e.clientX, e.clientY);
		reset();
		if (index === null) return;
		// Open the item under the finger, whether tapped or slid to
		if (items[index].to && index !== activeIndex) setOpening(index);
		bar.current.querySelector(`[data-tab-index="${index}"]`)?.click();
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
				{pressed !== null && showLabel && (
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
