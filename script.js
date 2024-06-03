import * as THREE from 'three'
import * as CANNON from 'cannon'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import GUI from 'lil-gui'

// GUI
// const gui = new GUI()
// gui.close()

const canvas = document.querySelector('canvas.webgl')

// LOADING SCREEN FOR HALF A SECOND
const loadingScreen = document.getElementById('loading-screen')
setTimeout(() => {
  loadingScreen.style.display = 'none'
}, 1000)

const scene = new THREE.Scene()

const numberOfTargets = 3
const maxClonesNumber = 20
const clonesOnHit = 3
let isEndOfGame = false
const separationDistance = 40
// let isTornado = false


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

/// Targets

let targetMeshesArray = []
// let objectsToUpdate = []
// let allowCloning = true

function getRandomColor() {;
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandomGreyscaleColor() {
  const value = Math.floor(Math.random() * 256);
  const hexValue = value.toString(16).padStart(2, '0');
  const color = `#${hexValue}${hexValue}${hexValue}`;
  return color;
}
  
function getRandomBlackOrWhite() {
  const isWhite = Math.random() < 0.5;
  return isWhite ? '#FFFFFF' : '#000000';
}


const targetGeometry = new THREE.SphereGeometry(4, 32, 32)

const createTargetMeshes = () => {
  // console.log('createTargetMeshes');
  
  for(let i = 0; i < numberOfTargets; i++) {

    const targetMaterial = new THREE.MeshPhysicalMaterial({ emissive: 'black', roughness: 0, metalness: 0.2 })  // { color: '#B6BBC4', emissive: 'black', roughness: 0.5, metalness: 0.5}
    targetMaterial.transmission = 0
    targetMaterial.ior = 1.592
    targetMaterial.thickness = 0.2379
    const targetColor = getRandomColor()
    targetMaterial.color = new THREE.Color(targetColor)

    // const angle = Math.random() * Math.PI * 2
    // const radius = 60 + Math.random() * 20
    // const x = Math.sin(angle) * radius
    // const z = Math.cos(angle) * radius

    const target = new THREE.Mesh(targetGeometry, targetMaterial)
    // target.position.set(x, 0, z)

    target.position.set((i + 1) * separationDistance, 0, 0)
    // target.castShadow = true
    target.scale.set(0.5, 1, 1)

    targetMeshesArray.push(target)
    scene.add(target)

    // targets.add(target)
  }
}


// const createTargets = () => {
//   createTargetMeshes()
//   scene.add(targets)
// }

// createTargetMeshes()

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
engineGroup.position.set(0, 0, 0)

scene.add(engineGroup);

/**
 * Physics
 */

// World
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, 0, 0), // m/s²
})

// Material
const defaultMaterial = new CANNON.Material('default')

const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.9,
        restitution: 0.7
    }
)
world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial

// Cannon.js Target Body

let targetObjects = []
let targetBodiesArray = []
let lastCollisionTime = 0

const makeTargetBodies = (target) => {
  const targetShape = new CANNON.Sphere(target.geometry.parameters.radius)
  const targetBody = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(target.position.x, target.position.y, target.position.z),
      shape: targetShape,
  })
  targetBodiesArray.push(targetBody)

  function applyImpulse(body, impulse, contactPoint) {
      body.applyImpulse(impulse, contactPoint);
  }

  targetBody.addEventListener('collide', event => {
      const otherBody = event.body;
      const contact = event.contact;
      let normal = null;
      let currentCollisionTime = null;

      if (otherBody.id === engineBody.id) {

        currentCollisionTime = new Date()
        if (currentCollisionTime - lastCollisionTime < 100) {
          return; // Exit if less than 1 second has passed
        }
        lastCollisionTime = currentCollisionTime;
      }



      // Get the normal of the contact. Make sure it points away from the surface of the stationary body
      if (contact.bi.id === targetBody.id) { // bi is body interacting
        normal = contact.ni;
      } else {
        normal = contact.ni.scale(-1);
      }

      // Calculate impulse strength
      const impulseStrength = normal.scale(10);

      // Apply the impulse to the stationary body at the contact point
      applyImpulse(event.body, impulseStrength, contact.ri);

      if (otherBody.id === engineBody.id && !isEndOfGame) { // && allowCloning
        for (let i = 0; i < clonesOnHit; i++) {
          makeClone(target, event.body, impulseStrength, contact.ri)
          // clonesArray.push(clone)
          // targetMeshesAndBodies.push(clone)
          // objectsToUpdate.push(clone)
        }
      }
  });


  targetBody.position.copy(target.position)
  // targetMeshesArray.push({ mesh: target, body: targetBody })
  targetObjects.push({ mesh: target, body: targetBody })

  world.addBody(targetBody)
}

const makeTargetObjects = () => {
  // console.log('makeTargetObjects');
  createTargetMeshes();

  targetMeshesArray.forEach(target => {
    makeTargetBodies(target)
  })
}
if (targetMeshesArray.length === 0 && !isEndOfGame) {
  makeTargetObjects()
}
// MAKE CLONE TARGET
let cloneObjects = []

const makeClone = (target, eventBody, givenImpulseStrength, contactRi) => {
  const getRandomNumber = (min, max) => {
    return Math.random() * (max - min) + min;
  }

  function applyImpulse(body, impulse, contactPoint) {
    body.applyImpulse(impulse, contactPoint);
  }
  const minNumber = -3;
  const maxNumber = 3;
  const clonePosition = {
    x: target.position.x + getRandomNumber(minNumber, maxNumber),
    y: target.position.y + getRandomNumber(minNumber, maxNumber),
    z: target.position.z + getRandomNumber(minNumber, maxNumber),
  }
  const makeCloneMesh = (target) => {
    const cloneMaterial = new THREE.MeshPhysicalMaterial({ emissive: 'black', roughness: 0, metalness: 0.2 })
    cloneMaterial.transmission = 0
    cloneMaterial.ior = 1.592
    cloneMaterial.thickness = 0.2379
    const cloneColor = getRandomColor()
    cloneMaterial.color = new THREE.Color(cloneColor)

    const clone = new THREE.Mesh(targetGeometry, cloneMaterial)
    clone.position.set(clonePosition.x, clonePosition.y, clonePosition.z)
    // clone.castShadow = true
    clone.scale.set(0.5, 1, 1)

    // clonesArray.push(clone)

    scene.add(clone)

    return clone
  }

  const cloneMesh = makeCloneMesh(target)

  const makeCloneBody = (target) => {
    const cloneShape = new CANNON.Sphere(target.geometry.parameters.radius)
    const cloneBody = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(clonePosition.x, clonePosition.y, clonePosition.z),
        shape: cloneShape,
    })
    
    // targetBodiesArray.push(cloneBody)
    world.addBody(cloneBody)

    return cloneBody
  }

  const clonePhysicsBody = makeCloneBody(target)

  clonePhysicsBody.addEventListener('collide', event => {
    const otherBody = event.body;
        const contact = event.contact;
        let normal = null;

        let currentCollisionTime = null;

        if (otherBody.id === engineBody.id) {
          currentCollisionTime = new Date()
          if (currentCollisionTime - lastCollisionTime < 100) {
            return; // Exit if less than 1 second has passed
          }
          lastCollisionTime = currentCollisionTime;
        }

        // Get the normal of the contact. Make sure it points away from the surface of the stationary body
        if (contact.bi.id === clonePhysicsBody.id) { // bi is body interacting
          normal = contact.ni;

        } else {
          normal = contact.ni.scale(-1);
        }
  
        // Calculate impulse strength
        const impulseStrength = normal.scale(10);
  
        // Apply the impulse to the stationary body at the contact point

        applyImpulse(eventBody, givenImpulseStrength, contactRi);

        if (otherBody.id === engineBody.id && !isEndOfGame) { // && allowCloning
          for (let i = 0; i < clonesOnHit; i++) {
            makeClone(cloneMesh, event.body, impulseStrength, contact.ri)
            // clonesArray.push(clone)
            // targetMeshesAndBodies.push(clone)
            // objectsToUpdate.push(clone)
          }
        }
    });
  

  const newClone = { mesh: cloneMesh, body: clonePhysicsBody }
  cloneObjects.push(newClone)
  // objectsToUpdate.push(newClone)
  return newClone
}


// Cannon.js Engine Body

const engineShape = new CANNON.Sphere(molusk.geometry.parameters.radius + 10)
const engineBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(engineGroup.position.x, engineGroup.position.y, engineGroup.position.z),
    shape: engineShape,
})

engineBody.position.copy(engineGroup.position)

world.addBody(engineBody)

// Control of Wireframes and Opacity
const isWireframe = false;
const globalOpacity = 0;

// Border Cylinder
// Step 1: Create the Trimesh for the Inner Cylinder Boundary
const innerRadius = 400; // Inner radius of the cylinder
const height = 250; // Height of the cylinder

// Function to create a Trimesh from a CylinderGeometry
function createTrimeshFromGeometry(geometry) {
  const vertices = [];
  const indices = [];

  // Extract vertices from the geometry
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    vertices.push(geometry.attributes.position.array[i * 3]);
    vertices.push(geometry.attributes.position.array[i * 3 + 1]);
    vertices.push(geometry.attributes.position.array[i * 3 + 2]);
  }

  // Extract indices from the geometry
  for (let i = 0; i < geometry.index.count; i++) {
    indices.push(geometry.index.array[i]);
  }

  return new CANNON.Trimesh(vertices, indices);
}

// Create CylinderGeometry for the inner cylinder
const cylinderGeometry = new THREE.CylinderGeometry(innerRadius, innerRadius, height, 32, 1, true);
const trimesh = createTrimeshFromGeometry(cylinderGeometry);

// Create a static body using the Trimesh
const innerCylinderBody = new CANNON.Body({
  mass: 0, // Static body
});
innerCylinderBody.addShape(trimesh);
innerCylinderBody.position.set(0, 25, 0); // Position the cylinder

// Rotate the body to align with XZ plane
const q = new CANNON.Quaternion();
q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI);
innerCylinderBody.quaternion.copy(q);

// Step 2: Add the Cylinder to the World
world.addBody(innerCylinderBody);

// Step 3: Create the Visual Representation in Three.js
const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: isWireframe, transparent: true, opacity: globalOpacity});
const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
scene.add(cylinderMesh);

// Sync the Three.js mesh position and rotation with Cannon.js body
cylinderMesh.position.copy(innerCylinderBody.position);
cylinderMesh.quaternion.copy(innerCylinderBody.quaternion);

// LIDS
// Step 3: Create the Plane Shapes for the Lids
const topPlaneShape = new CANNON.Plane();
const bottomPlaneShape = new CANNON.Plane();

// Create Bodies for the Lids
const topPlaneBody = new CANNON.Body({
  mass: 0, // Static body
  shape: topPlaneShape,
  position: new CANNON.Vec3(0, 50, 0)
});
topPlaneBody.quaternion.setFromEuler(Math.PI / 2, 0, 0);

const bottomPlaneBody = new CANNON.Body({
  mass: 0, // Static body
  shape: bottomPlaneShape,
  position: new CANNON.Vec3(0, -50, 0)
});
bottomPlaneBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

// Add the Plane Bodies to the World
  world.addBody(topPlaneBody);
  world.addBody(bottomPlaneBody);

// Visual representation for the lids (optional)
const planeGeometry = new THREE.PlaneGeometry(innerRadius * 2, innerRadius * 2);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: isWireframe, opacity: globalOpacity, transparent: true});

const topPlaneMesh = new THREE.Mesh(planeGeometry, planeMaterial);
topPlaneMesh.rotation.x = Math.PI / 2;
topPlaneMesh.position.set(topPlaneBody.position.x, topPlaneBody.position.y, topPlaneBody.position.z);
scene.add(topPlaneMesh);

const bottomPlaneMesh = new THREE.Mesh(planeGeometry, planeMaterial);
bottomPlaneMesh.rotation.x = -Math.PI / 2;
bottomPlaneMesh.position.set(bottomPlaneBody.position.x, bottomPlaneBody.position.y, bottomPlaneBody.position.z);
scene.add(bottomPlaneMesh);

// OBSTACLE

const obstacleRadiusTop = 20;
const obstacleRadiusBottom = 20;
const obstacleHeight = 100;
const obstacleNumSegments = 32;

const obstacleGeometry = new THREE.CylinderGeometry(obstacleRadiusTop, obstacleRadiusBottom, obstacleHeight, obstacleNumSegments);
const obstacleMaterial = new THREE.MeshStandardMaterial({wireframe: isWireframe, opacity: globalOpacity, transparent: true});
const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
obstacle.position.set(180, 0, 0);
// obstacle.rotation.x = Math.PI / 2; // Rotate to align with the original box orientation
scene.add(obstacle);

// Create the CANNON.js cylinder shape
const obstacleShape = new CANNON.Cylinder(obstacleRadiusTop,  obstacleRadiusBottom, obstacleHeight, obstacleNumSegments);
const obstacleBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(obstacle.position.x, obstacle.position.y, obstacle.position.z),
    shape: obstacleShape,
});

// Rotate the cylinder body to align with the Three.js mesh
const quat = new CANNON.Quaternion();
quat.setFromEuler(Math.PI / 2, 0, 0, 'XYZ'); // Rotate around the X-axis
obstacleBody.quaternion.copy(quat);

obstacleBody.position.copy(obstacle.position);
world.addBody(obstacleBody);

// LIGHTS

const lightAmbient = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( lightAmbient );

const light = new THREE.PointLight(0xffffff, 100, 0);
light.position.set(30, 0, -10);
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
      // engineGroup.rotation.y += 0.01;    
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
      // engineGroup.rotation.y += -0.01;  
  } else {
      // End of animation
      shellGroup.rotation.x = initialXRotation;
      startRightTime = null; // Reset startTime to stop the animation
  }
}

// Listen for the up arrow key
window.addEventListener('keydown', function(event) {
  if (event.key === 'ArrowUp' && !upAnimationInProgress && !isEndOfGame) {
    // Start the animation
    startUpTime = performance.now();
    upAnimationInProgress = true; // Indicate that animation is in progress
  } else if (event.key === 'ArrowLeft' && !leftAnimationInProgress && !isEndOfGame) {
    startLeftTime = performance.now();
    leftAnimationInProgress = true;
  } else if (event.key === 'ArrowRight' && !rightAnimationInProgress && !isEndOfGame) {
    startRightTime = performance.now();
    rightAnimationInProgress = true;
  } else if (event.key === 'ArrowDown' && !downAnimationInProgress && !isEndOfGame) {
    startDownTime = performance.now();
    downAnimationInProgress = true;
  }
});

// Listen for key up to reset the animation flag
window.addEventListener('keyup', function(event) {
  if (event.key === 'ArrowUp' && !isEndOfGame) {
    upAnimationInProgress = false; // Reset only after key is released
  } else if (event.key === 'ArrowLeft' && !isEndOfGame) {
    leftAnimationInProgress = false;
  } else if (event.key === 'ArrowRight' && !isEndOfGame) {
    rightAnimationInProgress = false;
  } else if (event.key === 'ArrowDown' && !isEndOfGame) {
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
  if (keyStates['ArrowUp'] && !isEndOfGame) {

    const speed = 2;

    const forward = new THREE.Vector3(-1, 0, 0); // Faces negative x-direction initially
    forward.applyEuler(new THREE.Euler(0, engineGroup.rotation.y, 0, 'XYZ'));

    engineGroup.position.add(forward.multiplyScalar(-speed));
  }
  if (keyStates['ArrowDown'] && !isEndOfGame) {
    const speed = 2;

    const backward = new THREE.Vector3(-1, 0, 0); // Faces negative x-direction initially
    backward.applyEuler(new THREE.Euler(0, engineGroup.rotation.y, 0, 'XYZ'));

    engineGroup.position.add(backward.multiplyScalar(speed));
  }
  if (keyStates['ArrowLeft'] && !isEndOfGame) {
    engineGroup.rotation.y += 0.1;  
  }
  if (keyStates['ArrowRight'] && !isEndOfGame) {
    engineGroup.rotation.y -= 0.1;
  }

  renderer.render(scene, camera);
}
requestAnimationFrame(animateForward);

/**
 * Physics Objects
 */
// objectsToUpdate.push({ mesh: engineGroup, body: engineBody })
const engineObject = { mesh: engineGroup, body: engineBody }

// targetObjects.forEach(target => {
//   objectsToUpdate.push({ mesh: target.mesh, body: target.body })
// })

// cloneObjects.forEach(clone => {
//   objectsToUpdate.push({ mesh: clone.mesh, body: clone.body })
// })


// objectsToUpdate.push({ mesh: obstacle, body: obstacleBody })
const obstacleObject = { mesh: obstacle, body: obstacleBody }

const maxAngularVelocity = 5
world.addEventListener('postStep', function() {
  targetObjects.forEach(target => {
    // Calculate the magnitude of the angular velocity vector
    const angularSpeed = target.body.angularVelocity.length();
    
    // If the angular speed exceeds the maximum, scale it down
    if (angularSpeed > maxAngularVelocity) {
      target.body.angularVelocity.scale(maxAngularVelocity / angularSpeed, target.body.angularVelocity);
    }
  });

  cloneObjects.forEach(clone => {
    // Calculate the magnitude of the angular velocity vector
    const angularSpeed = clone.body.angularVelocity.length();
    
    // If the angular speed exceeds the maximum, scale it down
    if (angularSpeed > maxAngularVelocity) {
      clone.body.angularVelocity.scale(maxAngularVelocity / angularSpeed, clone.body.angularVelocity);
    }
  });
});

/**
 * Arrow Keys On Screen
 */
// Get the arrow elements
const arrowUp = document.getElementById('arrow-up');
const arrowDown = document.getElementById('arrow-down');
const arrowLeft = document.getElementById('arrow-left');
const arrowRight = document.getElementById('arrow-right');

// Function to handle arrow keys keydown event
function handleKeyDown(event) {
  if (isEndOfGame) return

    switch (event.key) {
        case 'ArrowUp':
            arrowUp.classList.add('active');
            break;
        case 'ArrowDown':
            arrowDown.classList.add('active');
            break;
        case 'ArrowLeft':
            arrowLeft.classList.add('active');
            break;
        case 'ArrowRight':
            arrowRight.classList.add('active');
            break;
    }
}

// Function to handle arrow keys keyup event
function handleKeyUp(event) {
  if (isEndOfGame) return

    switch (event.key) {
        case 'ArrowUp':
            arrowUp.classList.remove('active');
            break;
        case 'ArrowDown':
            arrowDown.classList.remove('active');
            break;
        case 'ArrowLeft':
            arrowLeft.classList.remove('active');
            break;
        case 'ArrowRight':
            arrowRight.classList.remove('active');
            break;
    }
}

// Add event listeners for keydown and keyup events
if (!isEndOfGame) {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
}


/**
 * Reset Button on Screen
 */
// Event listener for esc keydown event
/*
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
      isEndOfGame = false
      // console.log('objectsToUpdate :>> ', objectsToUpdate);
      hasMovedToEdges = false

      // targetMeshesArray = []
      // targetMeshesAndBodies = []
      // targetBodiesArray = []


      targetMeshesArray.forEach(target => {
        scene.remove(target)
      })
      // scene.remove(targets)
      targetBodiesArray.forEach(body => {
        world.remove(body)
      })

      targetMeshesArray = []
      targetObjects = []
      
      // objectsToUpdate = []
      targetMeshesArray = []
      targetObjects = []
      // let newObjectsToUpdate = objectsToUpdate.filter(object => object.mesh !== obstacle)
      // console.log('newObjectsToUpdate :>> ', newObjectsToUpdate);
      // objectsToUpdate = [...newObjectsToUpdate]


      // objectsToUpdate.push({ mesh: engineGroup, body: engineBody })
      // objectsToUpdate.push({ mesh: obstacle, body: obstacleBody })
      // camera.lookAt(engineGroup.position)

      const escapeKeyButton = document.getElementById('escape-key');
      escapeKeyButton.classList.add('active');

      world.gravity.set(0, 0, 0);

      // Bring back the targets to their newly calculated initial positions
      // targetBodiesArray.forEach(body => {
      //   const angle = Math.random() * Math.PI * 2
      //   const radius = 60 + Math.random() * 20
      //   const x = Math.sin(angle) * radius
      //   const z = Math.cos(angle) * radius
    
      //   body.position.set(x, 0, z)
      //   body.velocity.set(0, 0, 0);
      //   body.angularVelocity.set(0, 0, 0);
        
      //   // Set the rotation using a quaternion
      //   const quat = new CANNON.Quaternion();
      //   quat.setFromEuler(Math.PI, Math.PI, 0);
      //   body.quaternion.copy(quat);
      // });


      // createTargets()
      createTargetMeshes()
      // console.log('targetMeshesArray :>> ', targetMeshesArray);
      
      targetMeshesArray.forEach(target => {
        makeTargetBodies(target)
      })
      // console.log('targetMeshesAndBodies :>> ', targetMeshesAndBodies);
      // targetObjects.forEach(target => {
      //   objectsToUpdate.push({ mesh: target.mesh, body: target.body })
      // })
  
      // Reset the button style after some time
      setTimeout(() => {
          escapeKeyButton.classList.remove('active');
      }, 100);

      cloneObjects.forEach(clone => {
        scene.remove(clone.mesh)
        world.remove(clone.body)
      })
      
      cloneObjects = []
      // allowCloning = true
      // if (targetMeshesAndBodies.length < maxTargetsNumber) {
      //   allowCloning = true
      // }
  }
});
*/

/**
 * Screen Buttons
 */

// ESCAPE KEY
// function handleKeyPress(key) {
//   // Create an artificial keydown event
//   const event = new KeyboardEvent('keydown', { key: key });
//   // Dispatch the event
//   document.dispatchEvent(event);
// }

// Add event listeners for div clicks
// document.getElementById('escape-key').addEventListener('click', () => {
//   handleKeyPress('Escape');
// });

// ARROW UP
// Function to simulate keydown event
function simulateArrowUpKeyDown() {
  if (isEndOfGame) return
  
  const arrowUpEvent = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      code: 'ArrowUp',
      keyCode: 38, // 38 is the keyCode for the ArrowUp key
      which: 38,
      bubbles: true,
      cancelable: true
  });
  document.dispatchEvent(arrowUpEvent);
}

// Function to simulate keyup event
function simulateArrowUpKeyUp() {
  if (isEndOfGame) return

  const arrowUpEvent = new KeyboardEvent('keyup', {
      key: 'ArrowUp',
      code: 'ArrowUp',
      keyCode: 38, // 38 is the keyCode for the ArrowUp key
      which: 38,
      bubbles: true,
      cancelable: true
  });
  document.dispatchEvent(arrowUpEvent);
}

// Function to start continuous key press simulation
function startArrowUpKeyPress() {
    simulateArrowUpKeyDown(); // Simulate an initial key press
}

// Function to stop continuous key press simulation
function stopArrowUpKeyPress() {
    simulateArrowUpKeyUp()
}

// Add event listeners for the arrow-up div
const arrowUpDiv = document.getElementById('arrow-up');
arrowUpDiv.addEventListener('mousedown', startArrowUpKeyPress);
arrowUpDiv.addEventListener('touchstart', startArrowUpKeyPress);

// Add event listeners to the document to ensure we capture the mouseup event
document.addEventListener('mouseup', stopArrowUpKeyPress);
document.addEventListener('mouseleave', stopArrowUpKeyPress); // Stop if the mouse leaves the document
document.addEventListener('touchend', stopArrowUpKeyPress);
document.addEventListener('touchcancel', stopArrowUpKeyPress); 

// ARROW LEFT
// Function to simulate keydown event for ArrowLeft
function simulateArrowLeftKeyDown() {
  const arrowLeftEvent = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      code: 'ArrowLeft',
      keyCode: 37, // 37 is the keyCode for the ArrowLeft key
      which: 37,
      bubbles: true,
      cancelable: true
  });
  document.dispatchEvent(arrowLeftEvent);
}

// Function to simulate keyup event for ArrowLeft
function simulateArrowLeftKeyUp() {
  const arrowLeftEvent = new KeyboardEvent('keyup', {
      key: 'ArrowLeft',
      code: 'ArrowLeft',
      keyCode: 37, // 37 is the keyCode for the ArrowLeft key
      which: 37,
      bubbles: true,
      cancelable: true
  });
  document.dispatchEvent(arrowLeftEvent);
}

// Function to start continuous key press simulation
function startArrowLeftKeyPress() {
  simulateArrowLeftKeyDown(); // Simulate an initial key press
}

// Function to stop continuous key press simulation
function stopArrowLeftKeyPress() {
  simulateArrowLeftKeyUp()
}

// Add event listeners for the arrow-left div
const arrowLeftDiv = document.getElementById('arrow-left');
arrowLeftDiv.addEventListener('mousedown', startArrowLeftKeyPress);
arrowLeftDiv.addEventListener('touchstart', startArrowLeftKeyPress);

// Add event listeners to the document to ensure we capture the mouseup event
document.addEventListener('mouseup', stopArrowLeftKeyPress);
document.addEventListener('mouseleave', stopArrowLeftKeyPress); // Stop if the mouse leaves the document
document.addEventListener('touchend', stopArrowLeftKeyPress);
document.addEventListener('touchcancel', stopArrowLeftKeyPress); 

// ARROW RIGHT
// Function to simulate keydown event for ArrowRight
function simulateArrowRightKeyDown() {
  const arrowRightEvent = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      code: 'ArrowRight',
      keyCode: 39, // 39 is the keyCode for the ArrowRight key
      which: 39,
      bubbles: true,
      cancelable: true
  });
  document.dispatchEvent(arrowRightEvent);
}

// Function to simulate keyup event for ArrowRight
function simulateArrowRightKeyUp() {
  const arrowRightEvent = new KeyboardEvent('keyup', {
      key: 'ArrowRight',
      code: 'ArrowRight',
      keyCode: 39, // 39 is the keyCode for the ArrowRight key
      which: 39,
      bubbles: true,
      cancelable: true
  });
  document.dispatchEvent(arrowRightEvent);
}

// Function to start continuous key press simulation
function startArrowRightKeyPress() {
  simulateArrowRightKeyDown(); // Simulate an initial key press
}

// Function to stop continuous key press simulation
function stopArrowRightKeyPress() {
  simulateArrowRightKeyUp()
}

// Add event listeners for the arrow-right div
const arrowRightDiv = document.getElementById('arrow-right');
arrowRightDiv.addEventListener('mousedown', startArrowRightKeyPress);
arrowRightDiv.addEventListener('touchstart', startArrowRightKeyPress);

// Add event listeners to the document to ensure we capture the mouseup event
document.addEventListener('mouseup', stopArrowRightKeyPress);
document.addEventListener('mouseleave', stopArrowRightKeyPress); // Stop if the mouse leaves the document
document.addEventListener('touchend', stopArrowRightKeyPress);
document.addEventListener('touchcancel', stopArrowRightKeyPress); 

// ARROW DOWN
// Function to simulate keydown event for ArrowDown
function simulateArrowDownKeyDown() {
  const arrowDownEvent = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      code: 'ArrowDown',
      keyCode: 40, // 40 is the keyCode for the ArrowDown key
      which: 40,
      bubbles: true,
      cancelable: true
  });
  document.dispatchEvent(arrowDownEvent);
}

// Function to simulate keyup event for ArrowDown
function simulateArrowDownKeyUp() {
  const arrowDownEvent = new KeyboardEvent('keyup', {
      key: 'ArrowDown',
      code: 'ArrowDown',
      keyCode: 40, // 40 is the keyCode for the ArrowDown key
      which: 40,
      bubbles: true,
      cancelable: true
  });
  document.dispatchEvent(arrowDownEvent);
}

// Function to start continuous key press simulation
function startArrowDownKeyPress() {
  simulateArrowDownKeyDown(); // Simulate an initial key press
}

// Function to stop continuous key press simulation
function stopArrowDownKeyPress() {
  simulateArrowDownKeyUp()
}

// Add event listeners for the arrow-down div
const arrowDownDiv = document.getElementById('arrow-down');
arrowDownDiv.addEventListener('mousedown', startArrowDownKeyPress);
arrowDownDiv.addEventListener('touchstart', startArrowDownKeyPress);

// Add event listeners to the document to ensure we capture the mouseup event
document.addEventListener('mouseup', stopArrowDownKeyPress);
document.addEventListener('mouseleave', stopArrowDownKeyPress); // Stop if the mouse leaves the document
document.addEventListener('touchend', stopArrowDownKeyPress);
document.addEventListener('touchcancel', stopArrowDownKeyPress); 

// const endGameCheck = () => {
//   if (isEndOfGame) {
//     world.gravity.set(0, -20, 0);
//   }
// }

const endSequence = () => {
  loadingScreen.style.display = 'flex'
  setTimeout(() => {
    loadingScreen.style.display = 'none'
  }, 1000)
    // if (isEndOfGame) {
      // world.gravity.set(-40, 0, 0);

      // materialSphere.color = new THREE.Color('black')

      // cloneObjects.forEach((clone) => {
      //   clone.mesh.material.color = new THREE.Color('white')
      //   clone.mesh.material.metalness = 1;
      //   // clone.mesh.scale.set(0.8, 0.8, 0.8)
      // })

      // targetObjects.forEach((target) => {
      //   target.mesh.material.color = new THREE.Color('white')
      //   target.mesh.material.metalness = 1;
      //   // target.mesh.scale.set(0.8, 0.8, 0.8)
      // })

      // world.gravity.set(0, -40, 0);
      

      // setTimeout(() => {
        isEndOfGame = true
        // world.gravity.set(0, 0, 0);

        cloneObjects.forEach((clone) => {
          clone.mesh.material.color = new THREE.Color('white')
          clone.mesh.material.metalness = 1;
        })

        while (cloneObjects.length > 0) {
          const clone = cloneObjects.pop()
          scene.remove(clone.mesh)
          world.remove(clone.body)
        }

        engineObject.body.position.set(0, 0, 0)
        engineObject.body.velocity.set(0, 0, 0);
        engineObject.body.angularVelocity.set(0, 0, 0);

        engineObject.mesh.position.set(0, 0, 0)
        engineObject.mesh.rotation.set(0, 0, 0)


        // console.log('targetObjects :>> ', targetObjects);

        for (let i = 0; i < numberOfTargets; i++) {
          const target = targetObjects[i]
          // console.log('target.mesh.position :>> ', target.mesh.position);
          target.body.position.set((i + 1) * separationDistance, 0, 0)
          target.body.velocity.set(0, 0, 0);
          target.body.angularVelocity.set(0, 0, 0);
        }


        // targetObjects.forEach((target, index) => {
        //   target.position.set((index + 1) * separationDistance, 0, 0)
        //   target.body.velocity.set(0, 0, 0);
        //   target.body.angularVelocity.set(0, 0, 0);

        // })

        // engineObject.body.position.set(-35, 0, 0)
        // camera.position.set(-45, 0, 30)
        // isEndOfGame = true
      // }, 1000);

      setTimeout(() => {
        isEndOfGame = false
        lastCollisionTime = 0
        // targetMeshesArray = []
        // targetObjects = []
        cloneObjects = []
        // makeTargetObjects()
        tick()
      }, 1000);

      // setTimeout(() => {
      //   isTornado = true
      //   world.gravity.set(0, 0, 0);
      // }, 60000);
    // }
  }

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

// Variables for circular motion of the obstacle
const obstacleRotationRadius = innerRadius - 20;

// INTRO CAMERA MOVEMENT

// Define the starting and target positions
const startPosition = new THREE.Vector3(0, -200, 0);
const targetPosition = new THREE.Vector3(-30, 0, -60);
camera.position.copy(startPosition);

// Define the duration of the movement in seconds
const introDuration = 5; // move over 5 seconds

const initialCameraMovement = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - oldElapsedTime
  oldElapsedTime = elapsedTime

  // Calculate the interpolation factor (between 0 and 1)
  const t = Math.min(elapsedTime / introDuration, 1);

  // Interpolate between the start and target positions
  camera.position.lerpVectors(startPosition, targetPosition, t);

  // Update controls
  controls.update()
  // camera.lookAt(engineGroup.position)

    // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  if (elapsedTime < 5) {
    window.requestAnimationFrame(initialCameraMovement)
  }
}

function updateGravity(elapsedTime, radius) {
  const angle = elapsedTime % (2 * Math.PI); // Angle based on elapsed time
  const x = radius * Math.cos(angle); // X coordinate on the circle
  const z = radius * Math.sin(angle); // Z coordinate on the circle

  // Set the new gravity direction
  world.gravity.set(x, 0, z);
}


const sceneIsReady = scene.children.length = 9;

if (sceneIsReady) {
  initialCameraMovement()
}

// let hasMovedToEdges = false; 

const tick = () => {
  if (isEndOfGame) return

  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - oldElapsedTime
  oldElapsedTime = elapsedTime

  world.step(1 / 60, deltaTime, 3)

  // Engine mesh and body movement
  engineObject.body.position.copy(engineObject.mesh.position)
  engineObject.body.quaternion.copy(engineObject.mesh.quaternion)

  // Obstacle mesh and body movement
  obstacleObject.mesh.position.copy(obstacleObject.body.position)
  obstacleObject.mesh.quaternion.copy(obstacleObject.body.quaternion)

  // Target mesh and body movement
  for (const object of targetObjects) {
    object.mesh.position.copy(object.body.position)
    object.mesh.quaternion.copy(object.body.quaternion)
  }
  
  // Clones mesh and body movement
  for (const clone of cloneObjects) {
    clone.mesh.position.copy(clone.body.position)
    clone.mesh.quaternion.copy(clone.body.quaternion)
  }

  if (cloneObjects.length < maxClonesNumber) {
    isEndOfGame = false
  }
  // console.log('targetMeshesAndBodies.length :>> ', targetMeshesAndBodies.length);
  if (cloneObjects.length >= maxClonesNumber) {
    // console.log('cloneObjects.length :>> ', cloneObjects.length);
    // isEndOfGame = true
    endSequence()

    // setTimeout(() => {
      // lastCollisionTime = 0
      // targetMeshesArray = []
      // targetObjects = []
      // cloneObjects = []
    // }, 3000);
    // setTimeout(() => {
    //   // lastCollisionTime = 0
    //   // targetMeshesArray = []
    //   // targetObjects = []
    //   // cloneObjects = []
    //   endSequence()
    // }, 1000);
  } 

  // Update objects
  torusOne.rotation.y = elapsedTime * 2
  torusTwo.rotation.y = elapsedTime * 0.1
  torusThree.rotation.y = elapsedTime * 2
  headSphere.rotation.y = elapsedTime * 1

  torusOne.rotation.x = elapsedTime * (-0.1)
  torusTwo.rotation.x = elapsedTime * (-2)
  torusThree.rotation.x = elapsedTime * (-0.5)
  headSphere.rotation.x = elapsedTime * (-1)

  obstacleBody.position.x = obstacleRotationRadius * Math.cos(elapsedTime * 2);
  obstacleBody.position.y = 0; // Keep it on the horizontal plane
  obstacleBody.position.z = obstacleRotationRadius * Math.sin(elapsedTime * 2);

  let newElapsedTime = elapsedTime - 5;

  if (elapsedTime >= 5) {
    camera.position.y = Math.sin(newElapsedTime * 0.1) * 20
  }

  // if (isTornado) {
  //   const radius = 140; // Example radius value, adjust as needed
  //   updateGravity(elapsedTime, radius);

  //   // const newElapsedTime = clock.getElapsedTime()
  //   obstacleBody.position.x = 300
  //   obstacleBody.position.z = 300
  //   obstacleBody.position.y = 300

  //   // for (const object of targetObjects) {
  //   //   object.body.position.x = object.body.position.x * Math.cos(newElapsedTime * 2)
  //   //   object.body.position.y = object.body.position.y
  //   //   object.body.position.z = object.body.position.z * Math.sin(newElapsedTime * 2)
  //   // }
    
  //   // // Clones mesh and body movement
  //   // for (const clone of cloneObjects) {
  //   //  clone.body.position.x = clone.body.position.x * Math.cos(newElapsedTime * 2)
  //   //  clone.body.position.y = clone.body.position.y
  //   //  clone.body.position.z = clone.body.position.z * Math.sin(newElapsedTime * 2)
  //   // }
  // }


  // console.log('engineGroup.position :>> ', engineGroup.position);
  // console.log('objectsToUpdate.length :>> ', objectsToUpdate.length);
  camera.lookAt(engineGroup.position)

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

if (sceneIsReady) {
  tick()
}
