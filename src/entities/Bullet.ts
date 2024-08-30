import { Box3, Material, Mesh, MeshPhongMaterial, Sphere, SphereGeometry, Vector3 } from "three"
import GameEntity from "./GameEntity"
import GameScene from "../Scene"
import ExplosionEffect from "../effects/ExplosionEffect"
import EnemyTank from "./EnemyTank"

class Bullet extends GameEntity {
    private _angle: number
    constructor(position: Vector3, angle: number) {
        super(position, "bullet")
        this._angle = angle
    }

    public load = async () => {
        const bulletGeometry = new SphereGeometry(0.085)
        const bulletMaterial = new MeshPhongMaterial({color: 0x262626})

        this._mesh = new Mesh(bulletGeometry, bulletMaterial)
        this._mesh.position.set(
            this._position.x,
            this._position.y,
            this._position.z,
        )
        this._collider = new Box3()
        .setFromObject(this._mesh)
        .getBoundingSphere(new Sphere(this._mesh.position))
    }

    public update = (deltaT: number) => {
        const travelSpeed = 9
        const computedMovement = new Vector3(
            travelSpeed * Math.sin(this._angle) * deltaT,
            -travelSpeed * Math.cos(this._angle) * deltaT,
            0
        )
        this._mesh.position.add(computedMovement)

        const colliders = GameScene.instance.gameEntities.filter(c => c.collider && c !== this && c.entityType !== "player" && c.collider.intersectsSphere(this._collider as Sphere))

        if(colliders.length) {
            this._shouldDispose = true
            const explision = new ExplosionEffect(this._mesh.position, 1)
            explision.load().then(() => {
                GameScene.instance.addToScene(explision)
            })

            const enemies = colliders.filter(c => c.entityType === "enemy")
            if(enemies.length) {
                (enemies[0] as EnemyTank).damage(20)
            }
        }
    }
    public dispose = () => {
        (this._mesh.material as Material).dispose()
        this._mesh.geometry.dispose()
    }
}

export default Bullet