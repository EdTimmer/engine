import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import GUI from 'lil-gui'

// GUI
// const gui = new GUI()
// gui.close()

const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()


// Objects
const materialSphere = new THREE.MeshPhysicalMaterial({ color: '#ff4d00', emissive: 'black', roughness: 0, metalness: 0 })  // { color: '#B6BBC4', emissive: 'black', roughness: 0.5, metalness: 0.5}
materialSphere.transmission = 0
materialSphere.ior = 1.592
materialSphere.thickness = 0.2379

const materialSphereTwo = new THREE.MeshPhysicalMaterial({ color: '#fffff5', emissive: 'black', roughness: 0.1, metalness: 0.5 })  // { color: '#B6BBC4', emissive: 'black', roughness: 0.5, metalness: 0.5}
materialSphereTwo.transmission = 1
materialSphereTwo.ior = 1.5
materialSphereTwo.thickness = 0.5

const materialOne = new THREE.MeshStandardMaterial();
materialOne.metalness = 1
materialOne.roughness = 0

const materialTwo = new THREE.MeshStandardMaterial();
materialTwo.metalness = 1
materialTwo.roughness = 0

const materialThree = new THREE.MeshStandardMaterial();
materialThree.metalness = 1
materialThree.roughness = 0

// Spheres
const sphere = new THREE.Mesh(new THREE.SphereGeometry(4, 32, 32), materialSphere)
const sphereTwo = new THREE.Mesh(new THREE.SphereGeometry(6, 32, 32), materialSphereTwo)

// Toruses
const torusOne = new THREE.Mesh(new THREE.TorusGeometry(6.2, 0.07, 34, 82), materialOne)
const torusTwo = new THREE.Mesh(new THREE.TorusGeometry(6.4, 0.07, 34, 82), materialTwo)
const torusThree = new THREE.Mesh(new THREE.TorusGeometry(6.6, 0.07, 34, 82), materialThree)

scene.add(sphere, sphereTwo)
scene.add(torusOne, torusTwo, torusThree)

// Seal
const materialSeal = new THREE.MeshStandardMaterial();
materialSeal.metalness = 0.8
materialSeal.roughness = 0


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

// MOLUSK
const moluskGeometry = new THREE.TorusGeometry(12, 3, 64, 200);
const moluskMaterial = new THREE.MeshStandardMaterial();
moluskMaterial.metalness = 0.8
moluskMaterial.roughness = 0

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

const molusk = new THREE.Mesh(moluskGeometry, moluskMaterial);
molusk.rotation.x = Math.PI;
molusk.rotation.z = - Math.PI / 2.5;

scene.add(molusk);

// Head Shell

const points = [];
for ( let i = 0; i < 20; i ++ ) {
	points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 8 + 10, ( i - 5 ) * 2 ) );
}
const headShellGeometry = new THREE.LatheGeometry( points, 40 );
const headShellMaterial = new THREE.MeshStandardMaterial( { side: THREE.DoubleSide } );
headShellMaterial.metalness = 0.8
headShellMaterial.roughness = 0
const headShell = new THREE.Mesh( headShellGeometry, headShellMaterial );
headShell.scale.set(0.15, 0.15, 0.15);

// Head Sphere
const materialHeadSphere = new THREE.MeshPhysicalMaterial({ color: '#006eff', emissive: 'black', roughness: 0, metalness: 0 })  // { color: '#B6BBC4', emissive: 'black', roughness: 0.5, metalness: 0.5}
materialSphere.transmission = 0
materialSphere.ior = 1.592
materialSphere.thickness = 0.2379
// gui.add(materialHeadSphere, 'transmission').min(0).max(1).step(0.0001)
// gui.add(materialHeadSphere, 'ior').min(1).max(10).step(0.0001)
// gui.add(materialHeadSphere, 'thickness').min(0).max(1).step(0.0001)
// gui.add(materialHeadSphere, 'roughness').min(0).max(1).step(0.0001)
// gui.add(materialHeadSphere, 'metalness').min(0).max(1).step(0.0001)
// gui.addColor(materialHeadSphere, 'color').onChange(() => materialHeadSphere.needsUpdate = true)

const headSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 0), materialHeadSphere)

// Position controls
// const headSpherePositionFolder = gui.addFolder('Head Sphere Position');
// headSpherePositionFolder.add(headSphere.position, 'x', -20, 20).name('X-axis');
// headSpherePositionFolder.add(headSphere.position, 'y', -20, 20).name('Y-axis');

// GROUPS

const coreGroup = new THREE.Group();
coreGroup.add(sphere, sphereTwo, torusOne, torusTwo, torusThree);
coreGroup.position.x = 2;

const headGroup = new THREE.Group();
headGroup.add(headShell, headSphere);
headGroup.position.x = -5.64;
headGroup.position.y = -14.0;
headGroup.rotation.y = 0;
headGroup.rotation.z = -1.8;

// Position controls
// const positionFolder = gui.addFolder('Position Head');
// positionFolder.add(headGroup.position, 'x', -20, 20).step(0.0001).name('X-axis');
// positionFolder.add(headGroup.position, 'y', -20, 20).step(0.0001).name('Y-axis');
// positionFolder.add(headGroup.position, 'z', -20, 20).name('Z-axis');
// positionFolder.open();

// gui.add(headGroup.rotation, 'x', -Math.PI, Math.PI).name('Rotation X');
// gui.add(headGroup.rotation, 'y', -Math.PI, Math.PI).name('Rotation Y');
// gui.add(headGroup.rotation, 'z', -Math.PI, Math.PI).name('Rotation Z');

const shellGroup = new THREE.Group();
shellGroup.add(seal, molusk, headGroup);

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
rgbeLoader.load('/cape_hill_2k.hdr', (environmentMap) => {
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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
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
let startDownTime = null;
let upAnimationInProgress = false;
let leftAnimationInProgress = false;
let rightAnimationInProgress = false;
let downAnimationInProgress = false;

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
    if (startDownTime !== null) {
      updateDownRotation(time);
    }
    // updateRightRotation(time)
    renderer.render(scene, camera);
}
animateRocking();

// Rotation update function
function updateUpRotation(time) {
    const elapsedTime = time - startUpTime;
    const progress = elapsedTime / duration;

    if (progress <= 0.5) {
        // First half: rotate
        shellGroup.rotation.z = initialZRotation + 2 * rotationStep * progress;
    } else if (progress <= 1) {
        // Second half: rotate back to initial position
        shellGroup.rotation.z = initialZRotation + 2 * rotationStep * (1 - progress);
    } else {
        // End of animation
        shellGroup.rotation.z = initialZRotation;
        startUpTime = null; // Reset startTime to stop the animation 
    }
}

function updateDownRotation(time) {
  const elapsedTime = time - startDownTime;
  const progress = elapsedTime / duration;

  if (progress <= 0.5) {
      // First half: rotate
      shellGroup.rotation.z = initialZRotation - 2 * rotationStep * progress;
  } else if (progress <= 1) {
      // Second half: rotate back to initial position
      shellGroup.rotation.z = initialZRotation - 2 * rotationStep * (1 - progress);
  } else {
      // End of animation
      shellGroup.rotation.z = initialZRotation;
      startDownTime = null; // Reset startTime to stop the animation
  }
}

function updateLeftRotation(time) {
  const elapsedTime = time - startLeftTime;
  const progress = elapsedTime / duration;

  if (progress <= 0.5) {
      // First half: rotate to 0.5 radians
      shellGroup.rotation.x = initialXRotation - 2 * rotationStep * progress;
  } else if (progress <= 1) {
      // Second half: rotate back to initial position
      shellGroup.rotation.x = initialXRotation - 2 * rotationStep * (1 - progress);
      engineGroup.rotation.y += 0.01;    
  } else {
      // End of animation
      shellGroup.rotation.x = initialXRotation;
      startLeftTime = null; // Reset startTime to stop the animation
  }
}

function updateRightRotation(time) {
  const elapsedTime = time - startRightTime;
  const progress = elapsedTime / duration;

  if (progress <= 0.5) {
      // First half: rotate
      shellGroup.rotation.x = initialXRotation + 2 * rotationStep * progress;
  } else if (progress <= 1) {
      // Second half: rotate back to initial position
      shellGroup.rotation.x = initialXRotation + 2 * rotationStep * (1 - progress);
      engineGroup.rotation.y += -0.01;  
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
    startLeftTime = performance.now();
    leftAnimationInProgress = true;
  } else if (event.key === 'ArrowRight' && !rightAnimationInProgress) {
    startRightTime = performance.now();
    rightAnimationInProgress = true;
  } else if (event.key === 'ArrowDown' && !downAnimationInProgress) {
    startDownTime = performance.now();
    downAnimationInProgress = true;
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
  } else if (event.key === 'ArrowDown') {
    downAnimationInProgress = false;
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

    const speed = 1;

    const forward = new THREE.Vector3(-1, 0, 0); // Faces negative x-direction initially
    forward.applyEuler(new THREE.Euler(0, engineGroup.rotation.y, 0, 'XYZ'));

    engineGroup.position.add(forward.multiplyScalar(-speed));
  }
  if (keyStates['ArrowDown']) {
    const speed = 1;

    const backward = new THREE.Vector3(-1, 0, 0); // Faces negative x-direction initially
    backward.applyEuler(new THREE.Euler(0, engineGroup.rotation.y, 0, 'XYZ'));

    // engineGroup.position.x -= 0.1 * deltaTime;  // Move at 1 unit per second
    engineGroup.position.add(backward.multiplyScalar(speed));
  }
  if (keyStates['ArrowLeft']) {
    engineGroup.rotation.y += 0.1;  // Move at 1 unit per second
  }
  if (keyStates['ArrowRight']) {
    engineGroup.rotation.y -= 0.1;  // Move at 1 unit per second
  }

  renderer.render(scene, camera);
}
requestAnimationFrame(animateForward);

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update objects
  torusOne.rotation.y = elapsedTime * 2
  torusTwo.rotation.y = elapsedTime * 0.1
  torusThree.rotation.y = elapsedTime * 2
  headSphere.rotation.y = elapsedTime * 1

  torusOne.rotation.x = elapsedTime * (-0.1)
  torusTwo.rotation.x = elapsedTime * (-2)
  torusThree.rotation.x = elapsedTime * (-0.5)
  headSphere.rotation.x = elapsedTime * (-1)

  // Update controls
  controls.update()

  camera.lookAt(engineGroup.position)

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
