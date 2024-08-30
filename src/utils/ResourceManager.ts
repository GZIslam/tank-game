import { Texture, TextureLoader } from "three"
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

class ResourceManager {
    private static _instance = new ResourceManager()
    public static get instance() {
        return this._instance
    }

    private constructor() {}

    // resource list
    private _groundTextures: Texture[] = []
    private _models = new Map<string, GLTF>()
    private _textures = new Map<string, Texture>()

    // public methods to access game loaded resources
    public getModel(modelName: string): GLTF | undefined {
        return this._models.get(modelName)
    }

    public getTexture(textureName: string): Texture | undefined {
        return this._textures.get(textureName)
    }

    // load entry point
    public load = async () => {
        const textureLoader = new TextureLoader()
        await this.loadGroundTextures(textureLoader)
        await this.loadTextures(textureLoader)
        await this.loadModels()
    }

    private loadModels = async () => {
        const modelLoader = new GLTFLoader()
        const playerTank = await modelLoader.loadAsync("models/tank.glb")
        this._models.set("tank", playerTank)
    }

    public loadTextures = async (textureLoader: TextureLoader) => {
        const tankBodyTexture = await textureLoader.loadAsync("textures/tank-body.png")
        const tankTurretTexture = await textureLoader.loadAsync("textures/tank-turret.png")

        this._textures.set("tank-body", tankBodyTexture)
        this._textures.set("tank-turret", tankTurretTexture)

        const tankBodyTextureRed = await textureLoader.loadAsync("textures/tank-body-red.png")
        const tankTurretTextureRed = await textureLoader.loadAsync("textures/tank-turret-red.png")

        this._textures.set("tank-body-red", tankBodyTextureRed)
        this._textures.set("tank-turret-red", tankTurretTextureRed)

        const wallTexture = await textureLoader.loadAsync("textures/wall.png")
        this._textures.set("wall", wallTexture)
        }

    // for ground textures
    public loadGroundTextures = async (textureLoader: TextureLoader) => {
        const groundTexturesFiles = [
            "g1.png",
            "g2.png",
            "g3.png",
            "g4.png",
            "g5.png",
            "g6.png",
            "g7.png",
            "g8.png",
        ]

        for(let i = 0; i < groundTexturesFiles.length; i++) {
            const element = groundTexturesFiles[i]
            const texture = await textureLoader.loadAsync(`textures/${element}`)
            this._groundTextures.push(texture)
        }
    }

    public getGroundTextureByIndex = (index: number) => {
        return this._groundTextures[index]
    }

    public getRandomGroundTexture = () => {
        return this._groundTextures[
            Math.floor(Math.random() * this._groundTextures.length)
        ]
    }
}

export default ResourceManager