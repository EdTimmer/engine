import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import GUI from 'lil-gui'

// GUI
const gui = new GUI()

const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()

/**
 * Axes Helper
 */
const axesHelper = new THREE.AxesHelper(2)
scene.add(axesHelper)

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

// console.log('seal.rotation.order :>> ', seal.rotation.order);

// MOLUSK
const cubeCamera = new THREE.CubeCamera(1, 1000, 256);
scene.add(cubeCamera);
// Create the reflective material using the cubeCamera's renderTarget
const reflectiveMaterial = new THREE.MeshStandardMaterial({
  envMap: cubeCamera.renderTarget.texture,
  metalness: 1,  // Adjust for stronger reflectivity
  roughness: 0   // Adjust based on how sharp you want the reflection
});

const moluskGeometry = new THREE.TorusGeometry(12, 3, 64, 200);
// const moluskMaterial = new THREE.MeshStandardMaterial();

// moluskMaterial.metalness = 0.8
// moluskMaterial.roughness = 0
const moluskMaterial = new THREE.MeshMatcapMaterial();
moluskMaterial.matcap = new THREE.TextureLoader().load('static/textures/matcaps/1.png');

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

const molusk = new THREE.Mesh(moluskGeometry, reflectiveMaterial);
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

scene.add(light);

// Environment map
const rgbeLoader = new RGBELoader()
// rgbeLoader.load('./static/textures/environmentMap/table_mountain_1_4k.hdr', (environmentMap) => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping
//     scene.background = environmentMap
//     scene.environment = environmentMap
// })


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
// camera.position.x = 0
// camera.position.y = 0
// camera.position.z = 30

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
function animateMove(time) {
    requestAnimationFrame(animateMove);
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
    // updateTerrain();
    camera.position.set(engineGroup.position.x, engineGroup.position.y + 5, engineGroup.position.z + 30)
    light.position.set(engineGroup.position.x - 5, engineGroup.position.y + 5, engineGroup.position.z + 5);

    // Move the cube camera to the reflective object's position
  

  // Update the cube camera
  // cubeCamera.update(renderer, scene);
  // cubeCamera.update(renderer, scene);

    renderer.render(scene, camera);
}
animateMove();

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

  // camera.position.x = engineGroup.position.x;
  // camera.position.y = engineGroup.position.y + 5; // Offset by 5 units above the mesh
  // camera.position.z = engineGroup.position.z + 30; // Offset by 10 units back

  renderer.render(scene, camera);
}
requestAnimationFrame(animateForward);


// Texture loader
const loader = new THREE.TextureLoader();
const diffuseTexture = loader.load('./static/textures/tile/4K-abstract_5-diffuse.jpg');
const specularTexture = loader.load('./static/textures/tile/4K-abstract_5-specular.jpg');
const normalTexture = loader.load('./static/textures/tile/4K-abstract_5-normal.jpg');
const displacementTexture = loader.load('./static/textures/tile/4K-abstract_5-displacement.jpg');
const aoTexture = loader.load('./static/textures/tile/4K-abstract_5-ao.jpg');
const textures = [diffuseTexture, specularTexture, normalTexture, displacementTexture, aoTexture];
textures.forEach(texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
});



// Terrain
// const terrainGeometry = new THREE.PlaneGeometry(200, 200, 10, 10);
// const terrainMaterial = new THREE.MeshLambertMaterial({ color: 'blue' });
// const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
// terrain.rotation.x = -Math.PI / 2; // Rotate to lie flat
// terrain.position.y = -20; // Lower the terrain to avoid z-fighting with the spheres
// scene.add(terrain);

// Terrain tiles storage
const tiles = {};

// function createTerrainTile() {
//   const tile = new THREE.Mesh(
//       new THREE.PlaneGeometry(200, 200, 10, 10),
//       new THREE.MeshLambertMaterial({ color: 'blue' })
//   );
//   tile.rotation.x = -Math.PI / 2;
//   tile.position.y = -20;
//   return tile;
// }
// Create terrain tile function
function createTerrainTile(x, z) {
  const material = new THREE.MeshPhongMaterial({
      map: diffuseTexture,
      normalMap: normalTexture,
      displacementMap: displacementTexture,
      displacementScale: 0.2,
      aoMap: aoTexture,
      specularMap: specularTexture,
  });

  const tile = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200, 50, 50),
      material
  );
  tile.rotation.x = -Math.PI / 2;
  tile.position.x = x * 200;
  tile.position.z = z * 200;
  tile.position.y = -20;
  return tile;
}

function updateTerrain() {
  const camX = Math.floor(camera.position.x / 200);
  const camZ = Math.floor(camera.position.z / 200);

  for (let x = camX - 1; x <= camX + 1; x++) {
      for (let z = camZ - 1; z <= camZ + 1; z++) {
          const key = x + '_' + z;
          if (!tiles[key]) {
              const tile = createTerrainTile();
              tile.position.x = x * 200;
              tile.position.z = z * 200;
              scene.add(tile);
              tiles[key] = tile;
          }
      }
  }

  // Remove distant tiles
  Object.keys(tiles).forEach(key => {
      const parts = key.split('_');
      if (Math.abs(camX - parseInt(parts[0])) > 2 || Math.abs(camZ - parseInt(parts[1])) > 2) {
          scene.remove(tiles[key]);
          delete tiles[key];
      }
  });
}

// Call updateTerrain in the animation loop
// function animate() {
//   requestAnimationFrame(animate);
//   updateTerrain();
//   renderer.render(scene, camera);
// }

// animate();




/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    updateTerrain();

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

    // camera.position.x = engineGroup.position.x
    // camera.position.y = engineGroup.position.y + 5 // Offset by 5 units above the mesh
    // camera.position.z = engineGroup.position.z + 30 // Offset by 10 units back

    camera.lookAt(engineGroup.position); // Make the camera always look at the mesh
    cubeCamera.position.copy(engineGroup.position);

  
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

