import { engine, pointerEventsSystem, InputAction, inputSystem, PointerEventType, Transform, TextShape, AudioSource, RealmInfo, TextAlignMode, MeshRenderer, Material, Billboard } from "@dcl/sdk/ecs"
import { Vector3, Quaternion, Color4, Color3 } from "@dcl/sdk/math"
import { Ball } from "./ball"
import { MiniMe } from "./miniMe"
import { loadColliders } from "./wallCollidersSetup"
import * as utils from '@dcl-sdk/utils' 
import { carnivalSound, clapSound, generateRandomNumber, popSound, waoSound, winSound } from "./resource"
import CANNON from "cannon"
//import { actionEvents } from "./event"
import { triggerEmote, triggerSceneEmote } from "~system/RestrictedActions"

let realMeIndex = 0;
let foundMe = false;
let gameOver = false;

export function addMarbles(userData: any, numberOfMarbles: number, modelPath: string) {
    let balls: Ball[] = [] // Store balls
    let miniMes: MiniMe[] = [];
    let ballBodies: CANNON.Body[] = [] // Store ball bodies
    let currentLevel = 0;

    realMeIndex = generateRandomNumber(0, numberOfMarbles-1);

    let ballHeight = 10 // Start height for the balls
    let forwardVector: Vector3 = Vector3.rotate(Vector3.Forward(), Transform.get(engine.CameraEntity).rotation) // Camera's forward vector
    const vectorScale: number = 25
  
    let randomPositions: any = []
    // Create random balls and positions
    
    let addBall = (index: number) => {
      const randomPositionX: number = Math.floor(Math.random() * 3) + 32
      const randomPositionY: number = ballHeight
      const randomPositionZ: number = Math.floor(Math.random() * 3) + 32
      randomPositions.push({ x: randomPositionX, y: randomPositionY, z: randomPositionZ })
  
      const ball = new Ball(modelPath, {
        position: randomPositions[index],
        rotation: Quaternion.Zero(),
        scale: Vector3.One()
      })
      balls.push(ball)
      ballHeight += 2 // To ensure the colliders aren't intersecting when the simulation starts
  
      const miniMe = new MiniMe(userData, randomPositions[index], index*1000, realMeIndex === index)
      miniMes.push(miniMe)

      // Allow the user to interact with the ball
      pointerEventsSystem.onPointerDown(
        {
          entity: ball.entity,
          opts: {
            button: InputAction.IA_POINTER,
            hoverText: 'kick'
          }
        },
        function (cmd: any) {
          // Apply impulse based on the direction of the camera
          ballBodies[index].applyImpulse(
            new CANNON.Vec3(forwardVector.x * vectorScale, forwardVector.y * vectorScale, forwardVector.z * vectorScale),
            // Applies impulse based on the player's position and where they click on the ball
            new CANNON.Vec3(cmd.hit?.position?.x, cmd.hit?.position?.y, cmd.hit?.position?.z)
          )
        }
      )
    }

    for (let i = 0; i < numberOfMarbles; i++) {
      addBall(i)
    }


    //set up moving cube

    const target = engine.addEntity();
    Transform.create(target, {
      position: Vector3.create(28, 1, 28),
    })
    
    MeshRenderer.setSphere(target)
    Material.setPbrMaterial(target, {
      albedoColor: {r: 15, g: 0, b: 0, a:1},
      
      //roughness: 0.1,
    })


    // Setup our world

    
    const world: CANNON.World = new CANNON.World()
    world.gravity.set(0, -9.82, 0) // m/s²
  
    // Add invisible colliders
    loadColliders(world)
  
    const groundPhysicsMaterial = new CANNON.Material('groundMaterial')
    const groundPhysicsContactMaterial = new CANNON.ContactMaterial(groundPhysicsMaterial, groundPhysicsMaterial, {
      friction: 0.5,
      restitution: 0.33
    })
    world.addContactMaterial(groundPhysicsContactMaterial)
  
    // Create a ground plane and apply physics material
    const groundBody: CANNON.Body = new CANNON.Body({
      mass: 0 // mass === 0 makes the body static
    })
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2) // Reorient ground plane to be in the y-axis
  
    const groundShape: CANNON.Plane = new CANNON.Plane()
    groundBody.addShape(groundShape)
    groundBody.material = groundPhysicsMaterial
    world.addBody(groundBody)
  
    const ballPhysicsMaterial: CANNON.Material = new CANNON.Material('ballMaterial')
    const ballPhysicsContactMaterial = new CANNON.ContactMaterial(groundPhysicsMaterial, ballPhysicsMaterial, {
      friction: 0.4,
      restitution: 0.75
    })
    world.addContactMaterial(ballPhysicsContactMaterial)
  
    let addBallsBody = (index: number) => {
      const ballTransform = Transform.get(balls[index].entity)
  
      const ballBody: CANNON.Body = new CANNON.Body({
        mass: 5, // kg
        position: new CANNON.Vec3(ballTransform.position.x, ballTransform.position.y, ballTransform.position.z), // m
        shape: new CANNON.Sphere(1) // m (Create sphere shaped body with a radius of 1)
      })
  
      ballBody.material = ballPhysicsMaterial // Add bouncy material to ball body
      ballBody.linearDamping = 0.4 // Round will keep translating even with friction so you need linearDamping
      ballBody.angularDamping = 0.4 // Round bodies will keep rotating even with friction so you need angularDamping
  
      world.addBody(ballBody) // Add body to the world
      ballBodies.push(ballBody)
    }
    // Create bodies to represent each of the balls
    for (let i = 0; i < balls.length; i++) {
      addBallsBody(i);
    }
  

    const fixedTimeStep: number = 1.0 / 60.0 // seconds
    const maxSubSteps: number = 3
  
    function updateSystem(dt: number): void {
      // Instruct the world to perform a single step of simulation.
      // It is generally best to keep the time step and iterations fixed.
      world.step(fixedTimeStep, dt, maxSubSteps)
  
      // Position and rotate the balls in the scene to match their cannon world counterparts
      for (let i = 0; i < balls.length; i++) {
  
        if (!balls[i].isHidden) {
          const ballTransform = Transform.getMutable(balls[i].entity)
          ballTransform.position = ballBodies[i].position
          ballTransform.rotation = ballBodies[i].quaternion
    
          const miniMeTransform = Transform.getMutable(miniMes[i].entity)
          miniMeTransform.position = ballBodies[i].position
          miniMeTransform.rotation = ballBodies[i].quaternion
          
          const targetTransform = Transform.getMutable(target);
    
          const marbleInArea = (ballBodies[i].position.x >= (targetTransform.position.x - 1)) && (ballBodies[i].position.x <= (targetTransform.position.x + 1))
          && (ballBodies[i].position.z >= (targetTransform.position.z - 1))  && (ballBodies[i].position.z <= (targetTransform.position.z + 1) )
    
    
          if (marbleInArea){
            balls[i].isHidden = true;
            ballTransform.position = Vector3.create(33,11, 33)
            miniMeTransform.position = Vector3.create(33,10.9, 33)
            
            if (i === realMeIndex){
              foundMe = true;
            }
          } 
        }
      }
  
      // Update forward vector
      forwardVector = Vector3.rotate(Vector3.Forward(), Transform.get(engine.CameraEntity).rotation)
      // console.log('Forward Vector: ', forwardVector)
    }
  
    engine.addSystem(updateSystem)
  
    // Input system
    engine.addSystem(() => {
      // Reset with the E key
      const primaryDown = inputSystem.getInputCommand(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)
      if (primaryDown) {
        
        
        if (foundMe === true) {
          //add more marbles? TODO: set level display? and marble count??

          let currentBallsLength = balls.length;
          realMeIndex =  Math.floor(Math.random() * currentBallsLength*2);


          for (let i = 0; i < ballBodies.length; i++) {
            balls[i].isHidden = false;


            const previousIsRealMe = miniMes[i].isRealMe;
           
            miniMes[i].isRealMe = i === realMeIndex;
            if (previousIsRealMe !== miniMes[i].isRealMe) {
              miniMes[i].updateMiniMeHintInterval()
            }
            
            ballBodies[i].position.set(randomPositions[i].x, randomPositions[i].y, randomPositions[i].z)
            
            const miniMeTransform = Transform.getMutable(miniMes[i].entity)
            miniMeTransform.scale = Vector3.create(0.5,.5,.5)
          }

          
          for (let i = currentBallsLength; i < currentBallsLength*2; i++) {
            addBall(i)
            addBallsBody(i)
          }

            
          foundMe = false;
          currentLevel = currentLevel + 1;

         
          const mutableLevelSignText = TextShape.getMutable(levelSign)
          mutableLevelSignText.text = "Level "+ (currentLevel + 1).toString()


          
        } else if (gameOver ){

        
          realMeIndex =  Math.floor(Math.random() * numberOfMarbles);
          for (let i = 0; i < numberOfMarbles; i++) {
            addBall(i)
            addBallsBody(i)
          }
          engine.addSystem(updateSystem)
          gameOver = false;
          currentLevel = 0;
          const mutableLevelSignText = TextShape.getMutable(levelSign)
          mutableLevelSignText.text = "Level "+ (currentLevel + 1).toString()
        } else {
          for (let i = 0; i < ballBodies.length; i++) {
            balls[i].isHidden = false;

            
            ballBodies[i].position.set(randomPositions[i].x, randomPositions[i].y, randomPositions[i].z)
            
            const miniMeTransform = Transform.getMutable(miniMes[i].entity)
            miniMeTransform.scale = Vector3.create(0.5,.5,.5)
            utils.timers.clearInterval(intervalId)
          }
        }
        
        timer = startingTimer + 1;
        setTimer();
      }
    })



    // Set up count down
    const startingTimer = 180;
    let timer = startingTimer;

    const countDown = engine.addEntity()
    Transform.create(countDown, {
        position: Vector3.create(21, 8, 33),
        rotation: Quaternion.fromEulerDegrees(0, 200, 0),
        scale: Vector3.create(0.9,.9,.9)
    })
    TextShape.create(countDown, {
      text: timer.toString(),
      textColor: { r: 102, g: 0, b: 102, a: 1 },
      textAlign: TextAlignMode.TAM_TOP_CENTER
    })
    Billboard.create(countDown, {})
  
    const affirmations = ['Super', 'Yay', 'Grand', 'Wow', 'Yes']
    let intervalId = -1;
    let setTimer = () => {
      intervalId = utils.timers.setInterval(function () {
  
        timer = timer-1;
        const mutableText = TextShape.getMutable(countDown)

        let resetMarbles = () => {
          utils.timers.clearInterval(intervalId)
          engine.removeSystem(updateSystem)

          for (let i = 0; i < balls.length; i++) {
              Transform.getMutable(popSound).position = Transform.get(engine.PlayerEntity).position
              AudioSource.getMutable(popSound).playing = true

              utils.timers.clearInterval(miniMes[i].hintInterval);
              engine.removeEntity(balls[i].entity)
              engine.removeEntity(miniMes[i].entity)
              world.remove(ballBodies[i])

          }

          balls = [];
          miniMes = [];
          ballBodies = [];
          randomPositions = [];
          currentLevel = 1;

        }


        if (timer <= 0) {
          utils.timers.clearInterval(intervalId)
          engine.removeSystem(updateSystem)

          resetMarbles();
    
          mutableText.text = "GAME\nOVER!"
          triggerSceneEmote({ src: 'animations/loser.glb', loop: true })
          gameOver = true;
        } else {
    
            if (foundMe) {

              let questCurrentLevel = currentLevel + 1;
              //if (currentLevel === 0) {
                if (currentLevel === 3) {

                mutableText.text = "You won!";

                AudioSource.getMutable(carnivalSound).playing = false;

                Transform.getMutable(waoSound).position = Transform.get(engine.PlayerEntity).position
                AudioSource.getMutable(waoSound).playing = true

                utils.timers.setTimeout(()=>{
                  Transform.getMutable(clapSound).position = Transform.get(engine.PlayerEntity).position
                  AudioSource.getMutable(clapSound).playing = true
                  AudioSource.getMutable(carnivalSound).playing = true;
                }, 1500);

                
                
                  
                triggerEmote({ predefinedEmote: 'handsair' })
              
                resetMarbles();
                currentLevel = 0;
                gameOver = true;
                foundMe = false;

               
                
              } else {

                Transform.getMutable(winSound).position = Transform.get(engine.PlayerEntity).position
                AudioSource.getMutable(winSound).playing = true
                const affirmRand = generateRandomNumber(0,affirmations.length-1)
                mutableText.text = affirmations[affirmRand] + "!\n E to \n continue";
                
              }
              

              //actionEvents.emit('action', {
              //  type: 'CUSTOM',
               // parameters: { id: 'Action-' + questCurrentLevel.toString() },
              //})

              utils.timers.clearInterval(intervalId)
  
              
            
              
            } else {
              mutableText.text = timer.toString();
            }
        }
      
      }, 1000)
    }
  
    setTimer();


    const levelSign = engine.addEntity()
    Transform.create(levelSign, {
        position: Vector3.create(21, 10, 33),
        rotation: Quaternion.fromEulerDegrees(0, 200, 0),
        scale: Vector3.create(1,1,1)
    })
    TextShape.create(levelSign, {
      text: "Level " + (currentLevel + 1).toString(),
      textColor: { r: 0, g: 255, b: 0, a: 1 },
      textAlign:  TextAlignMode.TAM_TOP_CENTER
    })


    Billboard.create(levelSign, {})

    const levelPlane = engine.addEntity()
    Transform.create(levelPlane, {
        position: Vector3.create(21, 8, 33),
        rotation: Quaternion.fromEulerDegrees(0, 200, 0),
        scale: Vector3.create(4,8,4)
    })
    
    MeshRenderer.setPlane(levelPlane)
    Material.setPbrMaterial(levelPlane, {
      albedoColor: {r: 0, g: 0, b: 0, a:.5}
    })

    Billboard.create(levelPlane, {})


    utils.timers.setInterval( () => {

      const randomxLocation = generateRandomNumber(20, 40)
      const randomzLocation = generateRandomNumber(20, 40)
      const targetTransform =Transform.getMutable(target);
      targetTransform.position.x = randomxLocation
      targetTransform.position.z = randomzLocation
    }, 15000)
    
}
