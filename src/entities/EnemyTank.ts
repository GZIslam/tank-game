import { Box3, Material, Mesh, MeshStandardMaterial, Sphere, Vector3 } from "three";
import GameEntity from "./GameEntity";
import ResourceManager from "../utils/ResourceManager";
import GameScene from "../Scene";
import ExplosionEffect from "../effects/ExplosionEffect";
import { randomIntInRange } from "../utils/MathUtils";
import PlayerTank from "./PlayerTank";

class EnemyTank extends GameEntity {
    private _life = 100
    private _rotation: number
    private _moveSpeed = 1

    constructor(position: Vector3) {
        super(position, "enemy")
        this._rotation = Math.floor(Math.random() * Math.PI * 2)
    }

    public load = async () => {
        const tankModel = ResourceManager.instance.getModel("tank")
        if(!tankModel) {
            throw "Cant get tank model!"
        }

        const tankSceneData = tankModel.scene.clone()
        
        const tankBodyMesh = tankSceneData.children.find((m) => m.name == "Body") as Mesh
        const tankTurretMesh = tankSceneData.children.find((m) => m.name == "Turret") as Mesh

        const tankBodyTexture = ResourceManager.instance.getTexture("tank-body-red")
        const tankTurretTexture = ResourceManager.instance.getTexture("tank-turret-red")

        if(!tankBodyMesh || !tankBodyTexture || !tankTurretMesh || !tankTurretTexture) {
            throw "Cant load player model or textures"
        }

        const bodyMaterial = new MeshStandardMaterial({
            map: tankBodyTexture
        })
        const turretMaterial = new MeshStandardMaterial({
            map: tankTurretTexture
        })
        tankBodyMesh.material = bodyMaterial
        tankTurretMesh.material = turretMaterial

        // add meshes as child of entity mesh
        this._mesh.add(tankBodyMesh)
        this._mesh.add(tankTurretMesh)

        const collider = new Box3()
        .setFromObject(this._mesh)
        .getBoundingSphere(new Sphere(this._mesh.position.clone()))

        collider.radius *= 0.75
        this._collider = collider
    }

    public update = (deltaT: number) => {
        const computedMovement = new Vector3(
            this._moveSpeed * deltaT * Math.sin(this._rotation),
            -this._moveSpeed * deltaT * Math.cos(this._rotation),
            0,
        )

        const testingSphere = new Sphere(
            (this._collider as Sphere).clone().center,
            (this._collider as Sphere).clone().radius,
        )
        testingSphere.center.add(computedMovement)

        const colliders = GameScene.instance.gameEntities.filter(c => c !== this && c.collider && c.collider!.intersectsSphere(testingSphere) && c.entityType !== "bullet")
        if(colliders.length) {
            this._rotation = Math.floor(Math.random() * Math.PI * 2)
            return
        }

        this._mesh.position.add(computedMovement);
        (this._collider as Sphere).center.add(computedMovement)
        this._mesh.setRotationFromAxisAngle(new Vector3(0, 0, 1), this._rotation)
    }

    public damage = (amount: number, owner: PlayerTank) => {
        this._life -= amount
        if(this._life <= 0) {
            this._shouldDispose = true;
            const explision = new ExplosionEffect(this._mesh.position, 2)
            explision.load().then(() => {
                GameScene.instance.addToScene(explision)
                owner.setScore(owner.score + 1)
            })
        }
    }

    public dispose = () => {
        this._mesh.children.forEach(c => {
            (c as Mesh).geometry.dispose();
            ((c as Mesh).material as Material).dispose()
            this._mesh.remove(c)
        })
        // const count = Math.floor(Math.random() * 4) + 1;
        // for(let i = 0; i < count; i++) {
            const enemy = new EnemyTank(new Vector3(
                [randomIntInRange(2, 6), randomIntInRange(8, 12)][Math.random() > 0.5 ? 0 : 1],
                [randomIntInRange(2, 6), randomIntInRange(8, 12)][Math.random() > 0.5 ? 0 : 1],
                0
            ))
            enemy.load().then(() => GameScene.instance.addToScene(enemy))
        // }
    }
}

export default EnemyTank