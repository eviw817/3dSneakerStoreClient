import * as THREE from 'three'; // importeert three.js
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // importeert orbit controls
import gsap from 'gsap'; // importeert gsap, aparte library gespecialiseerd in animaties
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // importeert gltf loader
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

export function createShoeScene(el) {
    // canvas dimensions
    const canvasHeight = 440;
    const canvasWidth = 1460;
    
    // scene, camera and renderer
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
    
    // environment map
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
    const platformMaterial = new THREE.MeshStandardMaterial({ color: 0x3df913 });
    const platform = new THREE.Mesh( platformGeometry, platformMaterial );
    platform.position.y = -0.3; // position the platform below the shoe
    platform.receiveShadow = true; // platform shadow
    scene.add( platform );
    
    // load texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('textures/image_0.png');
    
    const spinGroup = new THREE.Group(); // create a group to hold the shoe and text

    // load shoe model
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/model/shoemodel.glb', (gltf) => {
        gltf.scene.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material = new THREE.MeshStandardMaterial({ 
                    color: 0xffffff 
                });
                child.material.needsUpdate = true;
            }
        });
    
        // Scale the shoe model
        gltf.scene.scale.set(10, 10, 10); // Increase the scale to make the shoe bigger
    
        gltf.scene.receiveShadow = true; // shoe shadow
        gltf.scene.castShadow = true; // shoe shadow
    
        scene.add(gltf.scene);

        spinGroup.add(gltf.scene); // add the shoe to the group
    });

    // Raycaster and interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const editableObjects = [
        "outside_1",
        "outside_2",
        "outside_3",
        "sole_bottom",
        "sole_top",
        "inside",
        "laces"
    ];
    let currentIntersect = null;

    // Handle Mouse Clicks
    window.addEventListener('click', (event) => {
        const { left, top, width, height } = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - left) / width) * 2 - 1;
        mouse.y = -((event.clientY - top) / height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            const firstIntersect = intersects[0];
            if (editableObjects.includes(firstIntersect.object.name)) {
                currentIntersect = firstIntersect;
                const material = currentIntersect.object.material;
                if (material && material.color) {
                    material.color.set(0x808080); 
                }
            }
        }
    });

    // Change Color on Button Click
    document.querySelectorAll('.color-circle').forEach((color) => {
        color.addEventListener('click', (event) => {
            const colorValue = event.target.getAttribute('data-color');
            console.log(`Color picked: ${colorValue}`);
            if (currentIntersect && editableObjects.includes(currentIntersect.object.name)) {
                const material = currentIntersect.object.material;
                if (material && material.color) {
                    material.color.set(colorValue);
                }
            }
        });
    });

    // materials
    
    // Add text to the scene
    const loader = new FontLoader();

    loader.load('fonts/RobotoMedium_Regular.json', function (font) {
        let textMesh = null;

        document.getElementById('shoeName').addEventListener('input', () => {
            const shoeNameInput = document.getElementById('shoeName').value;

            if (textMesh) {
                scene.remove(textMesh);
                spinGroup.remove(textMesh);
                textMesh.geometry.dispose();
                textMesh.material.dispose();
                textMesh = null;
            }

            if (shoeNameInput !== '') {
                const textGeometry = new TextGeometry(shoeNameInput, {
                    font: font,
                    size: 0.2,
                    depth: 0.02,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.01,
                    bevelSize: 0.01,
                    bevelOffset: 0,
                    bevelSegments: 5
                });

                const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
                textMesh = new THREE.Mesh(textGeometry, textMaterial);

                // Position the text on the "inside" part of the shoe
                textMesh.position.set(0.1, 0.1, 0); // Adjust the position as needed
                textMesh.rotation.x = Math.PI / 2;
                textMesh.rotation.z = Math.PI / 2;
                // Mirror the text so it is readable
                textMesh.scale.set(-1, 1, 1);

                scene.add(textMesh);

                spinGroup.add(textMesh); // add the text to the group
            }
        });
    });

    scene.add(spinGroup); // add the group to the scene

    // gsap spin the group in a consistent loop
    const spinAnimation = gsap.to(spinGroup.rotation, {
        y: Math.PI * 2,
        duration: 5,
        repeat: -1,
        ease: 'none',
    });

    // Stop spinning when stopButton is clicked
    document.getElementById('stopButton').addEventListener('click', () => {
        spinAnimation.pause();
    });

    // Start spinning when startButton is clicked
    document.getElementById('startButton').addEventListener('click', () => {
        spinAnimation.resume();
    });
    
    //make name spin and stop

    camera.position.z = 5;
    
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}