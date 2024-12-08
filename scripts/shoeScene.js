import * as THREE from 'three'; // importeert three.js
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // importeert orbit controls
import gsap from 'gsap'; // importeert gsap, aparte library gespecialiseerd in animaties
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // importeert gltf loader
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

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

const partColors = {};
const partMaterials = {};

export function getPartColor(partName) {
    return partColors[partName] || 0xffffff;
}

export function getPartMaterial(partName) {
    return partMaterials[partName] || null;
}

export function createShoeScene(el) {
    // canvas dimensions
    const canvasHeight = el.clientHeight;
    const canvasWidth = el.clientWidth;
    
    // scene, camera and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, canvasWidth / canvasHeight, 0.1, 1000 );
    
    // Add canvas to the document element.
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas : el });
    renderer.setSize( canvasWidth, canvasHeight );

    // Set canvas background color
    renderer.setClearColor(0xfdfdfd, 1); // Set the background color to black

    
    // orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // load texture
    const textureLoader = new THREE.TextureLoader();
    
    const spinGroup = new THREE.Group(); // create a group to hold the shoe and text

    const light = new THREE.DirectionalLight(0xffffff, 3); // White light with intensity 1
    light.position.set(10, 10, 10); // Position the light
    light.castShadow = true;
    scene.add(light);

    // Enable shadows for the renderer
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // load shoe model
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/model/shoemodel.glb', (gltf) => {
        gltf.scene.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material = new THREE.MeshStandardMaterial({ 
                    color: 0xffffff
                });
                child.material.needsUpdate = true;
                child.castShadow = true; // Enable shadow casting for the shoe
            }
        });

        // Scale the shoe model
        gltf.scene.scale.set(10, 10, 10); // Increase the scale to make the shoe bigger

        scene.add(gltf.scene);

        spinGroup.add(gltf.scene); // add the shoe to the group
    });

    // load the Column.glb and add it to the scene under the shoe model on the y axis
    const columnLoader = new GLTFLoader();
    columnLoader.load('/model/Column.glb', (gltf) => {
        gltf.scene.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material = new THREE.MeshStandardMaterial({ 
                    color: 0x69ff47 
                });
                child.material.needsUpdate = true;
                child.receiveShadow = true; // Enable shadow receiving for the column
            }
        });

        // Scale the column model
        gltf.scene.scale.set(3.1, 3.1, 3.1); // Increase the scale to make the column bigger

        scene.add(gltf.scene);
        gltf.scene.position.y = -13; // position the column under the shoe model
        gltf.scene.position.z = 0.2; // position the column under the shoe model
    });

    // Raycaster and interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Handle mouse click events
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
                if (material && material.color && material.color.getHex() === 0xffffff) {
                    material.color.set(0xb4ffa3); 
                    partColors[currentIntersect.object.name] = material.color.getHex();
                }
            }
        }
    });

    const materialsGroup = new THREE.Group(); // Create a group to hold all the materials

    // Change Fabric on Button Click
    document.getElementById('fabricButton').addEventListener('click', () => {
        const fabricTexture = textureLoader.load('/materials/fabric.png');
        const fabricMaterial = new THREE.MeshStandardMaterial({ map: fabricTexture });

        if (currentIntersect && editableObjects.includes(currentIntersect.object.name)) {
            currentIntersect.object.material = fabricMaterial;
            partMaterials[currentIntersect.object.name] = "fabric"; // Store "fabric" as string

            materialsGroup.add(fabricMaterial);
        }
    });

    // Change Leather on Button Click
    document.getElementById('leatherButton').addEventListener('click', () => {
        const leatherTexture = textureLoader.load('/materials/leather.png');
        const leatherMaterial = new THREE.MeshStandardMaterial({ map: leatherTexture });

        if (currentIntersect && editableObjects.includes(currentIntersect.object.name)) {
            currentIntersect.object.material = leatherMaterial;
            partMaterials[currentIntersect.object.name] = "leather"; // Store "leather" as string

            materialsGroup.add(leatherMaterial);
        }
    });

    // Change Metallic on Button Click
    document.getElementById('metallicButton').addEventListener('click', () => {
        const metallicTexture = textureLoader.load('/materials/metallic.png');
        const metallicMaterial = new THREE.MeshStandardMaterial({ map: metallicTexture });

        if (currentIntersect && editableObjects.includes(currentIntersect.object.name)) {
            currentIntersect.object.material = metallicMaterial;
            partMaterials[currentIntersect.object.name] = "metallic"; // Store "metallic" as string

            materialsGroup.add(metallicMaterial);
        }
    });

    // change rubber on button click
    document.getElementById('rubberButton').addEventListener('click', () => {
        const rubberTexture = textureLoader.load('/materials/rubber.png');
        const rubberMaterial = new THREE.MeshStandardMaterial({ map: rubberTexture });

        if (currentIntersect && editableObjects.includes(currentIntersect.object.name)) {
            currentIntersect.object.material = rubberMaterial;
            partMaterials[currentIntersect.object.name] = "rubber"; // Store "rubber" as string

            materialsGroup.add(rubberMaterial);
        }
    });

    // Add the materials group to the scene
    scene.add(materialsGroup);

    // Change Color on Button Click
    document.querySelectorAll('.color-circle').forEach((color) => {
        color.addEventListener('click', (event) => {
            const colorValue = event.target.getAttribute('data-color');
            if (currentIntersect && editableObjects.includes(currentIntersect.object.name)) {
                const material = currentIntersect.object.material;
                if (material && material.color) {
                    material.color.set(colorValue);
                    partColors[currentIntersect.object.name] = material.color.getHex();
                }
            }
        });
    });

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

    const spinAnimation = gsap.to(spinGroup.rotation, {
        y: Math.PI * 2,
        duration: 20,
        repeat: -1,
        ease: 'none',
        paused: true, // Start the animation paused
    });
    
    // Toggle spinning based on checkbox input
    document.getElementById('switchButton').addEventListener('change', (event) => {
        if (event.target.checked) {
            spinAnimation.resume();
        } else {
            spinAnimation.pause();
        }
    });

    camera.position.z = 5;
    
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}