
import {
	SphereGeometry,
	Mesh,
	MeshPhongMaterial,
	PointLight,
	Object3D,
	Group,
	LoadingManager,
	TextureLoader,
	EquirectangularReflectionMapping,
	sRGBEncoding
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
	GUI
} from 'three/examples/jsm/libs/lil-gui.module.min.js';

import {
	addAxes,
	removeAxes,
	addGridControls,
	removeGridControls
} from '../utils/helperUtils';

import BaseView from './baseView';

class Scenegraph extends BaseView {
	constructor(flags, canvas) {
		super(flags);

		this.infoElem = document.querySelector('#info');
		this.canvas = canvas;

		this.textures = {};
		this.loadManager = new LoadingManager();
		this.loadTextures();

		this.loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
			const progress = (itemsLoaded / itemsTotal) * 100;
			this.infoElem.textContent = 'Loading textures... % ' + parseInt(progress);
		};

		this.loadManager.onLoad = () => {
			this.infoElem.textContent = '';

			this.setScene();

			this.objects = [];
			this.drawObjects();

			this.canAnimate = true;

			this.toggleAxes(this.flags.showAxes);
			this.toggleGridControls(this.flags.showGridControls);
		}
	}

	loadTextures() {
		const texLoader = new TextureLoader(this.loadManager);
		const sunTex = texLoader.load('resources/textures/2k_sun.jpg');
		this.textures.sunDiffuse = sunTex;

		const earthTex = texLoader.load('resources/textures/earth.jpg');
		this.textures.earthDiffuse = earthTex;

		const skyTex = texLoader.load('resources/textures/skybox2.jpg');
		skyTex.mapping = EquirectangularReflectionMapping;
		skyTex.encoding = sRGBEncoding;

		this.textures.skyDiffuse = skyTex;
	}

	setScene() {
		this.scene.background = this.textures.skyDiffuse;

		//camera
		this.activeCamera.fov = 40;
		this.activeCamera.aspect = 2;
		this.activeCamera.near = 0.1;
		this.activeCamera.far = 1000;

		this.activeCamera.position.set(0, 10, 40);
		this.activeCamera.lookAt(0, 0, 0);

		//light
		const color = 0xFFFFFF;
		const intensity = 3;
		this.light = new PointLight(color, intensity);

		this.scene.add(this.light);

		this.controls = new OrbitControls(this.activeCamera, this.canvas);
		this.controls.target.set(0, 0, 0);
		this.controls.update();
	}

	drawObjects() {
		//the sun
		const radius = 1;
		const widthSegments = 16;
		const heightSegments = 16;

		const sphereGeo = new SphereGeometry(radius, widthSegments, heightSegments);

		const sunGeo = new SphereGeometry(radius, 30, 30);
		const sunMaterial = new MeshPhongMaterial({
			emissiveMap: this.textures.sunDiffuse,
			emissive: 0xFFFF00
		});
		const sunMesh = new Mesh(sunGeo, sunMaterial);
		sunMesh.name = 'Sun';
		sunMesh.scale.set(6, 6, 6);

		this.scene.add(sunMesh);
		this.objects.push(sunMesh);

		//mercury
		const mercuryOrbit = new Object3D();
		mercuryOrbit.name = 'Mercury Orbit';
		this.scene.add(mercuryOrbit);
		this.objects.push(mercuryOrbit);

		const mMaterial = new MeshPhongMaterial({
			color: 0x98765a,
			emissive: 0x112244
		});
		const mercuryMesh = new Mesh(sphereGeo, mMaterial);
		mercuryMesh.position.x = 9;
		mercuryMesh.name = 'Mercury';

		mercuryMesh.scale.set(.5, .5, .5);

		mercuryOrbit.add(mercuryMesh);
		this.objects.push(mercuryMesh);

		//venus
		const venusOrbit = new Object3D();
		venusOrbit.name = 'Venus Orbit';
		this.scene.add(venusOrbit);
		this.objects.push(venusOrbit);

		const vMaterial = new MeshPhongMaterial({
			color: 0x98765a,
			emissive: 0x112244
		});
		const venusMesh = new Mesh(sphereGeo, vMaterial);
		venusMesh.position.x = 13;
		venusMesh.name = 'Venus';

		venusMesh.scale.set(.9, .9, .9);

		venusOrbit.add(venusMesh);
		this.objects.push(venusMesh);

		//earth
		const earthOrbit = new Object3D();
		earthOrbit.name = 'Earth Orbit';
		this.scene.add(earthOrbit);
		this.objects.push(earthOrbit);

		const earthMaterial = new MeshPhongMaterial({
			map: this.textures.earthDiffuse,
		});
		const earthMesh = new Mesh(sphereGeo, earthMaterial);
		earthMesh.name = 'Earth';

		const earthGroup = new Group();
		earthGroup.position.x = 18;

		earthGroup.add(earthMesh);
		earthOrbit.add(earthGroup);
		this.objects.push(earthMesh);

		//moon
		const moonOrbit = new Object3D();
		moonOrbit.name = 'Moon Orbit';
		this.objects.push(moonOrbit);
		earthGroup.add(moonOrbit);

		const moonMaterial = new MeshPhongMaterial({ color: 0x888888, emissive: 0x222222 });
		const moonMesh = new Mesh(sphereGeo, moonMaterial);
		moonMesh.name = 'Moon';
		moonMesh.position.x = 2;

		moonMesh.scale.set(.4, .4, .4);

		moonOrbit.add(moonMesh);
		this.objects.push(moonMesh);

		//mars
		const marsOrbit = new Object3D();
		marsOrbit.name = 'Mars Orbit';
		this.scene.add(marsOrbit);
		this.objects.push(marsOrbit);

		const marsMaterial = new MeshPhongMaterial({
			color: 0xff503a,
			emissive: 0x631f17
		});
		const marsMesh = new Mesh(sphereGeo, marsMaterial);
		marsMesh.name = 'Mars';

		const marsGroup = new Group();
		marsGroup.position.x = 22;

		marsGroup.scale.set(.6, .6, .6);

		marsGroup.add(marsMesh);
		marsOrbit.add(marsGroup);
		this.objects.push(marsMesh);
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
				title: 'Scenegraph Grid Controls',
				container: document.getElementById('container-controls')
			});

			this.objects.forEach(obj => {
				const units = obj.name === 'Solar System' ? 25 : 10;
				addGridControls(this.gui, obj, obj.name, units);
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
		this.objects.forEach((obj) => {
			if (obj.name === 'Mercury Orbit') {
				obj.rotation.y = time * 1.2;
			} else if (obj.name === 'Venus Orbit') {
				obj.rotation.y = time * 1.1;
			} else if (obj.name === 'Mars Orbit') {
				obj.rotation.y = time * 0.9;
			} else {
				obj.rotation.y = time;
			}
		});
	}
}

export default Scenegraph;
