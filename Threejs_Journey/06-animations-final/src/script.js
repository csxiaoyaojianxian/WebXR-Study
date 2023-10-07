import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Base
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

/**
 * Sizes
 */
const sizes = {
    width: 800,
    height: 600
}

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)

/**
 * Animate
 */
gsap.to(mesh.position, { duration: 1, delay: 1, x: 2 })


// let time = Date.now()
const clock = new THREE.Clock()

const tick = () =>
{
    /*
    const currentTime = Date.now()
    const elapsedTime = currentTime - time
    */
    // 自时钟创建以来经过的时间
    const elapsedTime = clock.getElapsedTime()
    
    // 在不同刷新率的显示器上动画速度不同，所以要结合 elapsedTime
    // mesh.rotation.y += 0.001

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()