import { engine, AudioSource, GltfContainer, ColliderLayer, Transform, TextShape, Billboard, MeshRenderer, Material, MaterialTransparencyMode, PBBillboard, TextureWrapMode } from "@dcl/sdk/ecs"
import { Vector3, Quaternion, Color4 } from "@dcl/sdk/math"
import { carnivalSound, waoSound } from "./resource"


export function addLandscape() {

    //Transform.getMutable(waoSound).position =  Transform.get(engine.PlayerEntity).position
    //AudioSource.getMutable(waoSound).playing = true
    //AudioSource.getMutable(waoSound).loop = true
    
    Transform.getMutable(carnivalSound).position = Vector3.create(32, 8, 32)
    AudioSource.getMutable(carnivalSound).playing = true
    AudioSource.getMutable(carnivalSound).loop = true


    
    const orb = engine.addEntity()
    GltfContainer.create(orb, {
        //src: 'models/clear_orb.glb'
        src: 'models/color_orb.glb'
    })
    Transform.create(orb, {
        position: Vector3.create(32, 6, 32),
        scale: Vector3.create(23, 23, 23),
        
    }) 
    
    const floor = engine.addEntity()
    Transform.create(floor, {
        position: Vector3.create(32, 0, 32),
        rotation: Quaternion.fromEulerDegrees(90 , 90, 0),
        scale: Vector3.create(64,64,64)
    })
    
    MeshRenderer.setPlane(floor)
    Material.setPbrMaterial(floor, {
        texture: Material.Texture.Common({
          src: 'images/floortile.jpg',

          wrapMode: TextureWrapMode.TWM_REPEAT,
        }),
        transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
      })
    
    const monkey = engine.addEntity();
    GltfContainer.create(monkey,
        {
        src: "models/monkey.glb",
        visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS,
        invisibleMeshesCollisionMask:  ColliderLayer.CL_PHYSICS,
        })

    Transform.create(monkey, {
      
        position: Vector3.create(37, 11, 32),
        scale: Vector3.create(4, 4, 4),
        rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    }) 

    
    const followMe = engine.addEntity()
    Transform.create(followMe, {
        position: Vector3.create(31, 31, 31),
        scale: Vector3.create(11, 11, 11),
        rotation: Quaternion.fromEulerDegrees(180 , 90, 0)
    })

    MeshRenderer.setPlane(followMe)
    Material.setPbrMaterial(followMe, {
        texture: Material.Texture.Common({
          src: 'images/arrow.png',
        }),
        transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
      })

}