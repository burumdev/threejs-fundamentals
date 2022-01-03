
import {
	WebGLRenderer,
	PCFSoftShadowMap,
} from 'three';

import {
	Empty,
	Cubes,
	Primitives,
	Scenegraph,
	TankNTarget,
	Lights,
	GLTFLoading
} from './src/views';

import {
	resizeRendererToDisplaySize,
	updateAspectRatio,
} from './src/utils/gfxUtils';

//flags
let flags = {
	showAxes: false,
	showGridControls: false
}

//buttons
const buttons = document.querySelectorAll('.nav-buttons button');

//init renderer
const canvas = document.querySelector('#canvas-threejs');
const renderer = new WebGLRenderer({
	canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.antialias = true;
renderer.setPixelRatio(window.devicePixelRatio);

//init active view
let activeView = null;

//funcs
const activateButton = (activeButton) => {
	buttons.forEach(but => {
		but.classList.remove('active');
	});
	activeButton.classList.add('active');
}

const switchView = (id) => {
	document.querySelector('#info').textContent = '';
	switch (id) {
		case 'gltfloading':
			activeView = new GLTFLoading(flags, canvas);
			break;
		case 'lightsncam':
			activeView = new Lights(flags, canvas);
			break;
		case 'tankntarget':
			activeView = new TankNTarget(flags, canvas);
			break;
		case 'scenegraph':
			activeView = new Scenegraph(flags, canvas);
			break;
		case 'cubes':
			activeView = new Cubes(flags, canvas);
			break;
		case 'primitives':
			activeView = new Primitives(flags, canvas);
			break;
		case 'empty':
			activeView = new Empty(flags);
			break;
		default:
			break;
	}
	activateButton(document.getElementById(id));
}

//set initial view
switchView('gltfloading');

const renderLoop = (ms) => {
	const time = ms * 0.001;

	if (activeView) {
		//adjust view to resized window
		if (resizeRendererToDisplaySize(renderer)) {
			updateAspectRatio(renderer, activeView.activeCamera);
		}
		//animate the active scene
		if (activeView.canAnimate) {
			activeView.animate(time);
		}
		//render it
		renderer.render(activeView.scene, activeView.activeCamera);
	}

	requestAnimationFrame(renderLoop);
}

//init main loop
requestAnimationFrame(renderLoop);

//events
buttons.forEach(btn => {
	btn.addEventListener('click', (e) => {
		const { id } = e.target;
		const button = document.getElementById(id);

		activateButton(button);

		if (activeView) {
			updateAspectRatio(renderer, activeView.activeCamera);
			activeView.destroy();
		}

		switchView(id);
	});
});

document.getElementById('show-axes').addEventListener('click', () => {
	flags = {
		...flags,
		showAxes: !flags.showAxes
	};
	activeView.updateFlags(flags);
});

document.getElementById('show-grid-controls').addEventListener('click', () => {
	flags = {
		...flags,
		showGridControls: !flags.showGridControls
	};
	activeView.updateFlags(flags);
});


// mobile warning
if (screen.width < 1024) {
	alert('This demo is not designed to be viewed from a mobile device. Please use a widescreen monitor for best results.')
}