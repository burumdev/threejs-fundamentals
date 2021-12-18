
import {
	MeshPhongMaterial,
	Mesh,
	Vector3,
	FrontSide,
	DoubleSide,
	PerspectiveCamera
} from 'three';

export const getMesh = (geometry, color = null, x = 0, y = 0, z = 0, name = 'Object') => {
	let material = null;
	if (color) {
		material = new MeshPhongMaterial({
			color
		});
	} else {
		material = randomMaterial(true);
	}

	const pos = new Vector3(x, y, z);
	const mesh = new Mesh(geometry, material);

	mesh.position.copy(pos);

	mesh.name = name;

	return mesh;
}

export const randomMaterial = (isDoubleSide = false) => {
	const material = new MeshPhongMaterial({
		side: isDoubleSide ? DoubleSide : FrontSide,
	});

	const hue = Math.random();
	const saturation = 1;
	const luminance = .5;
	material.color.setHSL(hue, saturation, luminance);

	return material;
}

export const collectGarbage = (obj) => {
	while (obj.children.length > 0) {
		collectGarbage(obj.children[0]);
		obj.remove(obj.children[0]);
	}

	if (obj.geometry) obj.geometry.dispose();

	if (obj.material) {
		Object.keys(obj.material).forEach(prop => {
			if (!obj.material[prop])
				return
			if (obj.material[prop] !== null && typeof obj.material[prop].dispose === 'function')
				obj.material[prop].dispose();
		});
		obj.material.dispose();
	}
}

export const resizeRendererToDisplaySize = (renderer) => {
	const canvas = renderer.domElement;
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;

	const needsResize = canvas.width !== width || canvas.height !== height;

	if (needsResize) {
		renderer.setSize(width, height, false);
	}

	return needsResize;
}

export const updateAspectRatio = (renderer, camera) => {
	const canvas = renderer.domElement;
	camera.aspect = canvas.clientWidth / canvas.clientHeight;
	camera.updateProjectionMatrix();
}

export const makeCamera = (fov = 40) => {
	const aspect = 2;
	const zNear = 0.1;
	const zFar = 1000;
	return new PerspectiveCamera(fov, aspect, zNear, zFar);
}

export const updateLight = (light, helper = null) => {
	if (light.target) {
		light.target.updateMatrixWorld();
	}
	light.shadow.camera.updateProjectionMatrix();
	if (helper) {
		helper.update();
	}
}

export const updateCamera = (camera) => {
	camera.updateProjectionMatrix();
}
