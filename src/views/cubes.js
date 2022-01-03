
import {
	BoxGeometry,
	DirectionalLight,
	PointLight,
	Color
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
	GUI
} from 'three/examples/jsm/libs/lil-gui.module.min.js';

import {
	getMesh,
} from '../utils/gfxUtils';

import {
	addAxes,
	removeAxes,
	addGridControls,
	removeGridControls
} from '../utils/helperUtils';

import BaseView from './baseView';

class Cubes extends BaseView {
	constructor(renderer, flags) {
		super(renderer, flags);

		this.setScene();

		this.cubeGeometry = new BoxGeometry(1, 1, 1);

		this.drawCubes();

		this.canAnimate = true;
		this.isLooped = true;
		this.startLoop();

		this.toggleAxes(flags.showAxes);
		this.toggleGridControls(flags.showGridControls);
	}

	setScene() {
		this.scene.background = new Color(0x000000);

		this.activeCamera.fov = 75;
		this.activeCamera.aspect = 2;
		this.activeCamera.near = 0.1;
		this.activeCamera.far = 5;
		this.activeCamera.position.z = 2;

		//lights
		this.light = new DirectionalLight(0xFFFFFF, 1);
		this.light.position.set(-1, 2, 4);
		this.scene.add(this.light);

		this.pLight = new PointLight(0xFFFFFF, 1);
		this.pLight.position.set(0, 2, 0);
		this.scene.add(this.pLight);

		this.controls = new OrbitControls(this.activeCamera, this.canvas);
		this.controls.target.set(0, 0, 0);
		this.controls.update();
	}

	drawCubes() {
		this.objects = [
			getMesh(this.cubeGeometry, 0x44aa88, 0, 0, 0, 'Green Cube'),
			getMesh(this.cubeGeometry, 0x8844aa, -2, 0, 0, 'Purple Cube'),
			getMesh(this.cubeGeometry, 0xaa8844, 2, 0, 0, 'Melon Cube'),
		];

		this.objects.forEach(c => {
			this.scene.add(c);
		})
	}

	toggleAxes(show) {
		if (show) {
			addAxes(this.objects);
		} else {
			removeAxes(this.objects);
		}
	}

	toggleGridControls(show) {
		if (show) {
			this.gui = new GUI({
				title: 'Cubes Grid Controls',
				container: document.getElementById('container-controls')
			});

			this.objects.forEach(obj => {
				addGridControls(this.gui, obj, obj.name);
			})
		} else {
			if (this.gui) {
				this.objects.forEach(obj => {
					removeGridControls(this.gui, obj);
				})
				this.gui.destroy();
			}
		}
	}

	animate(time) {
		this.objects.forEach((cube, index) => {
			const speed = 1 + index * .2;
			const rot = time * speed;

			cube.rotation.x = rot;
			cube.rotation.y = rot;
		})
	}
}

export default Cubes;
