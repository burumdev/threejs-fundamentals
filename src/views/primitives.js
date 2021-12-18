
import {
	BoxGeometry,
	CircleGeometry,
	ConeGeometry,
	CylinderGeometry,
	DodecahedronGeometry,
	Shape,
	ExtrudeGeometry,
	IcosahedronGeometry,
	LatheGeometry,
	OctahedronGeometry,
	PlaneGeometry,
	PolyhedronGeometry,
	RingGeometry,
	ShapeGeometry,
	SphereGeometry,
	TetrahedronGeometry,
	Object3D,
	TorusGeometry,
	TorusKnotGeometry,
	Curve,
	Vector3,
	Vector2,
	TubeGeometry,
	EdgesGeometry,
	WireframeGeometry,
	DirectionalLight,
	Color,
	LineBasicMaterial,
	LineSegments
} from 'three';

import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

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

class Primitives extends BaseView {
	constructor(flags, canvas) {
		super(flags);

		this.canvas = canvas;
		this.setScene();

		this.objects = [];
		this.spread = 15;

		this.drawObjects();

		this.canAnimate = true;

		this.toggleAxes(flags.showAxes);
		this.toggleGridControls(flags.showGridControls);
	}

	setScene() {
		this.scene.background = new Color(0x222222);

		//camera
		this.activeCamera.fov = 40;
		this.activeCamera.aspect = 2;
		this.activeCamera.near = 0.1;
		this.activeCamera.far = 1000;
		this.activeCamera.position.z = 120;

		//light
		this.lights = {
			left: null,
			right: null
		};
		const left = new DirectionalLight(0xFFFFFF, .5);
		left.position.set(-1, 2, 4);
		this.scene.add(left);
		this.lights.left = left;

		const right = new DirectionalLight(0xFFFFFF, .5);
		right.position.set(1, 2, 4);
		this.scene.add(right);
		this.lights.right = right;

		this.controls = new OrbitControls(this.activeCamera, this.canvas);
		this.controls.target.set(0, 0, 0);
		this.controls.update();
	}

	addObject(x, y, obj) {
		obj.position.x = x * this.spread;
		obj.position.y = y * this.spread;

		this.scene.add(obj);
		this.objects.push(obj);
	}

	addSolidGeometry(x, y, geometry, name = 'Unknown Object') {
		const mesh = getMesh(geometry, null, x, y, 0);
		mesh.name = name;
		this.addObject(x, y, mesh);
	}

	addLineGeometry(x, y, geometry, name = 'Unknown Object') {
		const material = new LineBasicMaterial({ color: 0xFFFFFF });
		const mesh = new LineSegments(geometry, material);
		mesh.name = name;
		this.addObject(x, y, mesh);
	}

	drawObjects() {
		{
			const width = 8;
			const height = 8;
			const depth = 8;
			this.addSolidGeometry(-2, 2, new BoxGeometry(width, height, depth), 'Cube');
		}
		{
			const radius = 7;
			const segments = 24;
			this.addSolidGeometry(-1, 2, new CircleGeometry(radius, segments), 'Circle');
		}
		{
			const radius = 6;
			const height = 8;
			const segments = 16;
			this.addSolidGeometry(0, 2, new ConeGeometry(radius, height, segments), 'Cone');
		}
		{
			const radiusTop = 4;
			const radiusBottom = 4;
			const height = 8;
			const radialSegments = 12;
			this.addSolidGeometry(1, 2, new CylinderGeometry(radiusTop, radiusBottom, height, radialSegments), 'Cylinder');
		}
		{
			const radius = 7;
			this.addSolidGeometry(2, 2, new DodecahedronGeometry(radius), 'Dodecahedron');
		}
		{
			const shape = new Shape();
			const x = -2.5;
			const y = -5;
			shape.moveTo(x + 2.5, y + 2.5);
			shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
			shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
			shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
			shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
			shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
			shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

			const extrudeSettings = {
				steps: 2,
				depth: 2,
				bevelEnabled: true,
				bevelThickness: 1,
				bevelSize: 1,
				bevelSegments: 2,
			};

			this.addSolidGeometry(-2, 1, new ExtrudeGeometry(shape, extrudeSettings), 'Extruded Heart');
		}
		{
			const radius = 7;
			this.addSolidGeometry(-1, 1, new IcosahedronGeometry(radius), 'Icosahedron');
		}
		{
			const points = [];
			for (let i = 0; i < 10; ++i) {
				points.push(new Vector2(Math.sin(i * 0.2) * 3 + 3, (i - 5) * .8));
			}
			this.addSolidGeometry(0, 1, new LatheGeometry(points), 'Lathe');
		}
		{
			const radius = 7;
			this.addSolidGeometry(1, 1, new OctahedronGeometry(radius), 'Octahedron');
		}
		{
			/*
			from: https://github.com/mrdoob/js/blob/b8d8a8625465bd634aa68e5846354d69f34d2ff5/examples/js/ParametricGeometries.js
		
			The MIT License
		
			Copyright © 2010-2018 js authors
		
			Permission is hereby granted, free of charge, to any person obtaining a copy
			of this software and associated documentation files (the "Software"), to deal
			in the Software without restriction, including without limitation the rights
			to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
			copies of the Software, and to permit persons to whom the Software is
			furnished to do so, subject to the following conditions:
		
			The above copyright notice and this permission notice shall be included in
			all copies or substantial portions of the Software.
		
			THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
			IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
			FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
			AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
			LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
			OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
			THE SOFTWARE.
		
			*/
			function klein(v, u, target) {
				u *= Math.PI;
				v *= 2 * Math.PI;
				u = u * 2;

				let x;
				let z;

				if (u < Math.PI) {
					x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(u) * Math.cos(v);
					z = -8 * Math.sin(u) - 2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v);
				} else {
					x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(v + Math.PI);
					z = -8 * Math.sin(u);
				}

				const y = -2 * (1 - Math.cos(u) / 2) * Math.sin(v);

				target.set(x, y, z).multiplyScalar(0.75);
			}

			const slices = 25;
			const stacks = 25;
			this.addSolidGeometry(2, 1, new ParametricGeometry(klein, slices, stacks), 'Klein');
		}
		{
			const width = 9;
			const height = 9;
			const widthSegments = 2;
			const heightSegments = 2;
			this.addSolidGeometry(-2, 0, new PlaneGeometry(width, height, widthSegments, heightSegments), 'Plane');
		}
		{
			const verticesOfCube = [
				-1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,
				-1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
			];
			const indicesOfFaces = [
				2, 1, 0, 0, 3, 2,
				0, 4, 7, 7, 3, 0,
				0, 1, 5, 5, 4, 0,
				1, 2, 6, 6, 5, 1,
				2, 3, 7, 7, 6, 2,
				4, 5, 6, 6, 7, 4,
			];
			const radius = 7;
			const detail = 2;
			this.addSolidGeometry(-1, 0, new PolyhedronGeometry(verticesOfCube, indicesOfFaces, radius, detail), 'Polyhedron');
		}
		{
			const innerRadius = 2;
			const outerRadius = 7;
			const segments = 18;
			this.addSolidGeometry(0, 0, new RingGeometry(innerRadius, outerRadius, segments), 'Ring');
		}
		{
			const shape = new Shape();
			const x = -2.5;
			const y = -5;
			shape.moveTo(x + 2.5, y + 2.5);
			shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
			shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
			shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
			shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
			shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
			shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

			this.addSolidGeometry(1, 0, new ShapeGeometry(shape), 'Bezier Heart');
		}
		{
			const radius = 7;
			const widthSegments = 12;
			const heightSegments = 8;
			this.addSolidGeometry(2, 0, new SphereGeometry(radius, widthSegments, heightSegments), 'Sphere');
		}
		{
			const radius = 7;
			this.addSolidGeometry(-2, -1, new TetrahedronGeometry(radius), 'Tetrahedron');
		}
		{
			const loader = new FontLoader();

			loader.load('resources/fonts/helvetiker_regular.typeface.json', font => {
				const geometry = new TextGeometry('HELLO!', {
					font: font,
					size: 3.0,
					height: .2,
					curveSegments: 12,
					bevelEnabled: true,
					bevelThickness: 0.15,
					bevelSize: .3,
					bevelSegments: 5,
				});
				const mesh = getMesh(geometry, null, 0, 0, 0);
				geometry.computeBoundingBox();
				geometry.boundingBox.getCenter(mesh.position).multiplyScalar(-1);

				const parent = new Object3D();
				parent.name = 'Text';
				parent.add(mesh);

				this.addObject(-1, -1, parent);
			});
		}

		{
			const radius = 5;
			const tubeRadius = 2;
			const radialSegments = 8;
			const tubularSegments = 24;
			this.addSolidGeometry(0, -1, new TorusGeometry(radius, tubeRadius, radialSegments, tubularSegments), 'Torus');
		}
		{
			const radius = 3.5;
			const tube = 1.5;
			const radialSegments = 8;
			const tubularSegments = 64;
			const p = 2;
			const q = 3;
			this.addSolidGeometry(1, -1, new TorusKnotGeometry(radius, tube, tubularSegments, radialSegments, p, q), 'Torus Knot');
		}
		{
			class CustomSinCurve extends Curve {
				constructor(scale) {
					super();
					this.scale = scale;
				}
				getPoint(t) {
					const tx = t * 3 - 1.5;
					const ty = Math.sin(2 * Math.PI * t);
					const tz = 0;
					return new Vector3(tx, ty, tz).multiplyScalar(this.scale);
				}
			}

			const path = new CustomSinCurve(4);
			const tubularSegments = 20;
			const radius = 1;
			const radialSegments = 8;
			const closed = false;
			this.addSolidGeometry(2, -1, new TubeGeometry(path, tubularSegments, radius, radialSegments, closed), 'Tube');
		}
		{
			const width = 8;
			const height = 8;
			const depth = 8;
			const thresholdAngle = 15;
			this.addLineGeometry(-1, -2, new EdgesGeometry(
				new BoxGeometry(width, height, depth),
				thresholdAngle), 'Line Cube');
		}
		{
			const width = 8;
			const height = 8;
			const depth = 8;
			this.addLineGeometry(1, -2, new WireframeGeometry(new BoxGeometry(width, height, depth)), 'Wireframe Cube');
		}
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
				title: 'Primitives Grid Controls',
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
		this.objects.forEach((obj, index) => {
			const speed = .1 + index * .1;
			const rot = time * speed;
			obj.rotation.x = rot;
			obj.rotation.y = rot;
		});
	}
}

export default Primitives;
