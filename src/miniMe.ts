import { AvatarShape, Entity, Transform, engine } from '@dcl/sdk/ecs'
import { Vector3, Color3 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils' 


// Ball class that contains a single entity
export class MiniMe {
  entity: Entity
  isRealMe = false;
  hintInterval: number = -1;
  counter = 0;
  wearables = []

  constructor(userData: any, position: Vector3, cryStartDelay: number, isRealMe: boolean) {
    this.entity = engine.addEntity()
    this.isRealMe = isRealMe;
    this.wearables = userData.data?.avatar?.wearables??[];

    AvatarShape.create(this.entity, {
      id: " ",
      name: userData.data?.displayName,
      bodyShape: userData.data?.avatar?.bodyShape,
      hairColor: Color3.fromHexString(userData.data?.avatar?.hairColor??''),
      eyeColor: Color3.fromHexString(userData.data?.avatar?.eyeColor??''),
      skinColor:  Color3.fromHexString(userData.data?.avatar?.skinColor??''),   
      emotes : ["cry"],
      wearables: userData.data?.avatar?.wearables??[],
      expressionTriggerId: "cry",
      expressionTriggerTimestamp: Math.round(+new Date() / 1000)
    }) 

    Transform.create(this.entity, {
      position: Vector3.create(position.x, position.y + 0.1, position.z),
      scale: Vector3.create(.5,.5,.5)
    });

    utils.timers.setTimeout(()=>{
      this.createNpcHint();
    }, cryStartDelay);
  }


  public updateMiniMeHintInterval  = () => {
    utils.timers.clearInterval(this.hintInterval);
    this.createNpcHint();
  }


  private createNpcHint = () => {
    this.hintInterval = utils.timers.setInterval( () => {
      this.counter = this.counter + 1;
      let npc = AvatarShape.getMutable(this.entity);
       
      //let action = ['wave', 'handsair', 'kiss']
      const action = ['kiss']
      const randomAction = Math.floor(Math.random() * action.length)

      if (this.counter >= 3 && this.isRealMe) {
        this.counter = 0;
        npc.emotes = [action[randomAction]]
        //npc.wearables = [];
        npc.expressionTriggerId = action[randomAction]
      } else {
        npc.emotes = ["cry"]
        npc.expressionTriggerId = "cry"
        npc.wearables = this.wearables
      }
      
      npc.expressionTriggerTimestamp = Math.round(+new Date() / 1000)
    }, 8000)
  }
}