
import {
	DirectionalLight,
	PlaneGeometry,
	MeshPhongMaterial,
	MeshStandardMaterial,
	Mesh,
	Object3D,
	BoxGeometry,
	CylinderGeometry,
	SphereGeometry,
	SplineCurve,
	Vector2,
	Vector3,
	BufferGeometry,
	LineBasicMaterial,
	Line,
	TextureLoader,
	LoadingManager,
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

import {
	makeCamera
} from '../utils/gfxUtils';

import {
	asArray,
} from '../utils/jsUtils';

import BaseView from './baseView';

class TankNTarget extends BaseView {
	constructor(flags, canvas) {
		super(flags);
		this.infoElem = document.querySelector('#info');

		this.canvas = canvas;
		this.textures = {};

		this.loadManager = new LoadingManager();
		this.loadTextures();

		this.loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
			const progress = (itemsLoaded / itemsTotal) * 100;
			this.infoElem.textContent = 'Loading textures... % ' + progress;
		};

		this.loadManager.onLoad = () => {
			this.infoElem.textContent = '';
			this.lights = [];

			this.objects = {};
			this.layoutObjects = {};
			this.materials = {};
			this.positions = {};
			this.cameras = {};

			this.setScene();

			this.drawObjects();

			this.canAnimate = true;

			this.toggleAxes(this.flags.showAxes);
			this.toggleGridControls(this.flags.showGridControls);
		}
	}

	loadTextures() {
		const texLoader = new TextureLoader(this.loadManager);

		const skyTex = texLoader.load('resources/textures/skybox2.jpg');
		skyTex.mapping = EquirectangularReflectionMapping;
		skyTex.encoding = sRGBEncoding;

		this.textures.skyDiffuse = skyTex;

		this.textures.groundDiffuse = texLoader.load('resources/textures/dry_ground_01_diff_1k.jpg');
		this.textures.groundDisplacement = texLoader.load('resources/textures/dry_ground_01_disp_1k.png');
		this.textures.groundNormal = texLoader.load('resources/textures/dry_ground_01_nor_gl_1k.jpg');
		this.textures.groundRoughness = texLoader.load('resources/textures/dry_ground_01_rough_1k.jpg');
	}

	setScene() {
		this.scene.background = this.textures.skyDiffuse;

		this.activeCamera.position.set(8, 4, 10).multiplyScalar(3);
		this.activeCamera.lookAt(0, 0, 0);

		{
			const light = new DirectionalLight(0xffffff, 1);
			light.position.set(0, 20, 0);
			this.scene.add(light);
			this.lights.push(light);
			light.castShadow = true;
			light.shadow.mapSize.width = 2048;
			light.shadow.mapSize.height = 2048;

			const d = 50;
			light.shadow.camera.left = -d;
			light.shadow.camera.right = d;
			light.shadow.camera.top = d;
			light.shadow.camera.bottom = -d;
			light.shadow.camera.near = 1;
			light.shadow.camera.far = 50;
			light.shadow.bias = 0.001;
		}

		{
			const light = new DirectionalLight(0xffffff, 1);
			light.position.set(1, 2, 4);
			this.scene.add(light);
			this.lights.push(light);
		}

		this.controls = new OrbitControls(this.activeCamera, this.canvas);
		this.controls.target.set(0, 0, 0);
		this.controls.update();
	}

	drawObjects() {
		const groundGeometry = new PlaneGeometry(50, 50, 1024, 1024);
		const groundMaterial = new MeshStandardMaterial(
			{
				map: this.textures.groundDiffuse,
				normalMap: this.textures.groundNormal,
				displacementMap: this.textures.groundDisplacement,
				displacementScale: 0.5,
				roughnessMap: this.textures.groundRoughness
			}
		);
		const groundMesh = new Mesh(groundGeometry, groundMaterial);
		groundMesh.rotation.x = Math.PI * -.5;
		groundMesh.receiveShadow = true;
		groundMesh.name = 'Ground';
		this.scene.add(groundMesh);
		this.objects.groundMesh = groundMesh;

		const carWidth = 4;
		const carHeight = 1;
		const carLength = 8;

		const tank = new Object3D();
		tank.name = 'Tank';
		this.scene.add(tank);

		const bodyGeometry = new BoxGeometry(carWidth, carHeight, carLength);
		const bodyMaterial = new MeshStandardMaterial({
			color: 0x6688AA,
			metalness: .8,
			roughness: 0.1,
			envMap: this.textures.skyDiffuse
		});
		const bodyMesh = new Mesh(bodyGeometry, bodyMaterial);
		bodyMesh.position.y = 1.4;
		bodyMesh.castShadow = true;
		tank.add(bodyMesh);
		this.objects.tank = tank;

		const tankCameraFov = 75;
		const tankCamera = makeCamera(tankCameraFov);
		tankCamera.position.y = 3;
		tankCamera.position.z = -6;
		tankCamera.rotation.y = Math.PI;
		bodyMesh.add(tankCamera);
		this.cameras.tankCamera = tankCamera;

		const wheelRadius = 1;
		const wheelThickness = .5;
		const wheelSegments = 12;
		const wheelGeometry = new CylinderGeometry(
			wheelRadius,     // top radius
			wheelRadius,     // bottom radius
			wheelThickness,  // height of cylinder
			wheelSegments);
		const wheelMaterial = new MeshPhongMaterial({ color: 0x888888 });
		const wheelPositions = [
			[-carWidth / 2 - wheelThickness / 2, -carHeight / 2, carLength / 3],
			[carWidth / 2 + wheelThickness / 2, -carHeight / 2, carLength / 3],
			[-carWidth / 2 - wheelThickness / 2, -carHeight / 2, 0],
			[carWidth / 2 + wheelThickness / 2, -carHeight / 2, 0],
			[-carWidth / 2 - wheelThickness / 2, -carHeight / 2, -carLength / 3],
			[carWidth / 2 + wheelThickness / 2, -carHeight / 2, -carLength / 3],
		];
		const wheelMeshes = wheelPositions.map((position, index) => {
			const mesh = new Mesh(wheelGeometry, wheelMaterial);
			mesh.position.set(...position);
			mesh.rotation.z = Math.PI * .5;
			mesh.castShadow = true;
			bodyMesh.add(mesh);
			mesh.name = 'Wheel No. ' + (index + 1);
			this.objects['wheel' + (index)] = mesh;
			return mesh;
		});

		const domeRadius = 2;
		const domeWidthSubdivisions = 12;
		const domeHeightSubdivisions = 12;
		const domePhiStart = 0;
		const domePhiEnd = Math.PI * 2;
		const domeThetaStart = 0;
		const domeThetaEnd = Math.PI * .5;
		const domeGeometry = new SphereGeometry(
			domeRadius, domeWidthSubdivisions, domeHeightSubdivisions,
			domePhiStart, domePhiEnd, domeThetaStart, domeThetaEnd);
		const domeMesh = new Mesh(domeGeometry, bodyMaterial);
		domeMesh.castShadow = true;
		bodyMesh.add(domeMesh);
		this.objects.domeMesh = domeMesh;
		domeMesh.name = 'Turret Dome';
		domeMesh.position.y = .5;

		const turretRadiusTop = .03;
		const turretRadiusBottom = .07;
		const turretLength = carLength * .75 * .2;
		const turretGeometry = new CylinderGeometry(
			turretRadiusTop,
			turretRadiusBottom,
			turretLength,
			32
		);
		const turretMesh = new Mesh(turretGeometry, bodyMaterial);
		turretMesh.rotation.x = Math.PI / 2;

		const turretPivot = new Object3D();
		turretMesh.castShadow = true;
		turretPivot.scale.set(5, 5, 5);
		turretPivot.position.y = .5;
		turretMesh.position.z = turretLength * .5;
		turretPivot.add(turretMesh);
		this.layoutObjects.turretPivot = turretPivot;
		this.objects.turretMesh = turretMesh;
		turretMesh.name = 'Turret Pivot';
		bodyMesh.add(turretPivot);

		const turretCamera = makeCamera();
		turretCamera.position.y = .75 * .2;
		turretMesh.add(turretCamera);
		this.cameras.turretCamera = turretCamera;

		const targetGeometry = new SphereGeometry(.5, 6, 3);
		const targetMaterial = new MeshPhongMaterial({ color: 0x00FF00, flatShading: true });
		this.materials.targetMaterial = targetMaterial;
		const targetMesh = new Mesh(targetGeometry, targetMaterial);
		const targetOrbit = new Object3D();
		const targetElevation = new Object3D();
		const targetBob = new Object3D();
		targetMesh.castShadow = true;
		this.scene.add(targetOrbit);
		this.objects.targetMesh = targetMesh;
		targetMesh.name = 'Target';
		this.layoutObjects.targetOrbit = targetOrbit;

		targetOrbit.add(targetElevation);
		targetElevation.position.z = carLength * 2;
		targetElevation.position.y = 8;
		targetElevation.add(targetBob);
		targetBob.add(targetMesh);
		this.layoutObjects.targetBob = targetBob;

		const targetCamera = makeCamera();
		const targetCameraPivot = new Object3D();
		this.layoutObjects.targetCameraPivot = targetCameraPivot;

		targetCamera.position.y = 1;
		targetCamera.position.z = -2;
		targetCamera.rotation.y = Math.PI;
		targetBob.add(targetCameraPivot);
		targetCameraPivot.add(targetCamera);
		this.cameras.targetCamera = targetCamera;

		// Create a sine-like wave
		const curve = new SplineCurve([
			new Vector2(-10, 0),
			new Vector2(-5, 5),
			new Vector2(0, 0),
			new Vector2(5, -5),
			new Vector2(10, 0),
			new Vector2(5, 10),
			new Vector2(-5, 10),
			new Vector2(-10, -10),
			new Vector2(-15, -8),
			new Vector2(-10, 0),
		]);

		this.layoutObjects.curve = curve;

		const points = curve.getPoints(50);
		const geometry = new BufferGeometry().setFromPoints(points);
		const material = new LineBasicMaterial({ color: 0xff0000 });
		const splineObject = new Line(geometry, material);
		splineObject.rotation.x = Math.PI * .5;
		splineObject.position.y = 0.25;
		this.scene.add(splineObject);

		this.positions.targetPosition = new Vector3();
		this.positions.tankPosition = new Vector2();
		this.positions.tankTarget = new Vector2();

		this.cameras = {
			default: { cam: this.activeCamera, desc: 'detached camera' },
			turretCamera: { cam: turretCamera, desc: 'on turret looking at target' },
			targetCamera: { cam: targetCamera, desc: 'near target looking at tank' },
			tankCamera: { cam: tankCamera, desc: 'above back of tank' },
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
				title: 'T & T Grid Controls',
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

	animate(time) {
		const { objects, layoutObjects, materials, cameras, positions } = this;

		time = time * .5;

		// move target
		layoutObjects.targetOrbit.rotation.y = time * .27;
		layoutObjects.targetBob.position.y = Math.sin(time * 2) * 4;
		objects.targetMesh.rotation.x = time * 7;
		objects.targetMesh.rotation.y = time * 13;
		materials.targetMaterial.emissive.setHSL(time * 10 % 1, 1, .25);
		materials.targetMaterial.color.setHSL(time * 10 % 1, 1, .25);

		// move tank
		const tankTime = time * .05;
		layoutObjects.curve.getPointAt(tankTime % 1, positions.tankPosition);
		layoutObjects.curve.getPointAt((tankTime + 0.01) % 1, positions.tankTarget);
		objects.tank.position.set(positions.tankPosition.x, 0, positions.tankPosition.y);
		objects.tank.lookAt(positions.tankTarget.x, 0, positions.tankTarget.y);

		// face turret at target
		objects.targetMesh.getWorldPosition(positions.targetPosition);
		layoutObjects.turretPivot.lookAt(positions.targetPosition);

		// make the turretCamera look at target
		cameras.turretCamera.cam.lookAt(positions.targetPosition);

		// make the targetCameraPivot look at the tank
		objects.tank.getWorldPosition(positions.targetPosition);
		layoutObjects.targetCameraPivot.lookAt(positions.targetPosition);

		for (let i = 0; i < 6; i++) {
			objects['wheel' + i].rotation.x = time * 3;
		}

		const cams = Object.values(cameras);
		const newCam = cams[time * .25 % cams.length | 0];
		this.activeCamera = newCam.cam;
		this.infoElem.textContent = 'Camera: ' + newCam.desc;
	}
}

export default TankNTarget;
