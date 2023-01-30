using System.Collections.Generic;
using UnityEngine;

public class BH_PlayerControler : StateBehaviour
{
    private static Dictionary<KeyCode, Vector2Int> mapKeys;

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
    protected enum StatePlayer { Idle, EndOfTurn, Forward, Backward };
    protected StatePlayer statePlayer = StatePlayer.Idle;

    public override State Turn(Entity entity)
    {
        var game = GameManager.instance;
        switch (statePlayer)
        {
            case StatePlayer.EndOfTurn:
                entity.isEndOfTurn = true;
                statePlayer = StatePlayer.Idle;
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

                if (Input.GetKey(KeyCode.S))
                {
                    statePlayer = StatePlayer.EndOfTurn;
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
                            else
                            {
                                statePlayer = StatePlayer.EndOfTurn;
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
