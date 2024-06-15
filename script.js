import * as THREE from 'three'
import * as CANNON from 'cannon'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import GUI from 'lil-gui'
import { int } from 'three/examples/jsm/nodes/Nodes.js'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

// GUI
// const gui = new GUI()
// gui.close()

const canvas = document.querySelector('canvas.webgl')

// Audio Listener
const listener = new THREE.AudioListener()
// const candyHitSound = new THREE.Audio(listener)
const audioLoader = new THREE.AudioLoader()
const audioContext = listener.context

function resumeAudioContext() {
  if (audioContext.state === 'suspended') {
      audioContext.resume();
  }
}

window.addEventListener('click', resumeAudioContext);
window.addEventListener('touchstart', resumeAudioContext);

let candySoundBuffer = null

audioLoader.load('candy_hit.wav', function(buffer) {
  candySoundBuffer = buffer
  // candyHitSound.setBuffer(buffer)
  // candyHitSound.setLoop(false)
  // candyHitSound.setVolume(0.5)
})

// const targetHitSound = new THREE.Audio(listener)
let targetSoundBuffer = null

audioLoader.load('target_hit.wav', function(buffer) {
  targetSoundBuffer = buffer
  // targetHitSound.setBuffer(buffer)
  // targetHitSound.setLoop(false)
  // targetHitSound.setVolume(0.5)
})
const winSound = new THREE.Audio(listener)
audioLoader.load('win.wav', function(buffer) {  
  winSound.setBuffer(buffer)
  winSound.setLoop(false)
  winSound.setVolume(0.5)
})

// LOADING SCREEN FOR HALF A SECOND
const loadingScreen = document.getElementById('loading-screen')
setTimeout(() => {
  loadingScreen.style.display = 'none'
}, 1000)

const scene = new THREE.Scene()

const numberOfTargets = 6
const numberOfCoins = 5
const maxClonesNumber = 40
const clonesOnHit = 3
let isEndOfGame = false
const separationDistance = 60
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


const targetTorusGeometry = new THREE.TorusGeometry(4, 2, 16, 100)
const targetSphereGeometry = new THREE.SphereGeometry(4, 32, 32)
const targetGeometry = new THREE.SphereGeometry(4, 32, 32)

const createTargetMeshes = () => {
  // console.log('createTargetMeshes');
  
  for(let i = 0; i < numberOfTargets; i++) {

    const targetMaterial = new THREE.MeshPhysicalMaterial({ emissive: 'black', roughness: 0, metalness: 0.2 })  // { color: '#B6BBC4', emissive: 'black', roughness: 0.5, metalness: 0.5}
    targetMaterial.transmission = 0
    targetMaterial.ior = 1.592
    targetMaterial.thickness = 0.2379
    // const targetColor = getRandomColor()
    const targetColor = 'white'
    targetMaterial.color = new THREE.Color(targetColor)
    targetMaterial.metalness = 0.8
    targetMaterial.roughness = 0
    // targetMaterial.color = new THREE.Color(targetColor)

    // const angle = Math.random() * Math.PI * 2
    // const radius = 60 + Math.random() * 20
    // const x = Math.sin(angle) * radius
    // const z = Math.cos(angle) * radius

    const target = new THREE.Mesh(targetSphereGeometry, targetMaterial)
    // target.position.set(x, 0, z)

    // for (let i = 0; i < numberOfTargets; i++) {
      // const target = targetObjects[i]
      // console.log('target.mesh.position :>> ', target.mesh.position);
    if (i === 0) {
      target.position.set(separationDistance, 0, -separationDistance)
    } else if (i === 1) {
      target.position.set(separationDistance * 2, 0, 0)
    } else if (i === 2) {
      target.position.set(separationDistance, 0, separationDistance)
    } else if (i === 3) {
      target.position.set(separationDistance, 0, -(separationDistance + (separationDistance / 2)))
    } else if (i === 4) {
      target.position.set((separationDistance * 2) + (separationDistance / 2), 0, 0)
    } else if (i === 5) {
      target.position.set(separationDistance, 0, separationDistance + (separationDistance / 2))
    }

    // }

    // target.position.set((i + 1) * separationDistance, 0, 0)
    // target.castShadow = true
    target.scale.set(1, 1, 1)

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
        // if (!targetHitSound.isPlaying) {
          // targetHitSound.play();
        // }
        // const targetHitSound = new THREE.Audio(listener)
        // targetHitSound.setBuffer(targetSoundBuffer)
        // targetHitSound.setLoop(false)
        // targetHitSound.setVolume(0.5)
        // targetHitSound.play();

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
          if (cloneObjects.length < maxClonesNumber) {
            makeClone(target, event.body, impulseStrength, contact.ri)
          }
          // makeClone(target, event.body, impulseStrength, contact.ri)
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
let coinObjects = []

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
  const makeCloneMesh = () => {
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
          // if (!candyHitSound.isPlaying) {
            // candyHitSound.play();
          // }
          // const candyHitSound = new THREE.Audio(listener)
          // candyHitSound.setBuffer(candySoundBuffer)
          // candyHitSound.setLoop(false)
          // candyHitSound.setVolume(0.5)
          // candyHitSound.play();
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

        // if (otherBody.id === engineBody.id && !isEndOfGame) { // && allowCloning
        //   for (let i = 0; i < clonesOnHit; i++) {
        //     makeClone(cloneMesh, event.body, impulseStrength, contact.ri)
        //   }
        // }
    });
  

  const newClone = { mesh: cloneMesh, body: clonePhysicsBody }
  cloneObjects.push(newClone)
  // objectsToUpdate.push(newClone)
  return newClone
}

const makeCoin = (clone) => {
  const getRandomNumber = (min, max) => {
    return Math.random() * (max - min) + min;
  }

  const minNumber = -3;
  const maxNumber = 3;
  const coinPosition = {
    x: clone.position.x + getRandomNumber(minNumber, maxNumber),
    y: clone.position.y + getRandomNumber(minNumber, maxNumber),
    z: clone.position.z + getRandomNumber(minNumber, maxNumber),
  }
  const makeCoinMesh = () => {
    const coinMaterial = new THREE.MeshPhysicalMaterial({ emissive: 'black', roughness: 0, metalness: 0.2 })
    coinMaterial.transmission = 0
    coinMaterial.ior = 1.592
    coinMaterial.thickness = 0.2379
    coinMaterial.metalness = 0.8
    coinMaterial.color = new THREE.Color('gold')

    const coin = new THREE.Mesh(targetGeometry, coinMaterial)
    coin.position.set(coinPosition.x, coinPosition.y, coinPosition.z)
    // coin.castShadow = true
    coin.scale.set(1, 1, 1)

    // coinsArray.push(coin)

    scene.add(coin)

    return coin
  }

  const coinMesh = makeCoinMesh(clone)

  const makeCoinBody = (coin) => {
    const coinShape = new CANNON.Sphere(coin.geometry.parameters.radius)
    const coinBody = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(coinPosition.x, coinPosition.y, coinPosition.z),
        shape: coinShape,
    })
    
    // coinBodiesArray.push(coinBody)
    world.addBody(coinBody)

    return coinBody
  }

  const coinPhysicsBody = makeCoinBody(clone)

  // coinPhysicsBody.addEventListener('collide', event => {
  //   const otherBody = event.body;
  //       const contact = event.contact;
  //       let normal = null;

  //       let currentCollisionTime = null;

  //       if (otherBody.id === engineBody.id) {
  //         currentCollisionTime = new Date()
  //         if (currentCollisionTime - lastCollisionTime < 100) {
  //           return; // Exit if less than 1 second has passed
  //         }
  //         lastCollisionTime = currentCollisionTime;
  //       }

  //       // Get the normal of the contact. Make sure it points away from the surface of the stationary body
  //       if (contact.bi.id === coinPhysicsBody.id) { // bi is body interacting
  //         normal = contact.ni;

  //       } else {
  //         normal = contact.ni.scale(-1);
  //       }
  
  //       // Calculate impulse strength
  //       const impulseStrength = normal.scale(10);
  
  //       // Apply the impulse to the stationary body at the contact point

  //       applyImpulse(eventBody, givenImpulseStrength, contactRi);

  //       // if (otherBody.id === engineBody.id && !isEndOfGame) { // && allowCloning
  //       //   for (let i = 0; i < clonesOnHit; i++) {
  //       //     makeClone(coinMesh, event.body, impulseStrength, contact.ri)
  //       //   }
  //       // }
  //   });
  

  const newCoin = { mesh: coinMesh, body: coinPhysicsBody }
  coinObjects.push(newCoin)
  // objectsToUpdate.push(newCoin)
  return newCoin
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
  if ((event.key === 'ArrowUp' || event.key === 'w') && !upAnimationInProgress && !isEndOfGame) {
    // Start the animation
    startUpTime = performance.now();
    upAnimationInProgress = true; // Indicate that animation is in progress
  } else if (event.key === 'ArrowLeft' && !leftAnimationInProgress && !isEndOfGame) {
    startLeftTime = performance.now();
    leftAnimationInProgress = true;
  } else if (event.key === 'ArrowRight' && !rightAnimationInProgress && !isEndOfGame) {
    startRightTime = performance.now();
    rightAnimationInProgress = true;
  } else if ((event.key === 'ArrowDown' || event.key === 's') && !downAnimationInProgress && !isEndOfGame) {
    startDownTime = performance.now();
    downAnimationInProgress = true;
  }
});

// Listen for key up to reset the animation flag
window.addEventListener('keyup', function(event) {
  if ((event.key === 'ArrowUp' || event.key === 'w') && !isEndOfGame) {
    upAnimationInProgress = false; // Reset only after key is released
  } else if (event.key === 'ArrowLeft' && !isEndOfGame) {
    leftAnimationInProgress = false;
  } else if (event.key === 'ArrowRight' && !isEndOfGame) {
    rightAnimationInProgress = false;
  } else if ((event.key === 'ArrowDown' || event.key === 's') && !isEndOfGame) {
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

function animateTop(time) {
  requestAnimationFrame(animateTop);
  
  // Time delta in seconds
  let deltaTime = time * 0.001;  // Convert from milliseconds to seconds

  // Handle continuous movement based on key states
  if (keyStates['w'] && !isEndOfGame) {

    const speed = 0.5;

    const top = new THREE.Vector3(0, 1, 0); // Faces negative x-direction initially
    // top.applyEuler(new THREE.Euler(0, engineGroup.rotation.y, 0, 'XYZ'));
    if (engineGroup.position.y < 50) {
      engineGroup.position.add(top.multiplyScalar(speed));
    }
    // engineGroup.position.add(top.multiplyScalar(speed));
  }
  if (keyStates['s'] && !isEndOfGame) {
    const speed = 0.5;

    const down = new THREE.Vector3(0, -1, 0); // Faces negative x-direction initially
    // down.applyEuler(new THREE.Euler(0, engineGroup.rotation.y, 0, 'XYZ'));
    if (engineGroup.position.y > -50) {
      engineGroup.position.add(down.multiplyScalar(speed));
    }
    // engineGroup.position.add(down.multiplyScalar(speed));
  }
  renderer.render(scene, camera);
}
requestAnimationFrame(animateTop);

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

const wKey = document.getElementById('w-key');
const sKey = document.getElementById('s-key');

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
        case 'w':
            wKey.classList.add('active');
            break;
        case 's':
            sKey.classList.add('active');
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
        case 'w':
            wKey.classList.remove('active');
            break;
        case 's':
            sKey.classList.remove('active');
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

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    // Reset the game
    endSequence(true);
  }
});


/**
 * Screen Buttons
 */

// ESCAPE KEY
function handleKeyPress(key) {
  // Create an artificial keydown event
  const event = new KeyboardEvent('keydown', { key: key });
  // Dispatch the event
  document.dispatchEvent(event);
}

// Add event listeners for div clicks
document.getElementById('escape-key').addEventListener('click', () => {
  handleKeyPress('Escape');
});

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

// W KEY
// Function to simulate keydown event
function simulateWKeyDown() {
  if (isEndOfGame) return
  
  const wKeyEvent = new KeyboardEvent('keydown', {
      key: 'w',
      code: 'KeyW',
      keyCode: 87, // 87 is the keyCode for the 'w' key
      which: 87,
      bubbles: true,
      cancelable: true
  });
  document.dispatchEvent(wKeyEvent);
}

// Function to simulate keyup event
function simulateWKeyUp() {
  if (isEndOfGame) return

  const wKeyEvent = new KeyboardEvent('keyup', {
      key: 'w',
      code: 'KeyW',
      keyCode: 87, // 87 is the keyCode for the 'w' key
      which: 87,
      bubbles: true,
      cancelable: true
  });
  document.dispatchEvent(wKeyEvent);
}

// Function to start continuous key press simulation
function startWKeyPress() {
    simulateWKeyDown(); // Simulate an initial key press
}

// Function to stop continuous key press simulation
function stopWKeyPress() {
    simulateWKeyUp()
}

// Add event listeners for the w-key div
const wKeyDiv = document.getElementById('w-key');
wKeyDiv.addEventListener('mousedown', startWKeyPress);
wKeyDiv.addEventListener('touchstart', startWKeyPress);

// Add event listeners to the document to ensure we capture the mouseup event
document.addEventListener('mouseup', stopWKeyPress);
document.addEventListener('mouseleave', stopWKeyPress); // Stop if the mouse leaves the document
document.addEventListener('touchend', stopWKeyPress);
document.addEventListener('touchcancel', stopWKeyPress);

// S KEY
// Function to simulate keydown event
function simulateSKeyDown() {
  if (isEndOfGame) return
  
  const sKeyEvent = new KeyboardEvent('keydown', {
      key: 's',
      code: 'KeyS',
      keyCode: 83, // 83 is the keyCode for the 's' key
      which: 83,
      bubbles: true,
      cancelable: true
  });
  document.dispatchEvent(sKeyEvent);
}

// Function to simulate keyup event
function simulateSKeyUp() {
  if (isEndOfGame) return

  const sKeyEvent = new KeyboardEvent('keyup', {
      key: 's',
      code: 'KeyS',
      keyCode: 83, // 83 is the keyCode for the 's' key
      which: 83,
      bubbles: true,
      cancelable: true
  });
  document.dispatchEvent(sKeyEvent);
}

// Function to start continuous key press simulation
function startSKeyPress() {
    simulateSKeyDown(); // Simulate an initial key press
}

// Function to stop continuous key press simulation
function stopSKeyPress() {
    simulateSKeyUp()
}

// Add event listeners for the s-key div
const sKeyDiv = document.getElementById('s-key');
sKeyDiv.addEventListener('mousedown', startSKeyPress);
sKeyDiv.addEventListener('touchstart', startSKeyPress);

// Add event listeners to the document to ensure we capture the mouseup event
document.addEventListener('mouseup', stopSKeyPress);
document.addEventListener('mouseleave', stopSKeyPress); // Stop if the mouse leaves the document
document.addEventListener('touchend', stopSKeyPress);
document.addEventListener('touchcancel', stopSKeyPress);


// End of keys simulations

let stopCallToEndGame = false

const endSequence = (isReset) => {
  let firstStageDuration = isReset ? 0 : 15000

  // const winSound = new THREE.Audio(listener)
  // audioLoader.load('win.wav', function(buffer) {
  //   winSound.setBuffer(buffer)
  //   winSound.setLoop(false)
  //   winSound.setVolume(0.5)
  // })

  // window.addEventListener('click', resumeAudioContext);
  // window.addEventListener('touchstart', resumeAudioContext);

  winSound.play()

  stopCallToEndGame = true
  world.gravity.set(0, -100, 0);
  cloneObjects.forEach((clone) => {
    clone.mesh.material.color = new THREE.Color('gold')
    clone.mesh.scale.set(1, 1, 1)
    for (let i = 0; i < numberOfCoins; i++) {
      makeCoin(clone.mesh)
    }
  })

  targetObjects.forEach((target) => {
    target.mesh.material.color = new THREE.Color('gold')
  });

  setTimeout(() => {
    // Put up loading screen and remove it after 3 seconds

    // Stage Two
    loadingScreen.style.display = 'flex'
    
    setTimeout(() => {
      // Stage Three
      loadingScreen.style.display = 'none'
    }, 2000)
  }, firstStageDuration)

  setTimeout(() => {
    isEndOfGame = true
  }, firstStageDuration)

  // Stage Two
  setTimeout(() => {
    // remove clones
    while (cloneObjects.length > 0) {
      const clone = cloneObjects.pop()
      scene.remove(clone.mesh)
      world.remove(clone.body)
    }

    while (coinObjects.length > 0) {
      const coin = coinObjects.pop()
      scene.remove(coin.mesh)
      world.remove(coin.body)
    }

    // reposition engine
    engineObject.body.position.set(0, 0, 0)
    engineObject.body.velocity.set(0, 0, 0);
    engineObject.body.angularVelocity.set(0, 0, 0);

    engineObject.mesh.position.set(0, 0, 0)
    engineObject.mesh.rotation.set(0, 0, 0)

    // reposition targets
    for (let i = 0; i < numberOfTargets; i++) {
      const target = targetObjects[i]
      if (i === 0) {
        target.body.position.set(separationDistance, 0, -separationDistance)
      } else if (i === 1) {
        target.body.position.set(separationDistance * 2, 0, 0)
      } else if (i === 2) {
        target.body.position.set(separationDistance, 0, separationDistance)
      } else if (i === 3) {
        target.body.position.set(separationDistance, 0, -(separationDistance + (separationDistance / 2)))
      } else if (i === 4) {
        target.body.position.set((separationDistance * 2) + (separationDistance / 2), 0, 0)
      } else if (i === 5) {
        target.body.position.set(separationDistance, 0, separationDistance + (separationDistance / 2))
      }

      target.body.velocity.set(0, 0, 0);
      target.body.angularVelocity.set(0, 0, 0);
      target.body.quaternion.setFromEuler(0, 0, 0);
    }
  }, firstStageDuration);

  setTimeout(() => {
    // Stage Three
    targetObjects.forEach((target) => {
      target.mesh.material.color = new THREE.Color('white')
    });
    stopCallToEndGame = false
    isEndOfGame = false
    lastCollisionTime = 0
    cloneObjects = []
    coinObjects = []
    world.gravity.set(0, 0, 0);
    tick()
  }, firstStageDuration + 1000);
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
  // console.log('elapsedTime :>> ', elapsedTime);
  // console.log('introDuration :>> ', introDuration);
  if (elapsedTime < introDuration) {
    window.requestAnimationFrame(initialCameraMovement)
  }
}

const sceneIsReady = scene.children.length = 9;

if (sceneIsReady) {
  initialCameraMovement()
}

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

  for (const coin of coinObjects) {
    coin.mesh.position.copy(coin.body.position)
    coin.mesh.quaternion.copy(coin.body.quaternion)
  }

  if (cloneObjects.length < maxClonesNumber) {
    isEndOfGame = false
  }

  if (cloneObjects.length >= maxClonesNumber && !isEndOfGame && !stopCallToEndGame) {
    endSequence()
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

  if (elapsedTime >= introDuration) {
    camera.position.y = Math.sin(newElapsedTime * 0.1) * 20
  }

  camera.lookAt(engineGroup.position)

  // Update controls
  controls.update()

  // Update HTML element with the variable's value
  document.getElementById('variable-display').innerText = `${cloneObjects.length}`;

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}
if (sceneIsReady) {
  tick()
}
