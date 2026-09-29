import { useLayoutEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import RubberSegment from './reactbits/RubberSegment';
import { brand } from '../theme';
import './segment.css';

// A choice between a few options (RubberSegment) in the admin's colours: the green thumb
// slides, stretches and settles on the chosen one, and can be dragged. items: strings or
// { value, label, icon }. fullWidth: the options share the width. When they don't fit
// (many menus on a phone) the row scrolls sideways instead, and the thumb isn't draggable.
export function Segment({ items, value, onChange, label, size = 'md', fullWidth = false, sx }) {
	const scroller = useRef(null);
	const [overflowing, setOverflowing] = useState(false);

	useLayoutEffect(() => {
		const el = scroller.current;
		if (!el) return undefined;
		const check = () => setOverflowing(el.scrollWidth > el.clientWidth + 1);
		check();
		const observer = new ResizeObserver(check);
		observer.observe(el);
		if (el.firstElementChild) observer.observe(el.firstElementChild);
		return () => observer.disconnect();
	}, []);

	return (
		<Box
			ref={scroller}
			className={`segment${overflowing ? ' segment--overflowing' : ''}${fullWidth ? ' segment--full' : ''}`}
			sx={sx}>
			<RubberSegment
				items={items}
				value={value}
				onChange={onChange}
				aria-label={label}
				size={size}
				trackColor={brand.sageLight}
				thumbColor={brand.green}
				textColor={brand.green}
				activeTextColor="#ffffff"
				radius={size === 'lg' ? 14 : 12}
				inset={4}
				draggable={!overflowing}
			/>
		</Box>
	);
}
