import { useCallback, useState } from 'react';

// Size of an element that follows window and layout changes. Returns [ref, { width, height }].
export function useSize() {
	const [size, setSize] = useState({ width: 0, height: 0 });
	const [observer] = useState(() =>
		typeof ResizeObserver === 'undefined'
			? null
			: new ResizeObserver(([entry]) =>
					setSize({
						width: Math.floor(entry.contentRect.width),
						height: Math.floor(entry.contentRect.height),
					})
				)
	);

	const ref = useCallback(
		(node) => {
			observer?.disconnect();
			if (node) {
				const rect = node.getBoundingClientRect();
				setSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
				observer?.observe(node);
			}
		},
		[observer]
	);

	return [ref, size];
}
