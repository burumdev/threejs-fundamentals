
export const getRoute = () => {
	return window.location.href.split('/').pop();
}

export const setRoute = (route) => {
	history.replaceState(null, null, route);
}

export const asArray = (obj) => {
	if (Array.isArray(obj)) {
		return obj
	} else {
		return Object.values(obj);
	}
}