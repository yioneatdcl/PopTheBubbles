import { createQuestsClient } from '@dcl/quests-client'
import { actionEvents } from './event';
import { Action } from '@dcl/quests-client/dist/protocol/decentraland/quests/definitions.gen';


export async function addQuest(){
    const MY_QUEST_ID = 'd771e328-4b1d-4fd2-a105-fefcae8bd848'
    
    const serviceUrl = 'wss://quests-rpc.decentraland.org'
    try {
      const questsClient = await createQuestsClient(serviceUrl, MY_QUEST_ID)

      const x = questsClient.isQuestStarted();
      if (x == false) {
        const result = await questsClient.startQuest()

        if (result) {
          console.log('Quest started successfully!')
        } else {
          console.error("Quest couldn't be started")
        }
      } else {
        console.log("Quest already started")
      }

      actionEvents.on('action', async (action: Action) => {
        await questsClient.sendEvent({ action })
      })

    } catch (e) {
      console.error('Error on connecting to Quests Service')
    }
    
}