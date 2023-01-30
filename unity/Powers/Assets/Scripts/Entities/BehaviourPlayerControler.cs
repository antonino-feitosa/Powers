using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BehaviourPlayerControler : StateBehaviour
{
    private static Dictionary<KeyCode, Vector2Int> mapKeys;

    static BehaviourPlayerControler()
    {
        mapKeys = new Dictionary<KeyCode, Vector2Int>();
        mapKeys.Add(KeyCode.D, new Vector2Int(+1, +0));
        mapKeys.Add(KeyCode.A, new Vector2Int(-1, +0));
        mapKeys.Add(KeyCode.W, new Vector2Int(+0, +1));
        mapKeys.Add(KeyCode.X, new Vector2Int(+0, -1));
        mapKeys.Add(KeyCode.Q, new Vector2Int(-1, +1));
        mapKeys.Add(KeyCode.E, new Vector2Int(+1, +1));
        mapKeys.Add(KeyCode.Z, new Vector2Int(-1, -1));
        mapKeys.Add(KeyCode.C, new Vector2Int(+1, -1));
    }

    public int radius = 5;
    protected enum StatePlayer { Idle, EndOfTurn, Forward, Backward };
    protected StatePlayer statePlayer = StatePlayer.Idle;

    public override State Turn(Entity entity)
    {
        var game = GameManager.instance;
        if (statePlayer == StatePlayer.EndOfTurn)
        {
            entity.isEndOfTurn = true;
            statePlayer = StatePlayer.Idle;
            return State.Running;
        }
        else if (statePlayer == StatePlayer.Backward)
        {
            entity.isEndOfTurn = true;
            statePlayer = StatePlayer.Idle;
            game.LevelBackward();
            return State.Running;
        }
        else if (statePlayer == StatePlayer.Forward)
        {
            entity.isEndOfTurn = true;
            statePlayer = StatePlayer.Idle;
            game.LevelForward();
            return State.Running;
        }

        if(Input.GetKey(KeyCode.S)){
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
                var moveable = entity.GetBehaviour<BehaviourMoveable>();
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
    }
}
