import { createShoeScene } from "./pages/scripts/shoeScene.js";

document.addEventListener('DOMContentLoaded', () => {	
	const canvases = document.getElementsByClassName('sneakerCanvas');
	for (let canvas of canvases) {
		createShoeScene(canvas);
	}
});

