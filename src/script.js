import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const rgbeLoader = new RGBELoader()
const textureLoader = new THREE.TextureLoader()

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const global = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child.isMesh && child.material.isMeshStandardMaterial)
        {
            child.material.envMapIntensity = global.envMapIntensity
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

/**
 * Environment map
 */
// Global intensity
global.envMapIntensity = 1
gui
    .add(global, 'envMapIntensity')
    .min(0)
    .max(10)
    .step(0.001)
    .onChange(updateAllMaterials)

// HDR (RGBE) equirectangular
rgbeLoader.load('/environmentMaps/0/2k.hdr', (environmentMap) =>
{
    environmentMap.mapping = THREE.EquirectangularReflectionMapping

    // scene.background = environmentMap
    scene.environment = environmentMap
})

/**
 * Models
 */
// Room
gltfLoader.load(
    '/models/room_no_textures_new.glb',
    (gltf) =>
    {
        console.log('gltf: ', gltf)
        gltf.scene.scale.set(0.1, 0.1, 0.1)
        gltf.scene.position.set(0.25, 3, 0)
        gltf.scene.castShadow = true
        scene.add(gltf.scene)
        updateAllMaterials()
    }
)

/**
 * Lights
*/
//Base Light
const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
//Blue Light
const blueLight = new THREE.DirectionalLight('#2528FF', 5)

directionalLight.position.set( 3, 7, 6 )
blueLight.position.set(-1.018, 3.407, 1.563)
blueLight.rotation.set(1.563, 0, 1.563 )


scene.add(directionalLight)
scene.add(blueLight)

// Shadows
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 10
directionalLight.shadow.camera.near = 5
directionalLight.shadow.mapSize.set(4024, 4024)


// Helper Base
const directionalShadowsLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2)

// scene.add(directionalShadowsLightHelper)
scene.add(directionalLightHelper)

// Helper Blue Light 

const blueLightHelper = new THREE.DirectionalLightHelper(blueLight, 0.2)
scene.add(blueLightHelper)

//Target
directionalLight.target.position.set(0, 4, 0)
directionalLight.target.updateWorldMatrix()

blueLight.target.position.set(0, 5, 0)
blueLight.target.updateWorldMatrix()

gui.add(blueLight.position, 'x').min(-10).max(20).step(0.001)
gui.add(blueLight.position, 'y').min(-10).max(20).step(0.001)
gui.add(blueLight.position, 'z').min(-10).max(20).step(0.001)
gui.add(blueLight.rotation, 'x').min(-10).max(20).step(0.001)
gui.add(blueLight.rotation, 'y').min(-10).max(20).step(0.001)
gui.add(blueLight.rotation, 'z').min(-10).max(20).step(0.001)
/**
 * Objects
 */
// const floorColorTexture = textureLoader.load('/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_diff_1k.jpg')
// const floorNormalTexture = textureLoader.load('/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_nor_gl_1k.png')
// const floorAORoughnessMetalnessTexture = textureLoader.load('/textures/wood_cabinet_worn_long/wood_cabinet_worn_long_arm_1k.jpg')

// const wallColorTexture = textureLoader.load('/textures/castle_brick_broken_06/castle_brick_broken_06_diff_1k.jpg')
// const wallNormalTexture = textureLoader.load('/textures/castle_brick_broken_06/castle_brick_broken_06_nor_gl_1k.png')
// const wallAORoughnessMetalnessTexture = textureLoader.load('/textures/castle_brick_broken_06/castle_brick_broken_06_arm_1k.jpg')

// wallColorTexture.colorSpace = THREE.SRGBColorSpace
// floorColorTexture.colorSpace = THREE.SRGBColorSpace

// const planeGeometry = new THREE.PlaneGeometry(8, 8)
// const floorMaterial = new THREE.MeshStandardMaterial({
//     map: floorColorTexture,
//     normalMap: floorNormalTexture,
//     aoMap: floorAORoughnessMetalnessTexture,
//     roughnessMap: floorAORoughnessMetalnessTexture,
//     metalnessMap: floorAORoughnessMetalnessTexture
// })
// const wallMaterial = new THREE.MeshStandardMaterial({
//     map: wallColorTexture,
//     normalMap: wallNormalTexture,
//     aoMap: wallAORoughnessMetalnessTexture,
//     roughnessMap: wallAORoughnessMetalnessTexture,
//     metalnessMap: wallAORoughnessMetalnessTexture
// })
// const floor = new THREE.Mesh(planeGeometry, floorMaterial)
// const wall = new THREE.Mesh(planeGeometry, wallMaterial)
// floor.receiveShadow = true
// floor.rotation.x = - Math.PI /2 
// floor.position.z = 2
// wall.receiveShadow = true
// wall.position.y = 4
// wall.position.z = -2

// scene.add(floor)



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

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(20, sizes.width / sizes.height, 0.1, 150)

camera.position.set(4, 5, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3.5
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 1 

gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
})
gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001)

/**
 * Shadows
 */
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()