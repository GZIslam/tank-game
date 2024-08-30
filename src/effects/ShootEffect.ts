import GameEntity from "../entities/GameEntity"
import { DodecahedronGeometry, Mesh, MeshPhongMaterial, Vector3 } from "three"
import { randomIntInRange, randomSign } from "../utils/MathUtils"

class ShootEffect extends GameEntity {
    private _angle: number
    private _fire = new Mesh()
    private _smoke = new Mesh()
    private _size = 0.1
    private _effectDuration = 1

    constructor(position: Vector3, angle: number){
        super(position)
        this._angle = angle
    }

    public load = async () => {
        const particleGeometry = new DodecahedronGeometry(this._size, 0)
        const smokeMaterial = new MeshPhongMaterial({
            color: 0xfafafa,
            transparent: true,
        })
        const fireMaterial = new MeshPhongMaterial({color: 0xff4500})

        const totalParticles = randomIntInRange(4, 9)
        for(let i = 0; i < totalParticles; i++) {
            const angleOffset = Math.PI * 0.08 * Math.random() * randomSign()
            const particleSpeed = 1.75 * Math.random() * 3
            const fireParticle = new Mesh(particleGeometry, fireMaterial)

            fireParticle.userData = {
                angle: this._angle + angleOffset,
                speed: particleSpeed
            }
            this._fire.add(fireParticle)

            const smokePositionOffset = new Vector3(
                Math.random() * this._size * randomSign(),
                Math.random() * this._size * randomSign(),
                Math.random() * this._size * randomSign(),
            )
            const smokeParticle = new Mesh(particleGeometry, smokeMaterial)
            smokeParticle.position.add(smokePositionOffset)
            this._smoke.add(smokeParticle)
        }

        this._mesh.add(this._fire)
        this._mesh.add(this._smoke)
    }

    public update = (deltaT: number) => {
        this._effectDuration -= deltaT
        if(this._effectDuration <= 0) {
            this._shouldDispose = true
            return
        }

        this._fire.children.forEach(element => {
            const fireParticle = element as Mesh
            const {angle, speed} = fireParticle.userData
            const computedMovement = new Vector3(
                speed * Math.sin(angle) * deltaT * this._effectDuration * 0.75,
                -speed * Math.cos(angle) * deltaT * this._effectDuration * 0.75,
            )
            fireParticle.position.add(computedMovement)
            fireParticle.scale.set(
                (fireParticle.scale.x = this._effectDuration),
                (fireParticle.scale.y = this._effectDuration),
                (fireParticle.scale.z = this._effectDuration),
            )
        })

        this._smoke.children.forEach(element => {
            const smokeParticle = element as Mesh
            (smokeParticle.material as MeshPhongMaterial).opacity = this._effectDuration
            smokeParticle.position.add(new Vector3(0, 0, 3 * deltaT))
        })
    }

    public dispose = () => {
        this._fire.children.forEach(element => {
            (element as Mesh).geometry.dispose();
            ((element as Mesh).material as MeshPhongMaterial).dispose()
            this._fire.remove(element)
        })
        this._smoke.children.forEach(element => {
            (element as Mesh).geometry.dispose();
            ((element as Mesh).material as MeshPhongMaterial).dispose()
            this._smoke.remove(element)
        })
        this.mesh.remove(this._fire)
        this.mesh.remove(this._smoke)
    }
}

export default ShootEffect