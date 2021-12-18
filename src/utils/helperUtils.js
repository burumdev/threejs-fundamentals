
import {
	AxesHelper,
	GridHelper,
	MathUtils
} from 'three';

import {
	collectGarbage
} from './gfxUtils';

// axes
export const addAxes = (objects) => {
	objects.forEach((node) => {
		if (node.type === 'Mesh') {
			const axes = new AxesHelper(10);
			axes.material.depthTest = false;
			axes.renderOrder = 1;
			node.add(axes);
		}
	});
}

export const removeAxes = (objects) => {
	objects.forEach((node) => {
		if (node.type === 'Mesh') {
			node.children.forEach(chi => {
				if (chi.type === 'AxesHelper') {
					node.remove(chi);
					collectGarbage(chi);
				}
			})
		}
	});
}

// grids
export class GridControl {
	constructor(node, units = 10) {
		const grid = new GridHelper(units, units);
		grid.material.depthTest = false;
		grid.renderOrder = 1;
		node.add(grid);

		this.grid = grid;
		this.visible = false;
	}
	get visible() {
		return this._visible;
	}
	set visible(v) {
		this._visible = v;
		this.grid.visible = v;
	}
}

export const addGridControls = (gui, node, label, units = 10) => {
	const gridControl = new GridControl(node, units);

	gui.add(gridControl, 'visible').name(label);
}

export const removeGridControls = (gui, node) => {
	node.children.forEach(chi => {
		if (chi.type === 'GridHelper') {
			node.remove(chi);
			collectGarbage(chi);
		}
	})
}

export const makeXYZGUI = (gui, vector3, name, onChangeFn) => {
	const folder = gui.addFolder(name);
	folder.add(vector3, 'x', -50, 50).onChange(onChangeFn);
	folder.add(vector3, 'y', 0, 50).onChange(onChangeFn);
	folder.add(vector3, 'z', -50, 50).onChange(onChangeFn);
	folder.open();
}

// helper classes
export class ColorGUIHelper {
	constructor(object, prop) {
		this.object = object;
		this.prop = prop;
	}
	get value() {
		return `#${this.object[this.prop].getHexString()}`;
	}
	set value(hexString) {
		this.object[this.prop].set(hexString);
	}
}

export class DegRadHelper {
	constructor(obj, prop) {
		this.obj = obj;
		this.prop = prop;
	}
	get value() {
		return MathUtils.radToDeg(this.obj[this.prop]);
	}
	set value(v) {
		this.obj[this.prop] = MathUtils.degToRad(v);
	}
}


export class MinMaxGUIHelper {
	constructor(obj, minProp, maxProp, minDif) {
		this.obj = obj;
		this.minProp = minProp;
		this.maxProp = maxProp;
		this.minDif = minDif;
	}
	get min() {
		return this.obj[this.minProp];
	}
	set min(v) {
		this.obj[this.minProp] = v;
		this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
	}
	get max() {
		return this.obj[this.maxProp];
	}
	set max(v) {
		this.obj[this.maxProp] = v;
		this.min = this.min;  // this will call the min setter
	}
}
