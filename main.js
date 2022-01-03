
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
			activeView = new GLTFLoading(renderer, flags);
			break;
		case 'lightsncam':
			activeView = new Lights(renderer, flags);
			break;
		case 'tankntarget':
			activeView = new TankNTarget(renderer, flags);
			break;
		case 'scenegraph':
			activeView = new Scenegraph(renderer, flags);
			break;
		case 'cubes':
			activeView = new Cubes(renderer, flags);
			break;
		case 'primitives':
			activeView = new Primitives(renderer, flags);
			break;
		case 'empty':
			activeView = new Empty(renderer, flags);
			break;
		default:
			break;
	}
	activateButton(document.getElementById(id));
}

//set initial view
switchView('gltfloading');

//events
buttons.forEach(btn => {
	btn.addEventListener('click', (e) => {
		const { id } = e.target;
		const button = document.getElementById(id);

		activateButton(button);

		if (activeView) {
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