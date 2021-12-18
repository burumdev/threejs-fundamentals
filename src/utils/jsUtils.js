
export const getRoute = () => {
	const route = window.location.href.split('/').pop();
	if (['gltfloading', 'lightsncam', 'tankntarget', 'scenegraph', 'cubes', 'primitives', 'empty'].indexOf(route) !== -1) {
		return route
	} else {
		return null
	}
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