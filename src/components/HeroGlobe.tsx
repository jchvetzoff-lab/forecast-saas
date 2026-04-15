"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

const PARTICLE_COUNT = 3000
const SPHERE_RADIUS = 2.5
const CONNECTION_DISTANCE = 0.35
const ROTATION_SPEED = 0.0008

const COLORS = [
  new THREE.Color("#2563EB"),
  new THREE.Color("#0891B2"),
  new THREE.Color("#7C3AED"),
]

function createParticles(): Float32Array {
  const positions = new Float32Array(PARTICLE_COUNT * 3)
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const phi = Math.acos(2 * Math.random() - 1)
    const theta = 2 * Math.PI * Math.random()
    positions[i * 3] = SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = SPHERE_RADIUS * Math.cos(phi)
  }
  return positions
}

function createParticleColors(): Float32Array {
  const colors = new Float32Array(PARTICLE_COUNT * 3)
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }
  return colors
}

function buildConnections(
  positions: Float32Array,
  maxDist: number
): { linePositions: Float32Array; lineColors: Float32Array; count: number } {
  const tempPositions: number[] = []
  const tempColors: number[] = []

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const ix = positions[i * 3]
    const iy = positions[i * 3 + 1]
    const iz = positions[i * 3 + 2]

    for (let j = i + 1; j < PARTICLE_COUNT; j++) {
      const jx = positions[j * 3]
      const jy = positions[j * 3 + 1]
      const jz = positions[j * 3 + 2]

      const dx = ix - jx
      const dy = iy - jy
      const dz = iz - jz
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

      if (dist < maxDist) {
        const alpha = 1 - dist / maxDist

        tempPositions.push(ix, iy, iz, jx, jy, jz)

        const ci = COLORS[i % COLORS.length]
        const cj = COLORS[j % COLORS.length]
        tempColors.push(
          ci.r * alpha, ci.g * alpha, ci.b * alpha,
          cj.r * alpha, cj.g * alpha, cj.b * alpha
        )
      }
    }
  }

  return {
    linePositions: new Float32Array(tempPositions),
    lineColors: new Float32Array(tempColors),
    count: tempPositions.length / 3,
  }
}

export default function HeroGlobe() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#FAFAFA")

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.z = 7

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Groupe pivot
    const group = new THREE.Group()
    scene.add(group)

    // Particules
    const positions = createParticles()
    const colors = createParticleColors()

    const pointsGeometry = new THREE.BufferGeometry()
    pointsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    pointsGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    const pointsMaterial = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    })

    const points = new THREE.Points(pointsGeometry, pointsMaterial)
    group.add(points)

    // Lignes de connexion
    const { linePositions, lineColors } = buildConnections(positions, CONNECTION_DISTANCE)

    const lineGeometry = new THREE.BufferGeometry()
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3))
    lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3))

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.15,
    })

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial)
    group.add(lines)

    // Animation
    let animationId: number

    function animate() {
      animationId = requestAnimationFrame(animate)
      group.rotation.y += ROTATION_SPEED
      group.rotation.x += ROTATION_SPEED * 0.3
      renderer.render(scene, camera)
    }
    animate()

    // Resize
    function handleResize() {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener("resize", handleResize)

    // Cleanup
    cleanupRef.current = () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)
      renderer.dispose()
      pointsGeometry.dispose()
      pointsMaterial.dispose()
      lineGeometry.dispose()
      lineMaterial.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }

    return () => {
      cleanupRef.current?.()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: "#FAFAFA" }}
    />
  )
}
