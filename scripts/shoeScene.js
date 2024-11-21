import * as THREE from 'three'; // importeert three.js
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // importeert orbit controls
import gsap from 'gsap'; // importeert gsap, aparte library gespecialiseerd in animaties
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // importeert gltf loader
import * as dat from 'dat.gui';

export function createShoeScene(el) {
    const canvasHeight = 472;
    const canvasWidth = 900
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, canvasWidth / canvasHeight, 0.1, 1000 );
    
    // Add canvas to the document element.
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas : el });
    renderer.setSize( canvasWidth, canvasHeight );
    
    // orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    
    // ambient light
    const ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 ); // ambient light aanmaken met kleur en intensiteit
    scene.add( ambientLight ); // ambient light toevoegen aan scene
    
    // sun light
    const sunLight = new THREE.DirectionalLight( 0xffffff, 1 ); // directional light aanmaken met kleur en intensiteit
    sunLight.position.set( 5, 5, 5 ); // directional light positie
    sunLight.castShadow = true; // directional light shadow
    scene.add( sunLight ); // directional light toevoegen aan scene
    
    // point light
    const pointLight = new THREE.PointLight( 0xffffff, 1 ); // point light aanmaken met kleur en intensiteit
    pointLight.position.set( 0, 2, 0 ); // point light positie
    pointLight.castShadow = true; // point light shadow
    scene.add( pointLight ); // point light toevoegen aan scene
    
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const environmentMapTexture = cubeTextureLoader.load([
      '/background/px.png',
      '/background/nx.png',
      '/background/py.png',
      '/background/ny.png',
      '/background/pz.png',
      '/background/nz.png',
    ]);
    scene.background = environmentMapTexture;
    
    // add a platform (BoxGeometry( 5, 0.1, 5 ) where the shoe will be placed on
    const platformGeometry = new THREE.BoxGeometry(5, 0.1, 5);
    const platformMaterial = new THREE.MeshStandardMaterial({ color: 0xEB5E28 });
    const platform = new THREE.Mesh( platformGeometry, platformMaterial );
    platform.position.y = -0.3; // position the platform below the shoe
    platform.receiveShadow = true; // platform shadow
    scene.add( platform );
    
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('textures/image_0.png');
    
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/model/shoemodel.glb', (gltf) => {
        gltf.scene.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.map = texture;
                child.material.needsUpdate = true;
            }
        });
    
        // Scale the shoe model
        gltf.scene.scale.set(10, 10, 10); // Increase the scale to make the shoe bigger
    
        gltf.scene.receiveShadow = true; // shoe shadow
        gltf.scene.castShadow = true; // shoe shadow
    
        scene.add(gltf.scene);
    
        //gsap spin the shoe in a consistent loop
        gsap.to(gltf.scene.rotation, {
            y: Math.PI * 2,
            duration: 5,
            repeat: -1,
            ease: 'none',
        });
    });
    
    // make a gui to control the light and rotation of the shoe
    const gui = new dat.GUI();
    gui.add(sunLight.position, 'x').min(-10).max(10).step(0.01).name('lightX');
    gui.add(sunLight.position, 'y').min(-10).max(10).step(0.01).name('lightY');
    gui.add(sunLight.position, 'z').min(-10).max(10).step(0.01).name('lightZ');
    gui.add(pointLight.position, 'x').min(-10).max(10).step(0.01).name('pointX');
    gui.add(pointLight.position, 'y').min(-10).max(10).step(0.01).name('pointY');
    gui.add(pointLight.position, 'z').min(-10).max(10).step(0.01).name('pointZ');
    
    camera.position.z = 5;
    
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}