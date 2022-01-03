
import {
	Color,
	TextureLoader,
	LoadingManager,
	RepeatWrapping,
	NearestFilter,
	PlaneGeometry,
	BoxGeometry,
	SphereGeometry,
	MeshStandardMaterial,
	Mesh,
	AmbientLight,
	HemisphereLight,
	DirectionalLight,
	DirectionalLightHelper,
	PointLight,
	PointLightHelper,
	SpotLight,
	SpotLightHelper,
	MathUtils,
	Fog
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
	GUI
} from 'three/examples/jsm/libs/lil-gui.module.min.js';

import {
	addAxes,
	removeAxes,
	addGridControls,
	removeGridControls,
	ColorGUIHelper,
	makeXYZGUI,
	DegRadHelper,
	MinMaxGUIHelper
} from '../utils/helperUtils';

import {
	updateLight,
	updateCamera
} from '../utils/gfxUtils';

import {
	asArray,
} from '../utils/jsUtils';

import BaseView from './baseView';

class Lights extends BaseView {
	constructor(renderer, flags) {
		super(renderer, flags)

		this.infoElem = document.querySelector('#info');

		this.textures = {};
		this.groundSize = 120;

		this.loadManager = new LoadingManager();
		this.loadTextures();

		this.loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
			const progress = (itemsLoaded / itemsTotal) * 100;
			this.infoElem.textContent = 'Loading textures... % ' + progress;
		};

		this.loadManager.onLoad = () => {
			this.infoElem.textContent = '';

			this.lights = {};
			this.objects = {};
			this.layoutObjects = {};
			this.materials = {};
			this.positions = {};

			this.setScene();
			this.drawObjects();

			this.canAnimate = true;
			this.renderOnDemand();

			this.toggleAxes(this.flags.showAxes);
			this.toggleGridControls(this.flags.showGridControls);

			this.lightSettingsGUI();
			this.cameraSettingsGUI();
		}
	}

	loadTextures() {
		const texLoader = new TextureLoader(this.loadManager);

		this.textures.groundDiffuse = texLoader.load('resources/textures/floor-diffuse-512.jpg');
		this.textures.groundNormal = texLoader.load('resources/textures/floor-normal-512.jpg');
		this.textures.groundRoughness = texLoader.load('resources/textures/floor-rough-512.jpg');
		this.textures.groundDisplacement = texLoader.load('resources/textures/floor-height-512.jpg');

		const repeat = this.groundSize / 10;
		for (const texName of Object.keys(this.textures)) {
			const tex = this.textures[texName];
			tex.wrapS = RepeatWrapping;
			tex.wrapT = RepeatWrapping;
			tex.magFilter = NearestFilter;
			tex.repeat.set(repeat, repeat);
		}

		this.textures.suzanneDiffuse = texLoader.load('resources/textures/suzanne.jpg');
	}

	setScene() {
		this.scene.background = new Color(0x000000);

		this.activeCamera.fov = 45;
		this.activeCamera.aspect = 2;
		this.activeCamera.near = 0.1;
		this.activeCamera.far = 100;
		this.activeCamera.position.set(0, 14, 25);

		{
			const color = 0xFFFFFF;
			const intensity = 0;
			const amLight = new AmbientLight(color, intensity);
			this.scene.add(amLight);
			this.lights.amLight = amLight;
		}

		{
			const skyColor = 0xB1E1FF;  // light blue
			const groundColor = 0xB97A20;  // brownish orange
			const intensity = 0.5;
			const hemLight = new HemisphereLight(skyColor, groundColor, intensity);
			this.scene.add(hemLight);
			this.lights.hemLight = hemLight;
		}

		{
			const color = 0xFFFFFF;
			const intensity = .25;
			const light = new DirectionalLight(color, intensity);
			light.castShadow = true;
			const d = 100;

			light.shadow.camera.left = - d;
			light.shadow.camera.right = d;
			light.shadow.camera.top = d;
			light.shadow.camera.bottom = - d;

			light.position.set(0, 10, -10);
			light.target.position.set(0, 0, 6.34);
			this.scene.add(light);
			this.scene.add(light.target);
			this.lights.dirLight = light;

			this.dirLightHelper = new DirectionalLightHelper(light);
			this.scene.add(this.dirLightHelper);
			updateLight(light, this.dirLightHelper);
		}

		{
			const color = 0xFF0000;
			const intensity = .75;
			const light = new PointLight(color, intensity);
			light.position.set(-7, 10, 1.62);
			this.scene.add(light);
			this.lights.pLight = light;

			this.pLightHelper = new PointLightHelper(light);
			this.scene.add(this.pLightHelper);
			updateLight(light, this.pLightHelper);
		}

		{
			const color = 0x00FF00;
			const intensity = 1.25;
			const light = new SpotLight(color, intensity);
			light.castShadow = true;
			light.position.set(10, 10, -6.5);
			light.target.position.set(-10, 0, 6.34);
			light.penumbra = .12;
			light.angle = MathUtils.degToRad(32);
			this.scene.add(light);
			this.lights.sLight = light;

			this.sLightHelper = new SpotLightHelper(light);
			this.scene.add(this.sLightHelper);
			updateLight(light, this.sLightHelper);
		}

		this.scene.fog = new Fog('lightblue', 10, 80)
		this.controls = new OrbitControls(this.activeCamera, this.canvas);
		this.controls.target.set(0, 0, 0);

		this.controls.addEventListener('change', this.renderOnDemand);
		this.controls.update();
	}

	drawObjects() {
		const groundGeo = new PlaneGeometry(this.groundSize, this.groundSize);
		const groundMat = new MeshStandardMaterial({
			map: this.textures.groundDiffuse,
			normalMap: this.textures.groundNormal,
			roughnessMap: this.textures.groundRoughness,
			displacementMap: this.textures.groundDisplacement,
		});
		const groundMesh = new Mesh(groundGeo, groundMat);
		groundMesh.receiveShadow = true;
		groundMesh.rotation.x = Math.PI * -.5;
		this.scene.add(groundMesh);
		groundMesh.name = 'Ground';

		this.materials.ground = groundMat;
		this.objects.ground = groundMesh;

		{
			const cubeSize = 4;
			const cubeGeo = new BoxGeometry(cubeSize, cubeSize, cubeSize);
			const cubeMat = new MeshStandardMaterial({
				color: '#8AC',
				roughness: 0,
				map: this.textures.suzanneDiffuse
			});
			const mesh = new Mesh(cubeGeo, cubeMat);
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
			this.scene.add(mesh);
			mesh.name = 'Cube';

			this.materials.cube = cubeMat;
			this.objects.cube = mesh;
		}
		{
			const sphereRadius = 3;
			const sphereWidthDivisions = 32;
			const sphereHeightDivisions = 16;
			const sphereGeo = new SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
			const sphereMat = new MeshStandardMaterial({
				color: '#CA8',
				metalness: .9,
				roughness: .7,
				emissive: '#FF0000',
				emissiveIntensity: 0
			});
			const mesh = new Mesh(sphereGeo, sphereMat);
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
			this.scene.add(mesh);
			mesh.name = 'Sphere';

			this.materials.sphere = sphereMat;
			this.objects.sphere = mesh;
		}
	}

	toggleAxes(show) {
		if (show) {
			addAxes(asArray(this.objects));
		} else {
			removeAxes(asArray(this.objects));
		}
	}

	toggleGridControls(show) {
		if (show) {
			this.gui = new GUI({
				title: 'Lights & Cam Grid Controls',
				container: document.getElementById('container-controls')
			});

			asArray(this.objects).forEach(obj => {
				addGridControls(this.gui, obj, obj.name);
			})
		} else {
			if (this.gui) {
				asArray(this.objects).forEach(obj => {
					removeGridControls(this.gui, obj);
				})
				this.gui.destroy();
			}
		}
	}

	lightSettingsGUI() {
		this.liGUI = new GUI({
			title: 'Light Settings',
			container: document.getElementById('container-controls')
		}).onChange(this.renderOnDemand);
		this.liDiffuseGUI = new GUI({
			title: 'Diffuse Light',
			parent: this.liGUI
		}).close()
		this.liHemGUI = new GUI({
			title: 'Hemisphere Light',
			parent: this.liGUI
		}).close()
		this.liDirectGUI = new GUI({
			title: 'Directional Light',
			parent: this.liGUI
		}).close()
		this.liPointGUI = new GUI({
			title: 'Point Light',
			parent: this.liGUI
		}).close()
		this.liSpotGUI = new GUI({
			title: 'Spot Light',
			parent: this.liGUI
		}).close()

		this.liDiffuseGUI.addColor(new ColorGUIHelper(this.lights.amLight, 'color'), 'value').name('color');
		this.liDiffuseGUI.add(this.lights.amLight, 'intensity', 0, 2, 0.01);

		this.liHemGUI.addColor(new ColorGUIHelper(this.lights.hemLight, 'color'), 'value').name('skyColor');
		this.liHemGUI.addColor(new ColorGUIHelper(this.lights.hemLight, 'groundColor'), 'value').name('groundColor');
		this.liHemGUI.add(this.lights.hemLight, 'intensity', 0, 2, 0.01);

		this.liDirectGUI.addColor(new ColorGUIHelper(this.lights.dirLight, 'color'), 'value').name('color');
		this.liDirectGUI.add(this.lights.dirLight, 'intensity', 0, 2, 0.01);

		makeXYZGUI(
			this.liDirectGUI,
			this.lights.dirLight.position,
			'position',
			() => updateLight(this.lights.dirLight, this.dirLightHelper)
		)

		makeXYZGUI(
			this.liDirectGUI,
			this.lights.dirLight.target.position,
			'target',
			() => updateLight(this.lights.dirLight, this.dirLightHelper)
		);

		this.liPointGUI.addColor(new ColorGUIHelper(this.lights.pLight, 'color'), 'value').name('color');
		this.liPointGUI.add(this.lights.pLight, 'intensity', 0, 2, 0.01);
		this.liPointGUI.add(this.lights.pLight, 'distance', 0, 120)
			.onChange(() => updateLight(this.lights.pLight, this.pLightHelper));

		makeXYZGUI(
			this.liPointGUI,
			this.lights.pLight.position,
			'position',
			() => updateLight(this.lights.pLight, this.pLightHelper)
		);

		this.liSpotGUI.addColor(new ColorGUIHelper(this.lights.sLight, 'color'), 'value').name('color');
		this.liSpotGUI.add(this.lights.sLight, 'intensity', 0, 2, 0.01);
		this.liSpotGUI.add(new DegRadHelper(this.lights.sLight, 'angle'), 'value', 0, 90)
			.name('angle')
			.onChange(() => updateLight(this.lights.sLight, this.sLightHelper));
		this.liSpotGUI.add(this.lights.sLight, 'penumbra', 0, 1, 0.01);

		makeXYZGUI(
			this.liSpotGUI,
			this.lights.sLight.position,
			'position',
			() => updateLight(this.lights.sLight, this.sLightHelper)
		)

		makeXYZGUI(
			this.liSpotGUI,
			this.lights.sLight.target.position,
			'target',
			() => updateLight(this.lights.sLight, this.sLightHelper)
		);
	}

	cameraSettingsGUI() {
		this.camGUI = new GUI({
			title: 'Camera Settings',
			container: document.getElementById('container-controls')
		}).onChange(this.renderOnDemand);

		const camera = this.activeCamera;
		this.camGUI.add(camera, 'fov', 1, 180).onChange(() => updateCamera(camera));
		const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
		this.camGUI.add(minMaxGUIHelper, 'min', 0.1, 200, 0.1).name('near').onChange(() => updateCamera(camera));
		this.camGUI.add(minMaxGUIHelper, 'max', 0.1, 200, 0.1).name('far').onChange(() => updateCamera(camera));
	}

	destroy() {
		this.liGUI.destroy();
		this.camGUI.destroy();

		super.destroy();
	}
}

export default Lights;
