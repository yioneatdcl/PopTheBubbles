  import { Entity, GltfContainer, Transform, engine } from '@dcl/sdk/ecs'
import { Color4, Vector3 } from '@dcl/sdk/math'
  import ReactEcs, { Button, Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { Ceiling } from './resource'

export function addUi(){
  let showHint = false 
  let startExperience = false 
  ReactEcsRenderer.setUiRenderer(() => (
   
    <UiEntity
      uiTransform={{ 
        alignItems: 'flex-start',
        flexDirection: 'row',
       
        alignContent: 'flex-end',
			positionType: 'absolute',
			position: { right: "0%", top: '20px' }
        }}
    >

      <UiEntity
        uiTransform={{ 
          alignContent: 'flex-start',
          flexDirection: 'column'
          }}
          >
    
        <Button
          //value= {showHint?"Close":"Instructions"}
          value= ""
          fontSize={ 15}
          variant= 'primary'
          uiTransform={{
            display: 'flex',
            width: 60, 
            height: 60,
            margin: '80 10 10px 0px' 
          }}
          uiBackground={{ 
            textureMode: 'stretch',
            texture: {
              src: "images/help.png"
  
            },
            color: Color4.create(1,1,1)
        }}
          onMouseDown={() => {
            console.log("Clicked on the UI")
            showHint = !showHint
            } }
        />

    <Button
        value= ""
        variant= 'primary'
        uiTransform={{
          display: startExperience ? 'flex': 'none',
          width: 60, 
          height: 60,
          margin: '10 10 10px 0px' 
        }}
        
        uiBackground={{ 
          textureMode: 'stretch',
		      texture: {
            src: "images/withoutneon.png"

		      },
          color: Color4.create(1,1,1)
      }}

        onMouseDown={() => {
          toggleExperience()
        }}
      />

<Button
        value= ""
        variant= 'primary'
        uiTransform={{
          display: startExperience ? 'none': 'flex',
          width: 60, 
          height: 60,
          margin: '10 10  10px 0px' 
        }}
        
        uiBackground={{ 
          textureMode: 'stretch',
		      texture: {
			      src: "images/withneon.png"
		      },
          color: Color4.create(1,1,1)
      }}

        onMouseDown={() => {
          toggleExperience()
        }}
      />

       
      </UiEntity>

      <UiEntity 
        uiBackground={{
          color: Color4.create(0, 0, 0, 0.6)
        }}
        
        uiTransform={{
        
          width: '500',
          height: 'auto',
          display: showHint ? 'flex': 'none',
          margin: '60px 0px 0px 0px' 
        }}>
        
          <Label
          
            textAlign="top-left"
            fontSize={15}
            value="
            Find the bubble that contains the real you! Kick it to 
            Glow Ball to check.
            
            Find it before time runs out to get to the next level.

            One with keen eyes will see hints of the right bubble.
            One with dull eyes, well bad luck! Just try them all!

            You win if you complete level 4.

            Press E to:
            Reset level if midway.
            
            Start next level if level has been completed.
            
            Restart game if GameOver!"
          />
      </UiEntity>

      
    </UiEntity>

    
  ))

  
function toggleExperience(){
  

  startExperience = !startExperience
  

  if (startExperience) {

      
    const ceiling = engine.addEntity()
    GltfContainer.create(ceiling, {
        src: 'models/ceiling.glb'
        //src: 'models/marble.glb'
    })
    Transform.createOrReplace(ceiling, {
        position: Vector3.create(32, 0, 32),
        scale: Vector3.create(19.5,19.5,19.5),
       
    }) 

    Ceiling.create(ceiling, {})

  

  } else {
  

    for (const [entity] of engine.getEntitiesWith(Ceiling)) {
      engine.removeEntity(entity)
    }
  }
}
}


