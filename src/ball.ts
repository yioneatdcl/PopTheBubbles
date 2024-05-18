import { ColliderLayer, Entity, GltfContainer, Transform, TransformType, engine } from '@dcl/sdk/ecs'

// Ball class that contains a single entity
export class Ball {
  entity: Entity
  isHidden: boolean = false;

  constructor(modelPath: string, transform: TransformType) {
    this.entity = engine.addEntity()
    Transform.create(this.entity, transform)
    GltfContainer.create(this.entity, {
      src: modelPath,
      visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS,
      invisibleMeshesCollisionMask: ColliderLayer.CL_POINTER
    })
  }
}


