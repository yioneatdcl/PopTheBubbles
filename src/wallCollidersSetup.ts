import * as CANNON from 'cannon/build/cannon'

export function loadColliders(world: CANNON.World): void {
  // Invisible walls
  const wallShape = new CANNON.Box(new CANNON.Vec3(41, 35, 1))
  const wallNorth = new CANNON.Body({
    mass: 0,
    shape: wallShape,
  

    position: new CANNON.Vec3(30, 0, 50)
  })
  world.addBody(wallNorth)

  const wallSouth = new CANNON.Body({
    mass: 0,
    shape: wallShape,
    position: new CANNON.Vec3(30, 0, 16)
  })
  world.addBody(wallSouth)

  const wallWest = new CANNON.Body({
    mass: 0,
    shape: wallShape,
    position: new CANNON.Vec3(16, 0, 30)
  })
  wallWest.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2)
  world.addBody(wallWest)

  const wallEast = new CANNON.Body({
    mass: 0,
    shape: wallShape,
    position: new CANNON.Vec3(48, 0, 35)
  })
  wallEast.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2)
  world.addBody(wallEast)
}
