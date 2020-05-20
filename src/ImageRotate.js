import defaultsDeep from "lodash/defaultsDeep";
import DefaultOptions from "./DefaultOptions";
import { Toolbar } from "./modules/Toolbar";

const knownModules = { Toolbar };

/**
 * Custom module for quilljs to allow user to rotate <img> elements
 * (Works on Chrome, Edge, Safari and replaces Firefox's native rotate behavior)
 * @see https://quilljs.com/blog/building-a-custom-module/
 */
export default class ImageRotate {
	constructor(quill, options = {}) {
		// save the quill reference and options
		this.quill = quill;

		// Apply the options to our defaults, and stash them for later
		// defaultsDeep doesn't do arrays as you'd expect, so we'll need to apply the classes array from options separately
		let moduleClasses = false;
		if (options.modules) {
			moduleClasses = options.modules.slice();
		}

		// Apply options to default options
		this.options = defaultsDeep({}, options, DefaultOptions);

		// (see above about moduleClasses)
		if (moduleClasses !== false) {
			this.options.modules = moduleClasses;
		}

		// respond to clicks inside the editor
		this.quill.root.addEventListener("click", this.handleClick, false);

		this.quill.root.parentNode.style.position =
			this.quill.root.parentNode.style.position || "relative";

		// setup modules
		this.moduleClasses = this.options.modules;

		this.modules = [];
	}

	initializeModules = () => {
		this.removeModules();

		this.modules = this.moduleClasses.map(
			ModuleClass => new (knownModules[ModuleClass] || ModuleClass)(this)
		);

		this.modules.forEach(module => {
			module.onCreate();
		});

		this.onUpdate();
	};

	onUpdate = () => {
		this.repositionElements();
		this.modules.forEach(module => {
			module.onUpdate();
		});
	};

	removeModules = () => {
		this.modules.forEach(module => {
			module.onDestroy();
		});

		this.modules = [];
	};

	handleClick = evt => {
		if (
			evt.target &&
			evt.target.tagName &&
			evt.target.tagName.toUpperCase() === "IMG"
		) {
			if (this.img === evt.target) {
				// we are already focused on this image
				return;
			}
			if (this.img) {
				// we were just focused on another image
				this.hide();
			}
			// clicked on an image inside the editor
			this.show(evt.target);
		} else if (this.img) {
			// clicked on a non image
			this.hide();
		}
	};

	show = img => {
		// keep track of this img element
		this.img = img;

		this.showOverlay();

		this.initializeModules();
	};

	showOverlay = () => {
		if (this.overlay) {
			this.hideOverlay();
		}

		this.quill.setSelection(null);

		// prevent spurious text selection
		this.setUserSelect("none");

		// listen for the image being deleted or moved
		document.addEventListener("keyup", this.checkImage, true);
		this.quill.root.addEventListener("input", this.checkImage, true);

		// Create and add the overlay
		this.overlay = document.createElement("div");
		Object.assign(this.overlay.style, this.options.overlayStyles);

		this.quill.root.parentNode.appendChild(this.overlay);

		this.repositionElements();
		const img = this.img;
		if (!this.overlay || !img) {
			return;
		}
		const clickCount = img.getAttribute('clickCount');
		if (clickCount < 1) {
			img.setAttribute('clickCount', 1);
			this.quill.root.click()
			setTimeout(() => {
				img.click();
			}, 1000);
		}
		img.setAttribute('clickCount', 0);
	};

	hideOverlay = () => {
		if (!this.overlay) {
			return;
		}

		// Remove the overlay
		this.quill.root.parentNode.removeChild(this.overlay);
		this.overlay = undefined;

		// stop listening for image deletion or movement
		document.removeEventListener("keyup", this.checkImage);
		this.quill.root.removeEventListener("input", this.checkImage);

		// reset user-select
		this.setUserSelect("");
	};

	repositionElements = () => {
		if (!this.overlay || !this.img) {
			return;
		}

		// position the overlay over the image
		const parent = this.quill.root.parentNode;
		const img = this.img;
		const imgRect = img.getBoundingClientRect();
		const containerRect = parent.getBoundingClientRect();

		const imgStyle = this.getImageStyle(
			img.height,
			img.width,
			imgRect.height,
			imgRect.width
		);
		Object.assign(this.img.style, imgStyle);
		const rotation = +img.getAttribute("_rotation") || 0;
		const imgRect2 = img.getBoundingClientRect();
		const overlayStyle = this.getOverlayStyle(
			rotation,
			img.width,
			img.height,
			imgRect2.left,
			imgRect2.top,
			containerRect.left,
			containerRect.top,
			parent.scrollLeft,
			parent.scrollTop
		);
		Object.assign(this.overlay.style, overlayStyle);
	};

	getImageStyle = (imgH, imgW, imgRectH, imgRectW) => {
		const offsetX = (imgRectW - imgW) / 2;
		const offsetY = (imgRectH - imgH) / 2;
		const styles = {
			margin: `${offsetY}px ${offsetX}px`
		};
		// console.log("getImageStyle", {imgH, imgW, imgRectH, imgRectW, styles});
		return styles;
	};

	getOverlayStyle = (
		rotation,
		imgW,
		imgH,
		imgRectL,
		imgRectT,
		cRectL,
		cRectT,
		pScrollL,
		pScrollT
	) => {
		const styles = {};
		switch (rotation) {
			case 90:
			case 270:
				styles.width = `${imgH}px`;
				styles.height = `${imgW}px`;
				styles.left = `${imgRectL - cRectL - 1 + pScrollL}px`;
				styles.top = `${imgRectT - cRectT + pScrollT}px`;
				break;
			case 180:
			case 0:
			default:
				styles.width = `${imgW}px`;
				styles.height = `${imgH}px`;
				styles.left = `${imgRectL - cRectL - 1 + pScrollL}px`;
				styles.top = `${imgRectT - cRectT + pScrollT}px`;
		}
		console.log("getOverlayStyle", {
			rotation,
			imgW,
			imgH,
			imgRectL,
			imgRectT,
			cRectL,
			cRectT,
			pScrollL,
			pScrollT,
			styles
		});
		return styles;
	};

	hide = () => {
		this.hideOverlay();
		this.removeModules();
		this.img = undefined;
	};

	setUserSelect = value => {
		[
			"userSelect",
			"mozUserSelect",
			"webkitUserSelect",
			"msUserSelect"
		].forEach(prop => {
			// set on contenteditable element and <html>
			this.quill.root.style[prop] = value;
			document.documentElement.style[prop] = value;
		});
	};

	checkImage = evt => {
		if (this.img) {
			if (evt.keyCode == 46 || evt.keyCode == 8) {
				window.Quill.find(this.img).deleteAt(0);
			}
			this.hide();
		}
	};
}

if (window.Quill) {
	window.Quill.register("modules/imageRotate", ImageRotate);
}
