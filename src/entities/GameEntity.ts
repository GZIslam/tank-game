import { Box3, Mesh, Sphere, Vector3 } from "three"
import PlayerTank from "./PlayerTank"
import EnemyTank from "./EnemyTank"

// type EntityType = "general" | "player" | "bullet" | "enemy"

abstract class GameEntity {
    protected _position: Vector3
    protected _mesh: Mesh = new Mesh()
    public get mesh() {
        return this._mesh
    }

    protected _collider?: Box3 | Sphere
    public get collider(){
        return this._collider
    }

    abstract readonly entityType : unknown

    // flag to be disposed
    protected _shouldDispose = false
    public get shouldDispose() {
        return this._shouldDispose
    }

    constructor(position: Vector3) {
        this._position = position
        this._mesh.position.set(
            this._position.x,
            this._position.y,
            this._position.z,
        )
    }
    public damage = (_val: number, _target: PlayerTank | EnemyTank) => {}
    public load = async () => {}
    public update = (_deltaT: number) => {}
    // before disposing
    public dispose = () => {}
}

export default GameEntity