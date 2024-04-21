import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import GUI from 'lil-gui'

// GUI
const gui = new GUI()

const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()


// Objects
// const materialSphere = new THREE.MeshLambertMaterial({ color: '#B6BBC4', emissive: 'black'})
const materialSphere = new THREE.MeshPhysicalMaterial({ color: '#ff4d00', emissive: 'black', roughness: 0, metalness: 0 })  // { color: '#B6BBC4', emissive: 'black', roughness: 0.5, metalness: 0.5}
materialSphere.transmission = 0
materialSphere.ior = 1.592
materialSphere.thickness = 0.2379
gui.add(materialSphere, 'transmission').min(0).max(1).step(0.0001)
gui.add(materialSphere, 'ior').min(1).max(10).step(0.0001)
gui.add(materialSphere, 'thickness').min(0).max(1).step(0.0001)
gui.add(materialSphere, 'roughness').min(0).max(1).step(0.0001)
gui.add(materialSphere, 'metalness').min(0).max(1).step(0.0001)
gui.addColor(materialSphere, 'color').onChange(() => materialSphere.needsUpdate = true)

const materialSphereTwo = new THREE.MeshPhysicalMaterial({ color: '#fffff5', emissive: 'black', roughness: 0.1, metalness: 0.5 })  // { color: '#B6BBC4', emissive: 'black', roughness: 0.5, metalness: 0.5}
materialSphereTwo.transmission = 1
materialSphereTwo.ior = 1.5
materialSphereTwo.thickness = 0.5
gui.add(materialSphereTwo, 'transmission').min(0).max(1).step(0.0001)
gui.add(materialSphereTwo, 'ior').min(1).max(10).step(0.0001)
gui.add(materialSphereTwo, 'thickness').min(0).max(1).step(0.0001)
gui.add(materialSphereTwo, 'roughness').min(0).max(1).step(0.0001)
gui.add(materialSphereTwo, 'metalness').min(0).max(1).step(0.0001)
gui.addColor(materialSphereTwo, 'color').onChange(() => materialSphereTwo.needsUpdate = true)


// const materialOne = new THREE.MeshMatcapMaterial()
// materialOne.matcap = new THREE.TextureLoader().load('static/textures/matcaps/1.png')
const materialOne = new THREE.MeshStandardMaterial();
materialOne.metalness = 1
materialOne.roughness = 0

// const materialTwo = new THREE.MeshMatcapMaterial()
// materialTwo.matcap = new THREE.TextureLoader().load('static/textures/matcaps/1.png')
const materialTwo = new THREE.MeshStandardMaterial();
materialTwo.metalness = 1
materialTwo.roughness = 0

// const materialThree = new THREE.MeshMatcapMaterial()
// materialThree.matcap = new THREE.TextureLoader().load('static/textures/matcaps/1.png')
const materialThree = new THREE.MeshStandardMaterial();
materialThree.metalness = 1
materialThree.roughness = 0

// Spheres
const sphere = new THREE.Mesh(new THREE.SphereGeometry(4, 32, 32), materialSphere)
const sphereTwo = new THREE.Mesh(new THREE.SphereGeometry(6, 32, 32), materialSphereTwo)

// Toruses
const torusOne = new THREE.Mesh(new THREE.TorusGeometry(6.2, 0.07, 34, 82), materialOne)
// torusOne.scale.y = 1
// torusOne.scale.x = 0.8
const torusTwo = new THREE.Mesh(new THREE.TorusGeometry(6.4, 0.07, 34, 82), materialTwo)
const torusThree = new THREE.Mesh(new THREE.TorusGeometry(6.6, 0.07, 34, 82), materialThree)

scene.add(sphere, sphereTwo)
scene.add(torusOne, torusTwo, torusThree)

// Seal
// const materialSeal = new THREE.MeshPhysicalMaterial({ color: '#060628', emissive: 'black', roughness: 0, metalness: 0 })
const materialSeal = new THREE.MeshStandardMaterial();
materialSeal.metalness = 0.8
materialSeal.roughness = 0

// materialSeal.transmission = 0
// materialSeal.ior = 1.592
// materialSeal.thickness = 0.2379
// gui.add(materialSeal, 'transmission').min(0).max(1).step(0.0001)
// gui.add(materialSeal, 'ior').min(1).max(10).step(0.0001)
// gui.add(materialSeal, 'thickness').min(0).max(1).step(0.0001)
// gui.add(materialSeal, 'roughness').min(0).max(1).step(0.0001)
// gui.add(materialSeal, 'metalness').min(0).max(1).step(0.0001)
// gui.addColor(materialSeal, 'color').onChange(() => materialSeal.needsUpdate = true)


const params = {
  radius: 1.83,
  tube: 1.57,
  radialSegments: 34,
  tubularSegments: 82,
  arc: Math.PI * 2
};


const seal = new THREE.Mesh(new THREE.TorusGeometry(params.radius, params.tube, params.radialSegments, params.tubularSegments), materialSeal)
seal.position.x = 3.12
seal.position.y = 11.1
seal.rotation.x = 1.5
seal.rotation.y = 1.42
seal.scale.x = 1.2
// seal.rotateY(1.5)


scene.add(seal)

gui.add(seal.position, 'x', -10, 10).name('Position X');
gui.add(seal.position, 'y', -10, 20).name('Position Y');
// gui.add(seal.rotation, 'z', -10, 10).name('Rotation Z');

gui.add(seal.rotation, 'x', -Math.PI, Math.PI).name('Rotation X');
gui.add(seal.rotation, 'y', -Math.PI, Math.PI).name('Rotation Y');
gui.add(seal.rotation, 'z', -Math.PI, Math.PI).name('Rotation Z');

// Torus Geometry Parameters for GUI

// Add GUI controls
gui.add(params, 'radius', 0.1, 4).onChange(value => {
  seal.geometry.dispose();
  seal.geometry = new THREE.TorusGeometry(value, params.tube, params.radialSegments, params.tubularSegments, params.arc);
});
gui.add(params, 'tube', 0.1, 3).onChange(value => {
  seal.geometry.dispose();
  seal.geometry = new THREE.TorusGeometry(params.radius, value, params.radialSegments, params.tubularSegments, params.arc);
});
gui.add(params, 'radialSegments', 2, 32).step(1).onChange(value => {
  seal.geometry.dispose();
  seal.geometry = new THREE.TorusGeometry(params.radius, params.tube, value, params.tubularSegments, params.arc);
});
gui.add(params, 'tubularSegments', 3, 200).step(1).onChange(value => {
  seal.geometry.dispose();
  seal.geometry = new THREE.TorusGeometry(params.radius, params.tube, params.radialSegments, value, params.arc);
});
gui.add(params, 'arc', 0.1, Math.PI * 2).onChange(value => {
  seal.geometry.dispose();
  seal.geometry = new THREE.TorusGeometry(params.radius, params.tube, params.radialSegments, params.tubularSegments, value);
});

console.log('seal.rotation.order :>> ', seal.rotation.order);

// MOLUSK
const moluskGeometry = new THREE.TorusGeometry(12, 3, 64, 200);
const material = new THREE.MeshStandardMaterial();
material.metalness = 0.8
material.roughness = 0
// const material = new THREE.MeshMatcapMaterial();
// material.matcap = new THREE.TextureLoader().load('static/textures/matcaps/1.png');

// Access the position attribute
const positions = moluskGeometry.attributes.position;
const vertex = new THREE.Vector3();

for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i);
    
    const angle = Math.atan2(vertex.y, vertex.x);
    const factor = 1 + 0.08 * Math.floor(8 * angle / (2 * Math.PI)); // Change the factor calculation as needed
    
    vertex.x *= factor;
    vertex.y *= factor;
    
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
}

moluskGeometry.computeVertexNormals(); // Necessary to ensure lighting is calculated properly after modifying vertices

const molusk = new THREE.Mesh(moluskGeometry, material);
molusk.rotation.x = Math.PI;
molusk.rotation.z = - Math.PI / 2.5;
scene.add(molusk);

const coreGroup = new THREE.Group();
coreGroup.add(sphere, sphereTwo, torusOne, torusTwo, torusThree);
coreGroup.position.x = 2;
scene.add(coreGroup);

const shellGroup = new THREE.Group();
shellGroup.add(seal, molusk);

const engineGroup = new THREE.Group();
engineGroup.add(coreGroup, shellGroup);
scene.add(engineGroup);

// LIGHTS

const lightAmbient = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( lightAmbient );

const light = new THREE.PointLight(0xffffff, 100, 0);
light.position.set(-5, 5, 5);
scene.add(light);

// Environment map
const rgbeLoader = new RGBELoader()
rgbeLoader.load('./static/textures/environmentMap/table_mountain_1_4k.hdr', (environmentMap) => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping
    scene.background = environmentMap
    scene.environment = environmentMap
})


/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () =>
{
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 30
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap


/**
 * Movements
 */

// Animation parameters
let startUpTime = null;
let startLeftTime = null;
let startRightTime = null;
let upAnimationInProgress = false;
let leftAnimationInProgress = false;
let rightAnimationInProgress = false;

const duration = 1000; // duration of the full animation in milliseconds
const initialZRotation = shellGroup.rotation.z;
const initialXRotation = shellGroup.rotation.x;
const rotationStep = 0.5; // total rotation

// Render loop
function animateRocking(time) {
    requestAnimationFrame(animateRocking);
    // updateUpRotation(time);
    if (startUpTime !== null) {
      updateUpRotation(time);
    }
    if (startLeftTime !== null) {
      updateLeftRotation(time);
    }
    // updateLeftRotation(time)
    if (startRightTime !== null) {
      updateRightRotation(time);
    }
    // updateRightRotation(time)
    renderer.render(scene, camera);
}
animateRocking();

// Rotation update function
function updateUpRotation(time) {
    // if (!startUpTime) return;
    const elapsedTime = time - startUpTime;
    const progress = elapsedTime / duration;

    if (progress <= 0.5) {
        // First half: rotate to 0.5 radians
        shellGroup.rotation.z = initialZRotation - 2 * rotationStep * progress;
    } else if (progress <= 1) {
        // Second half: rotate back to initial position
        shellGroup.rotation.z = initialZRotation - 2 * rotationStep * (1 - progress);
    // } else if (progress <= 2) {
    //   shellGroup.position.x = -1;
      
    } else {
        // End of animation
        shellGroup.rotation.z = initialZRotation;
        startUpTime = null; // Reset startTime to stop the animation
        // upAnimationInProgress = false; 
    }
}

function updateLeftRotation(time) {
  console.log('in left rotation function');
  // if (!startLeftTime) return;
  const elapsedTime = time - startLeftTime;
  const progress = elapsedTime / duration;

  if (progress <= 0.5) {
      // First half: rotate to 0.5 radians
      shellGroup.rotation.x = initialXRotation + 2 * rotationStep * progress;
  } else if (progress <= 1) {
      // Second half: rotate back to initial position
      shellGroup.rotation.x = initialXRotation + 2 * rotationStep * (1 - progress);
  // } else if (progress <= 2) {
  //   shellGroup.position.x = -1;
    
  } else {
      // End of animation
      shellGroup.rotation.x = initialXRotation;
      startLeftTime = null; // Reset startTime to stop the animation
  }
}

function updateRightRotation(time) {
  // if (!startRightTime) return;
  const elapsedTime = time - startRightTime;
  const progress = elapsedTime / duration;

  if (progress <= 0.5) {
      // First half: rotate to 0.5 radians
      shellGroup.rotation.x = initialXRotation - 2 * rotationStep * progress;
  } else if (progress <= 1) {
      // Second half: rotate back to initial position
      shellGroup.rotation.x = initialXRotation - 2 * rotationStep * (1 - progress);
  // } else if (progress <= 2) {
  //   shellGroup.position.x = -1;
    
  } else {
      // End of animation
      shellGroup.rotation.x = initialXRotation;
      startRightTime = null; // Reset startTime to stop the animation
  }
}

// Listen for the up arrow key
window.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowUp' && !upAnimationInProgress) {
        // Start the animation
        startUpTime = performance.now();
        upAnimationInProgress = true; // Indicate that animation is in progress

    } else if (event.key === 'ArrowLeft' && !leftAnimationInProgress) {
        // engineGroup.position.x -= 1;
        console.log('event.key :>> ', event.key);
        startLeftTime = performance.now();
        leftAnimationInProgress = true;
    } else if (event.key === 'ArrowRight' && !rightAnimationInProgress) {
      // engineGroup.position.x -= 1;
      startRightTime = performance.now();
      rightAnimationInProgress = true;
  }
});

// Listen for key up to reset the animation flag
window.addEventListener('keyup', function(event) {
  if (event.key === 'ArrowUp') {
    upAnimationInProgress = false; // Reset only after key is released
  } else if (event.key === 'ArrowLeft') {
    leftAnimationInProgress = false;
  } else if (event.key === 'ArrowRight') {
    rightAnimationInProgress = false;
  }
});

// Move

// Track key states (whether they are pressed down)
const keyStates = {};

window.addEventListener('keydown', function(event) {
  keyStates[event.key] = true;
});

window.addEventListener('keyup', function(event) {
  keyStates[event.key] = false;
});

// Function to animate the scene
function animateForward(time) {
  requestAnimationFrame(animateForward);
  
  // Time delta in seconds
  let deltaTime = time * 0.001;  // Convert from milliseconds to seconds

  // Handle continuous movement based on key states
  if (keyStates['ArrowUp']) {
    engineGroup.position.x -= 0.1 * deltaTime;  // Move at 1 unit per second
  }
  if (keyStates['ArrowDown']) {
    engineGroup.position.x += 0.1 * deltaTime;  // Move at 1 unit per second
  }

  renderer.render(scene, camera);
}
requestAnimationFrame(animateForward);

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    // sphere.rotation.y = elapsedTime * 0.2
    torusOne.rotation.y = elapsedTime * 2
    torusTwo.rotation.y = elapsedTime * 0.1
    torusThree.rotation.y = elapsedTime * 2
    // molusk.rotation.y = elapsedTime * 0.5

    // sphere.rotation.x = elapsedTime * (-0.2)
    torusOne.rotation.x = elapsedTime * (-0.1)
    torusTwo.rotation.x = elapsedTime * (-2)
    torusThree.rotation.x = elapsedTime * (-0.5)
    // molusk.rotation.x = elapsedTime * 0.5

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

