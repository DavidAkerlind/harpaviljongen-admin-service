import React from 'react';
import {
	Assessment,
	Storage,
	Cloud,
	CheckCircle,
	Error,
	Refresh,
	Restaurant,
	LocalBar,
	Coffee,
	MenuBook,
	TrendingUp,
	CheckBox,
	Cake,
	LocalDining,
	CoffeeOutlined,
	Liquor,
	BrunchDining,
	SportsBar,
	LocalDrink,
	LocalPizza,
} from '@mui/icons-material';

export const getMenuIcon = (type) => {
	switch (type) {
		case 'wine':
			return <Liquor sx={{ color: '#8E24AA' }} />; // Wine glass icon in purple
		case 'small bubbels':
			return <LocalBar sx={{ color: '#F48FB1' }} />; // Champagne glass in pink
		case 'small beer':
			return <SportsBar sx={{ color: '#FFA726' }} />; // Beer mug in amber
		case 'small cocktails':
			return <LocalDrink sx={{ color: '#EF5350' }} />; // Cocktail glass in red
		case 'small snack':
			return <LocalPizza sx={{ color: '#66BB6A' }} />; // Snack icon in green
		case 'sweets':
			return <Cake sx={{ color: '#EC407A' }} />; // Cake icon in pink
		case 'lunch':
			return <BrunchDining sx={{ color: '#26C6DA' }} />; // Lunch icon in cyan
		case 'all':
			return <LocalDining sx={{ color: '#42A5F5' }} />; // Restaurant icon in blue
		case 'coffee':
			return <LocalCafe sx={{ color: '#8D6E63' }} />; // Coffee icon in brown
		default:
			return <Restaurant sx={{ color: '#78909C' }} />; // Default in grey
	}
};
