import { Clock, HemisphereLight, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three"
import GameEntity from "../entities/GameEntity"
import GameMap from "../GameMap"
import ResourceManager from "../utils/ResourceManager"
import PlayerTank from "../entities/PlayerTank"
import Wall from "../GameMap/Wall"
import EnemyTank from "../entities/EnemyTank"

class GameScene {
    private static _instance = new GameScene()
    public static get instance() {
        return this._instance
    }

    private _width: number
    private _height: number
    private _renderer: WebGLRenderer
    private _camera: PerspectiveCamera

    // three.js scene
    private readonly _scene = new Scene()

    // game intities array
    private _gameEntities: GameEntity[] = []

    private _clock: Clock = new Clock()

    private _mapSize = 15

    public get camera() {
        return this._camera
    }

    public get gameEntities() {
        return this._gameEntities
    }

    private constructor() {
        this._width = window.innerWidth
        this._height = window.innerHeight

        this._renderer = new WebGLRenderer({
            alpha: true,
            antialias: true,
        })
        this._renderer.setPixelRatio(window.devicePixelRatio)
        this._renderer.setSize(this._width, this._height)

        const targetElement = document.querySelector<HTMLDivElement>("#root")
        if(!targetElement) {
            throw "Cant find target element"
        }
        targetElement.appendChild(this._renderer.domElement)

        const aspectRatio = this._width / this._height
        this._camera = new PerspectiveCamera(45, aspectRatio, 0.1, 1000)
        this._camera.position.set(7, 7, 15)

        window.addEventListener("resize", this.resize, false)

        const gameMap = new GameMap(new Vector3(0, 0, 0), this._mapSize)
        this._gameEntities.push(gameMap)

        // add the player tank
        const playerTank = new PlayerTank(new Vector3(7, 7, 0))
        this._gameEntities.push(playerTank)

        this.setScore(playerTank.score)

        const enemy = new EnemyTank(new Vector3(
            Math.floor(Math.random() * 12) + 1,
            Math.floor(Math.random() * 12) + 1,
            0
        ))
        this._gameEntities.push(enemy)

        this.createWalls()
    }

    public setScore = (val: number) => {
        const targetElement = document.querySelector<HTMLDivElement>("#score")
        if(!targetElement) {
            throw "Cant find score element!"
        }
        targetElement.innerText = `${val}`
    }

    private createWalls = () => {
        const edge = this._mapSize - 1

        this._gameEntities.push(new Wall(new Vector3(0, 0, 0)))
        this._gameEntities.push(new Wall(new Vector3(edge, 0, 0)))
        this._gameEntities.push(new Wall(new Vector3(edge, edge, 0)))
        this._gameEntities.push(new Wall(new Vector3(0, edge, 0)))

        for(let i = 1; i < edge; i++) {
            this._gameEntities.push(new Wall(new Vector3(i, 0, 0)))
            this._gameEntities.push(new Wall(new Vector3(0, i, 0)))
            this._gameEntities.push(new Wall(new Vector3(edge, i, 0)))
            this._gameEntities.push(new Wall(new Vector3(i, edge, 0)))
        }
    }

    private resize = () => {
        this._width = window.innerWidth
        this._height = window.innerHeight
        this._renderer.setSize(this._width, this._height)
        this._camera.aspect = this._width / this._height
        this._camera.updateProjectionMatrix()
    }

    public load = async () => {
        await ResourceManager.instance.load()

        for(let i = 0; i < this._gameEntities.length; i++) {
            const element = this._gameEntities[i]
            await element.load()
            this._scene.add(element.mesh)
        }

        // add light
        const light = new HemisphereLight(0xffffbb, 0x080820, 1)
        this._scene.add(light)
    }

    public render = () => {
        requestAnimationFrame(this.render)
        // remove entities no longer needed
        this.disposeEntities()
        const deltaT = this._clock.getDelta()
        for(let i = 0; i < this._gameEntities.length; i++) {
            const element = this._gameEntities[i]
            element.update(deltaT)
        }
        this._renderer.render(this._scene, this._camera)
    }

    // dynamically add entities
    public addToScene = (entity: GameEntity) => {
        this._gameEntities.push(entity)
        this._scene.add(entity.mesh)
    }
    // remove entities no longer needed
    private disposeEntities = () => {
        const entitiesToBeDisposed = this._gameEntities.filter((e) => e.shouldDispose)
        entitiesToBeDisposed.forEach(entity => {
            this._scene.remove(entity.mesh)
            entity.dispose()
        })
        this._gameEntities = this._gameEntities.filter(e => !e.shouldDispose)
    }
}

export default GameScene