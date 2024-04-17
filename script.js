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
const materialSphere = new THREE.MeshPhysicalMaterial({ color: '#ff4d00', emissive: 'black', roughness: 0, metalness: 0.3854 })  // { color: '#B6BBC4', emissive: 'black', roughness: 0.5, metalness: 0.5}
materialSphere.transmission = 0
materialSphere.ior = 1.592
materialSphere.thickness = 0.2379
gui.add(materialSphere, 'transmission').min(0).max(1).step(0.0001)
gui.add(materialSphere, 'ior').min(1).max(10).step(0.0001)
gui.add(materialSphere, 'thickness').min(0).max(1).step(0.0001)
gui.add(materialSphere, 'roughness').min(0).max(1).step(0.0001)
gui.add(materialSphere, 'metalness').min(0).max(1).step(0.0001)
gui.addColor(materialSphere, 'color').onChange(() => materialSphere.needsUpdate = true)

const materialSphereTwo = new THREE.MeshPhysicalMaterial({ color: '#fffff5', emissive: 'black', roughness: 0.1, metalness: 0 })  // { color: '#B6BBC4', emissive: 'black', roughness: 0.5, metalness: 0.5}
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



const sphere = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), materialSphere)
const sphereTwo = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), materialSphereTwo)
const torusOne = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.07, 34, 82), materialOne)
const torusTwo = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.07, 34, 82), materialTwo)
const torusThree = new THREE.Mesh(new THREE.TorusGeometry(4, 0.07, 34, 82), materialThree)

scene.add(sphere, sphereTwo, torusOne, torusTwo, torusThree)

// MOLUSK
const moluskGeometry = new THREE.TorusGeometry(12, 3, 32, 200);
const material = new THREE.MeshStandardMaterial();
material.metalness = 1
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
scene.add(molusk);

// LIGHTS

const lightAmbient = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( lightAmbient );

const light = new THREE.PointLight(0xffffff, 100, 0);
light.position.set(-5, 5, 5);
scene.add(light);

// Environment map
// Environment map
const rgbeLoader = new RGBELoader()
rgbeLoader.load('./static/textures/environmentMap/clarens_night_02_4k.hdr', (environmentMap) => {
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
camera.position.y = -10
camera.position.z = 20
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
// renderer.render(scene, camera)

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

