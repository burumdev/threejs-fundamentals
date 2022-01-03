
import {
	Scene
} from 'three';

import {
	collectGarbage,
	makeCamera
} from '../utils/gfxUtils';

class BaseView {
	constructor(flags = null) {
		this.scene = new Scene();
		this.activeCamera = makeCamera();
		this.flags = flags;
		this.canAnimate = false;

		this.hasPostProcess = false;
		this.postProcess = {
			bloom: false
		}
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

	destroy() {
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
