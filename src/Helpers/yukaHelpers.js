import * as THREE from 'three'
import * as YUKA from 'yuka'
import { CustomVehicle } from '../CustomYukaObjects/CustomVehicle'

export const createConvexRegionHelper = (navMesh) => {
  const regions = navMesh.regions
  const geometry = new THREE.BufferGeometry()
  const material = new THREE.MeshBasicMaterial({ color: 'lightblue' })
  material.wireframe = true
  const mesh = new THREE.Mesh(geometry, material)

  const positions = []
  const colors = []

  for (let region of regions) {
    let edge = region.edge
    const edges = []

    do {
      edges.push(edge)

      edge = edge.next
    } while (edge !== region.edge)

    const triangleCount = edges.length - 2

    for (let i = 1, l = triangleCount; i <= l; i++) {
      const v1 = edges[0].vertex
      const v2 = edges[i + 0].vertex
      const v3 = edges[i + 1].vertex

      positions.push(v1.x, v1.y, v1.z)
      positions.push(v2.x, v2.y, v2.z)
      positions.push(v3.x, v3.y, v3.z)
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  return mesh
}

export const createPathHelper = () => {
  const pathMaterial = new THREE.LineBasicMaterial({ color: 'red' })
  const pathHelper = new THREE.Line(new THREE.BufferGeometry(), pathMaterial)
  pathHelper.visible = false
  return pathHelper
}

export const createCellSpaceHelper = (spatialIndex) => {
  const cells = spatialIndex.cells

  const geometry = new THREE.BufferGeometry()
  const material = new THREE.LineBasicMaterial()

  const lines = new THREE.LineSegments(geometry, material)

  const positions = []

  for (let i = 0, l = cells.length; i < l; i++) {
    const cell = cells[i]
    const min = cell.aabb.min
    const max = cell.aabb.max

    positions.push(min.x, min.y, min.z, max.x, min.y, min.z)
    positions.push(min.x, min.y, min.z, min.x, min.y, max.z)
    positions.push(max.x, min.y, max.z, max.x, min.y, min.z)
    positions.push(max.x, min.y, max.z, min.x, min.y, max.z)

    positions.push(min.x, max.y, min.z, max.x, max.y, min.z)
    positions.push(min.x, max.y, min.z, min.x, max.y, max.z)
    positions.push(max.x, max.y, max.z, max.x, max.y, min.z)
    positions.push(max.x, max.y, max.z, min.x, max.y, max.z)

    positions.push(min.x, min.y, min.z, min.x, max.y, min.z)
    positions.push(max.x, min.y, min.z, max.x, max.y, min.z)
    positions.push(max.x, min.y, max.z, max.x, max.y, max.z)
    positions.push(min.x, min.y, max.z, min.x, max.y, max.z)
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

  return lines
}

export const getPath = (navMesh, start, end) =>
  navMesh.findMidpointPath(new YUKA.Vector3().copy(start), new YUKA.Vector3().copy(end))

export const sendPlayerToTarget = (navMesh, playerVehicle, pathHelper, target) => {
  const pathVectors = navMesh.findMidpointPath(playerVehicle.position, new YUKA.Vector3().copy(target))

  if (pathVectors.length < 2) return

  if (pathHelper) {
    pathHelper.visible = true
    pathHelper.geometry.dispose()
    pathHelper.geometry = new THREE.BufferGeometry().setFromPoints(pathVectors)
  }

  playerVehicle.toRegion = navMesh.getRegionForPoint(target)
  playerVehicle.steering.behaviors[0].active = true
  playerVehicle.steering.behaviors[0].path.clear()

  pathVectors.map((point) => playerVehicle.steering.behaviors[0].path.add(point))

  playerVehicle.steering.add(new YUKA.OnPathBehavior(playerVehicle.steering.behaviors[0].path))
}

const sync = (entity, renderComponent) => {
  renderComponent.matrix.copy(entity.worldMatrix)
}

export const initPlayerVehicle = (navMesh, playerMesh, entityManager) => {
  const playerVehicle = new CustomVehicle()
  playerVehicle.name = 'player'
  playerVehicle.navMesh = navMesh
  playerVehicle.maxForce = 1
  playerVehicle.maxSpeed = 1.5
  playerVehicle.setRenderComponent(playerMesh, sync)
  const followPathBehavior = new YUKA.FollowPathBehavior()
  followPathBehavior.nextWaypointDistance = 1
  followPathBehavior.active = false
  playerVehicle.steering.add(followPathBehavior)
  entityManager.add(playerVehicle)
  return playerVehicle
}
