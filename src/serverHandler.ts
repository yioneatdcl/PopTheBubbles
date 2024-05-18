
import { executeTask } from '@dcl/sdk/ecs'
import { getPlayer } from '@dcl/sdk/src/players'
import { signedFetch } from '~system/SignedFetch'

// external servers being used by the project - Please change these to your own if working on something else!
// const fireBaseServer = 'http://localhost:5001/dcl-leaderboard-d4629/us-central1/app/'  // running firebase function locally
const baseServer = 'https://hayabusa-74ec.restdb.io/rest/bubblevisitor' //'https://us-central1-dcl-leaderboard-d4629.cloudfunctions.net/app/'

// get latest guestbook data from server
async function fetchVisitor(walletAddress: string) {
 
    try {
      const response = await fetch(
        baseServer + '?q={"walletaddress":%20"' + walletAddress + '"}',
        {
          headers: { 
            "x-apikey": "664122197b95280d990b772a",
           },
          method: 'GET'
        }
      )

      if (!response) {
        throw new Error('Invalid response')
      }

      let result: any[] = await response.json()

      console.log('Response received: ', result)
      return result.length > 0 ? result[0] : undefined;


      //const allScores = await json.topTen

      //leaderboard.updateBoard(allScores)
    } catch (e) {
      console.log('error fetching scores from server: ' + e)
      return undefined
    }
  
}

// get player data
var userData: any

export function setUserData() {
  let response = getPlayer()
  userData = response!
}

setUserData()


export function publishVisitor() {
  executeTask(async () => {
    if (!userData) {
      setUserData()
    }

    try {


      let existing: any = await fetchVisitor(userData.userId)

      if (!!existing ) {
        const response = await fetch(
          baseServer  + "/" + existing._id,
          {
            headers: { 
              'Content-Type': 'application/json',
              "x-apikey": "664122197b95280d990b772a"
            },
            method: 'PUT',
            body: JSON.stringify(
  
              {
                
                "visitcount": existing.visitcount + 1,
                "lastvisiteddate": new Date()
            })})

            let result: any[] = await response.json()
  
            //console.log('Response received: ', result)


      }  else {
        const response = await fetch(
          baseServer ,
          {
            headers: { 
              'Content-Type': 'application/json',
              "x-apikey": "664122197b95280d990b772a"
            },
            method: 'POST',
            body: JSON.stringify(
  
              {
                "name": userData.name,
                "visitcount": 1,
                "walletaddress": userData.userId,
                "createddate": new Date(),
                "lastvisiteddate": new Date()
            })
          
        }) 
  
  
        let result: any[] = await response.json()
  
        //console.log('Response received: ', result)
      }


    } catch (e) {
      console.log('error posting to server: ' + e)
    }
  })
} 