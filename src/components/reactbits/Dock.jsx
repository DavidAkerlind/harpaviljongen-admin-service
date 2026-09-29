// React Bits Dock (https://reactbits.dev/components/dock), JS-CSS variant.
// Changed for the admin's bar at the bottom of a phone:
// - the items are links (to) or buttons (onClick), and the current page's item is marked (active)
// - a finger magnifies too: slide along the dock to see the names, lift it to open that page
// - the icon grows with its tile, and the panel keeps its height (it's fixed to the bottom)
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import './Dock.css';

const MotionLink = motion.create(Link);
const TAP_SLOP = 8; // px a finger can move and still count as a tap

function DockItem({ item, index, mouseX, spring, distance, magnification, baseItemSize, touched }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  const mouseDistance = useTransform(mouseX, val => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(targetSize, spring);
  const iconSize = useTransform(size, s => s * 0.48);

  const props = {
    ref,
    style: { width: size, height: size },
    className: `dock-item${item.active ? ' dock-item--active' : ''}`,
    'aria-label': item.label,
    'data-dock-index': index,
    onHoverStart: () => setHovered(true),
    onHoverEnd: () => setHovered(false),
    // Keyboard focus only: a tapped link keeps its focus, and its name shouldn't stay up
    onFocus: e => {
      try {
        if (e.currentTarget.matches(':focus-visible')) setHovered(true);
      } catch {}
    },
    onBlur: () => setHovered(false)
  };
  const content = (
    <>
      <motion.div className="dock-icon" style={{ fontSize: iconSize }}>
        {item.icon}
      </motion.div>
      <DockLabel visible={hovered || touched}>{item.label}</DockLabel>
    </>
  );

  return item.to ? (
    <MotionLink to={item.to} aria-current={item.active ? 'page' : undefined} {...props}>
      {content}
    </MotionLink>
  ) : (
    <motion.button type="button" onClick={item.onClick} aria-haspopup={item.haspopup} {...props}>
      {content}
    </motion.button>
  );
}

function DockLabel({ children, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className="dock-label"
          aria-hidden="true"
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// The item under a point on the screen, as its index
function indexAt(x, y) {
  const el = document.elementFromPoint(x, y)?.closest('[data-dock-index]');
  return el ? Number(el.dataset.dockIndex) : null;
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 68,
  baseItemSize = 50,
  label = 'Application dock'
}) {
  const mouseX = useMotionValue(Infinity);
  const panel = useRef(null);
  const touch = useRef(null);
  const [touchedIndex, setTouchedIndex] = useState(null);

  const reset = () => {
    touch.current = null;
    mouseX.set(Infinity);
    setTouchedIndex(null);
  };

  const onPointerDown = e => {
    if (e.pointerType === 'mouse') return;
    // Let the events follow the finger from item to item
    try {
      e.target.releasePointerCapture?.(e.pointerId);
    } catch {}
    const index = indexAt(e.clientX, e.clientY);
    touch.current = { id: e.pointerId, x0: e.clientX, start: index, moved: false };
    mouseX.set(e.clientX);
    setTouchedIndex(index);
  };

  const onPointerMove = e => {
    if (e.pointerType === 'mouse') {
      mouseX.set(e.clientX);
      return;
    }
    const t = touch.current;
    if (!t || t.id !== e.pointerId) return;
    if (Math.abs(e.clientX - t.x0) > TAP_SLOP) t.moved = true;
    mouseX.set(e.clientX);
    setTouchedIndex(indexAt(e.clientX, e.clientY));
  };

  const onPointerUp = e => {
    const t = touch.current;
    if (e.pointerType === 'mouse' || !t || t.id !== e.pointerId) return;
    const index = indexAt(e.clientX, e.clientY);
    reset();
    // A tap clicks by itself; after sliding to another item, open the one under the finger
    if (t.moved && index !== null && index !== t.start) {
      panel.current?.querySelector(`[data-dock-index="${index}"]`)?.click();
    }
  };

  return (
    <motion.div
      ref={panel}
      onPointerMove={onPointerMove}
      onPointerLeave={e => e.pointerType === 'mouse' && reset()}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={reset}
      className={`dock-panel ${className}`}
      style={{ height: panelHeight }}
      role="navigation"
      aria-label={label}
    >
      {items.map((item, index) => (
        <DockItem
          key={item.key ?? index}
          item={item}
          index={index}
          mouseX={mouseX}
          spring={spring}
          distance={distance}
          magnification={magnification}
          baseItemSize={baseItemSize}
          touched={touchedIndex === index}
        />
      ))}
    </motion.div>
  );
}
