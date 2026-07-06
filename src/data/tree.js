import * as THREE from 'three'

export const treePositions = [
  new THREE.Vector3(0, -5, 0),
  new THREE.Vector3(0, -2.5, 0),
  new THREE.Vector3(-3, 0, 0),
  new THREE.Vector3(-4.5, 2.5, 0),
  new THREE.Vector3(-2, 5, 0.8),
  new THREE.Vector3(0.5, 7.5, 1.5),
  new THREE.Vector3(-6.5, 3, 0),
  new THREE.Vector3(2.5, 10, 2.5),
  new THREE.Vector3(3.5, 0, 1.5),
]

export const treeEdges = [[0,1],[1,2],[1,8],[2,3],[3,4],[3,6],[4,5],[5,7]]
