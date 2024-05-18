import { GltfContainer, Transform, engine, executeTask } from '@dcl/sdk/ecs'
import { getUserData } from '~system/UserIdentity';
import { addUi } from './ui';
import { addLandscape } from './landscape';
import { addMarbles } from './marbles';
import { Vector3 } from '@dcl/sdk/math';
import { publishVisitor } from './serverHandler';
//import { addQuest } from './quest';
export function main() {

  publishVisitor()
  addLandscape();
  addUi();
  
  executeTask(async () => {

    //await addQuest();

    let userData = await getUserData({});
    addMarbles(userData, 4, 'models/marble.glb');

  });  
}
