import mitt from 'mitt'
import { Action } from '@dcl/quests-client/dist/protocol/decentraland/quests/definitions.gen'

export const startEvent = mitt()
export const actionEvents = mitt<{ action: Action }>()