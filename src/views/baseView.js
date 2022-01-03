
import {
	Scene
} from 'three';

import {
	collectGarbage,
	makeCamera,
	resizeRendererToDisplaySize,
	updateAspectRatio,
} from '../utils/gfxUtils';

class BaseView {
	constructor(renderer, flags = null) {
		this.renderer = renderer;
		this.canvas = renderer.domElement;
		this.flags = flags;

		this.scene = new Scene();
		this.activeCamera = makeCamera();

		this.isLooped = false;
		this.afid = null;
		this.canAnimate = false;
		this.renderRequested = false;

		this.renderOnDemand = this.renderOnDemand.bind(this);
		this.renderFrame = this.renderFrame.bind(this);

		window.addEventListener('resize', this.renderOnDemand);
	}

	updateFlags(flags) {
		if (this.flags) {
			if (flags.showAxes !== this.flags.showAxes) {
				this.toggleAxes(flags.showAxes);
			}
			if (flags.showGridControls !== this.flags.showGridControls) {
				this.toggleGridControls(flags.showGridControls);
			}
		}
		this.flags = flags;
	}

	renderFrame(ms) {
		if (this.isLooped) {
			this.afid = requestAnimationFrame(this.renderFrame);
		}

		this.renderRequested = false;
		const time = ms * 0.001;

		if (resizeRendererToDisplaySize(this.renderer)) {
			updateAspectRatio(this.renderer, this.activeCamera);
		}
		//animate the active scene
		if (this.canAnimate) {
			this.animate(time);
		}

		if (this.controls && !this.isLooped) {
			this.controls.update();
		}
		//render it
		this.renderer.render(this.scene, this.activeCamera);
	}

	renderOnDemand() {
		if (!this.renderRequested) {
			this.renderRequested = true;
			this.afid = requestAnimationFrame(this.renderFrame);
		}
	}

	startLoop() {
		this.afid = requestAnimationFrame(this.renderFrame);
	}

	destroy() {
		if (this.afid) {
			cancelAnimationFrame(this.afid);
		}
		if (this.controls) {
			this.controls.dispose();
		}
		collectGarbage(this.scene);
		if (this.gui) {
			this.gui.destroy();
		}
	}

	toggleAxes() {
	}

	toggleGridControls() {
	}

	animate() {
	}
}

export default BaseView;
