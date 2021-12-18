
import {
	Color,
	TextureLoader,
	LoadingManager,
	RepeatWrapping,
	NearestFilter,
	PlaneGeometry,
	MeshStandardMaterial,
	Mesh,
	HemisphereLight,
	DirectionalLight,
	SpotLight,
	PointLight,
	MathUtils,
} from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

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

class GLTFLoading extends BaseView {
	constructor(flags, canvas) {
		super(flags);

		this.infoElem = document.querySelector('#info');
		this.canvas = canvas;

		this.textures = {};
		this.models = {};
		this.groundSize = 120;

		this.texLoadManager = new LoadingManager();
		this.loadTextures();
		this.modelLoadManager = new LoadingManager();
		this.loadModels();

		this.texLoadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
			const progress = (itemsLoaded / itemsTotal) * 100;
			this.infoElem.textContent = 'Loading textures... % ' + progress;
		};

		this.modelLoadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
			const progress = (itemsLoaded / itemsTotal) * 100;
			this.infoElem.textContent = 'Loading car model... % ' + progress;
		};

		this.texLoadManager.onLoad = () => {
			this.modelLoadManager.onLoad = () => {
				this.infoElem.textContent = 'Car model by mikepan CC-BY-SA. Exported as GLTF with Blender.';

				this.lights = {};
				this.objects = {};
				this.layoutObjects = {};
				this.materials = {};
				this.positions = {};

				this.setScene();
				this.drawObjects();

				this.canAnimate = true;

				this.toggleAxes(this.flags.showAxes);
				this.toggleGridControls(this.flags.showGridControls);

				this.lightSettingsGUI();
				this.cameraSettingsGUI();
				this.carSettingsGUI();
			}
		}
	}

	loadTextures() {
		const texLoader = new TextureLoader(this.texLoadManager);

		this.textures.groundDiffuse = texLoader.load('resources/textures/floor-diffuse-512.jpg');
		this.textures.groundNormal = texLoader.load('resources/textures/floor-normal-512.jpg');
		this.textures.groundRoughness = texLoader.load('resources/textures/floor-rough-512.jpg');
		this.textures.groundDisplacement = texLoader.load('resources/textures/floor-height-512.jpg');

		const repeat = this.groundSize / 2;
		for (const texName of Object.keys(this.textures)) {
			const tex = this.textures[texName];
			tex.wrapS = RepeatWrapping;
			tex.wrapT = RepeatWrapping;
			tex.magFilter = NearestFilter;
			tex.repeat.set(repeat, repeat);
		}
	}

	loadModels() {
		const gltfLoader = new GLTFLoader(this.modelLoadManager);
		const url = 'resources/models/BMW1M/BMW1M.glb';
		gltfLoader.load(url, (gltf) => {
			this.models.car = gltf.scene;
		});
	}

	setScene() {
		this.scene.background = new Color(0x000000);

		this.activeCamera.fov = 40;
		this.activeCamera.aspect = 2;
		this.activeCamera.near = 0.1;
		this.activeCamera.far = 100;
		this.activeCamera.position.set(-5, 2.5, 3);

		{
			const skyColor = 0xB1E1FF;  // light blue
			const groundColor = 0x1848b9;  // brownish orange
			const intensity = 0.05;
			const hemLight = new HemisphereLight(skyColor, groundColor, intensity);
			this.scene.add(hemLight);
			this.lights.hemLight = hemLight;
		}

		{
			const color = 0xFFFFFF;
			const intensity = .35;
			const light = new DirectionalLight(color, intensity);
			light.castShadow = true;
			const d = 100;

			light.shadow.camera.left = - d;
			light.shadow.camera.right = d;
			light.shadow.camera.top = d;
			light.shadow.camera.bottom = - d;

			light.position.set(0, 11, -10);
			light.target.position.set(0, 0, 6.34);
			this.scene.add(light);
			this.scene.add(light.target);
			this.lights.dirLight = light;
		}

		{
			const color = 0xFFFFFF;
			const intensity = .7;
			const light = new PointLight(color, intensity);
			light.position.set(4.2, 6.8, -2.4);
			this.scene.add(light);
			this.lights.pLight = light;
		}

		{
			const color = 0xFFFFFF;
			const intensity = 1.25;
			const light = new SpotLight(color, intensity);
			light.castShadow = true;

			light.position.set(28, 40, 25);
			light.target.position.set(8, 8, 5.5);
			light.penumbra = .30;
			light.angle = MathUtils.degToRad(6);
			this.scene.add(light);
			this.lights.sLight = light;
		}

		this.controls = new OrbitControls(this.activeCamera, this.canvas);
		this.controls.target.set(0, .5, 0);
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

		this.models.car.traverse(node => {
			if (node.isMesh) {
				node.castShadow = true;
			}
		})
		this.models.car.position.y = 0.15;
		this.models.car.name = 'Car';
		this.objects.car = this.models.car;
		this.scene.add(this.models.car);
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
		})
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

		makeXYZGUI(
			this.liDirectGUI,
			this.lights.dirLight.target.position,
			'target',
			() => updateLight(this.lights.dirLight, this.dirLightHelper)
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
		});

		const camera = this.activeCamera;
		this.camGUI.add(camera, 'fov', 1, 180).onChange(() => updateCamera(camera));
		const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
		this.camGUI.add(minMaxGUIHelper, 'min', 0.1, 200, 0.1).name('near').onChange(() => updateCamera(camera));
		this.camGUI.add(minMaxGUIHelper, 'max', 0.1, 200, 0.1).name('far').onChange(() => updateCamera(camera));
	}

	carSettingsGUI() {
		this.carGUI = new GUI({
			title: 'Car Settings',
			container: document.getElementById('container-controls')
		});
		const carShell = this.objects.car.getObjectByName('carShell')
		this.carGUI.addColor(new ColorGUIHelper(carShell.material, 'color'), 'value').name('Color');
		this.carGUI.add(carShell.material, 'metalness', 0, 1).name('Metalness');
		this.carGUI.add(carShell.material, 'clearcoat', 0, 1).name('Clearcoat');
		this.carGUI.add(carShell.material, 'clearcoatRoughness', 0, 1).name('CC Roughness');
	}

	destroy() {
		this.liGUI.destroy();
		this.camGUI.destroy();
		this.carGUI.destroy();

		super.destroy();
	}
}

export default GLTFLoading;
