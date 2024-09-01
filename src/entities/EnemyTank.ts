import { Box3, Material, Mesh, MeshStandardMaterial, Sphere, Vector3 } from "three"
import GameEntity from "./GameEntity"
import ResourceManager from "../utils/ResourceManager"
import GameScene from "../Scene"
import ExplosionEffect from "../effects/ExplosionEffect"
import { randomIntInRange } from "../utils/MathUtils"
import PlayerTank from "./PlayerTank"
import Bullet from "./Bullet"
import ShootEffect from "../effects/ShootEffect"

class EnemyTank extends GameEntity {
    private _life = 100
    private _rotation: number
    private _moveSpeed = 1
    private _lastShoot = 0

    readonly entityType = "enemy"

    constructor(position: Vector3) {
        super(position)
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

    private shoot = async () => {
        const offset = new Vector3(
            Math.sin(this._rotation) * 0.45,
            -Math.cos(this._rotation) * 0.45,
            0.5
        )
        const shootingPisition = this._mesh.position.clone().add(offset)
        const bullet = new Bullet(shootingPisition, this._rotation, this)
        await bullet.load()
        const shootEffect = new ShootEffect(shootingPisition, this._rotation)
        await shootEffect.load()
        GameScene.instance.addToScene(shootEffect)
        GameScene.instance.addToScene(bullet)
    }

    public setScore = () => {}

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

        const colliders = GameScene.instance.gameEntities.filter(c =>
            c !== this &&
            c.collider &&
            c.collider!.intersectsSphere(testingSphere) &&
            c.entityType !== "bullet"
        )
        if(colliders.length) {
            this._rotation = Math.floor(Math.random() * Math.PI * 2)
            return
        }
        this._lastShoot += deltaT
        if(this._lastShoot > 3) {
            this.shoot()
            this._lastShoot = 0
        }

        this._mesh.position.add(computedMovement);
        (this._collider as Sphere).center.add(computedMovement)
        this._mesh.setRotationFromAxisAngle(new Vector3(0, 0, 1), this._rotation)
    }

    public damage = (amount: number, owner: PlayerTank | EnemyTank) => {
        this._life -= amount
        if(this._life <= 0) {
            this._shouldDispose = true
            const explision = new ExplosionEffect(this._mesh.position, 2)
            explision.load().then(() => {
                GameScene.instance.addToScene(explision)
                if(owner.entityType === "player") {
                    owner.setScore(owner.score + 1)
                }
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
        let x, y;
        while(!x && !y) {
            const a = randomIntInRange(2, 12)
            const b = randomIntInRange(2, 12)
            const c = GameScene.instance.gameEntities.filter(e => {
                if(e.entityType == "enemy" || e.entityType == "player") {
                    const distance = Math.hypot(a - e.mesh.position.x,  b - e.mesh.position.y)
                    return distance < 2
                }
                return false
            })

            if(!c.length) {
                x = a
                y = b
            }
        }
        const enemy = new EnemyTank(new Vector3(
            x,
            y,
            0
        ))
        enemy.load().then(() => GameScene.instance.addToScene(enemy))
        // }
    }
}

export default EnemyTank