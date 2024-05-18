import { engine, AudioSource, Transform, Billboard, Material, MeshRenderer } from "@dcl/sdk/ecs"

export const popSound = engine.addEntity()
Transform.create(popSound)
AudioSource.create(popSound, { audioClipUrl: 'sounds/pop.mp3',  playing: false })

export const carnivalSound = engine.addEntity()
Transform.create(carnivalSound)
AudioSource.create(carnivalSound, { audioClipUrl: 'sounds/carnival.mp3',  playing: false })

export const winSound = engine.addEntity()
Transform.create(winSound)
AudioSource.create(winSound, { audioClipUrl: 'sounds/win.mp3',  playing: false })

export const clapSound = engine.addEntity()
Transform.create(clapSound)
AudioSource.create(clapSound, { audioClipUrl: 'sounds/clap.mp3',  playing: false })

export const waoSound = engine.addEntity()
Transform.create(waoSound)
AudioSource.create(waoSound, { audioClipUrl: 'sounds/wao.mp3',  playing: false })

export function generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const Ceiling = engine.defineComponent('Ceiling', {})