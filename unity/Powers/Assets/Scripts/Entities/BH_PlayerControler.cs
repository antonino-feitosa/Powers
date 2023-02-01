using System.Collections.Generic;
using UnityEngine;

public class BH_PlayerControler : StateBehaviour
{
    public int attack = 3;
    private static Dictionary<KeyCode, Vector2Int> mapKeys;

    public DijkstraMap map;

    static BH_PlayerControler()
    {
        mapKeys = new Dictionary<KeyCode, Vector2Int>();
        mapKeys.Add(KeyCode.D, Entity.Right);
        mapKeys.Add(KeyCode.A, Entity.Left);
        mapKeys.Add(KeyCode.W, Entity.Up);
        mapKeys.Add(KeyCode.X, Entity.Down);
        mapKeys.Add(KeyCode.Q, Entity.UpLeft);
        mapKeys.Add(KeyCode.E, Entity.UpRight);
        mapKeys.Add(KeyCode.Z, Entity.DownLeft);
        mapKeys.Add(KeyCode.C, Entity.DownRight);
    }

    public int radius = 5;
    protected enum StatePlayer { Idle, Forward, Backward, Attacking };
    protected StatePlayer statePlayer = StatePlayer.Idle;

    private float timer = 0.0f;
    public override State Turn(Entity entity, int turn)
    {

        var game = GameManager.instance;
        switch (statePlayer)
        {
            case StatePlayer.Attacking:
                if (entity.IsAnimationEnd())
                {
                    statePlayer = StatePlayer.Idle;
                    entity.PlayIdle();
                    entity.isEndOfTurn = true;
                }
                return State.Running;
            case StatePlayer.Forward:
                entity.isEndOfTurn = true;
                statePlayer = StatePlayer.Idle;
                game.LevelForward();
                return State.Running;
            case StatePlayer.Backward:
                entity.isEndOfTurn = true;
                statePlayer = StatePlayer.Idle;
                game.LevelBackward();
                return State.Running;

            case StatePlayer.Idle:
                entity.PlayIdle();
                timer += Time.deltaTime;
                if (Input.GetKey(KeyCode.S) && timer > 1)
                {
                    timer = 0;
                    entity.PlayRest();
                    entity.isEndOfTurn = true;
                    return State.Running;
                }

                foreach (KeyValuePair<KeyCode, Vector2Int> kvp in mapKeys)
                {
                    if (Input.GetKey(kvp.Key))
                    {
                        Vector2Int dir = kvp.Value;
                        var position = entity.transform.position;
                        Vector2Int dest = GameManager.ToVector2Int(position) + dir;
                        var moveable = entity.GetBehaviour<BH_Moveable>();
                        if (moveable.TryMoveTo(entity, dir))
                        {
                            game.ApplyFieldOfView(dest, radius);
                            if (game.IsUpStairs(dest))
                            {
                                statePlayer = StatePlayer.Backward;
                            }
                            else if (game.IsDownStairs(dest))
                            {
                                statePlayer = StatePlayer.Forward;
                            }
                            return State.Running;
                        }
                        else
                        {
                            if (game.level.positionToEntity.ContainsKey(dest))
                            {
                                var other = game.level.positionToEntity[dest][0];
                                var unit = other.GetBehaviour<BH_Unit>();
                                if (unit)
                                {
                                    entity.direction = kvp.Value;
                                    entity.PlayAttack();
                                    unit.ReceiveDamage(attack);
                                    statePlayer = StatePlayer.Attacking;
                                    return State.Running;
                                }
                            }
                        }
                        break;
                    }
                }
                return State.Running;
            default:
                return State.Running;
        }
    }
}
