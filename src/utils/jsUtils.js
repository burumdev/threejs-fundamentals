
export const asArray = (obj) => {
	if (Array.isArray(obj)) {
		return obj
	} else {
		return Object.values(obj);
	}
}

export const loadManagerPercent = (itemsLoaded, itemsTotal) => {
	return Math.floor((itemsLoaded / itemsTotal) * 100);
}