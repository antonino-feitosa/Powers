using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerControler : Moveable
{
    private static Dictionary<KeyCode, Vector2Int> mapKeys;

    static PlayerControler()
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

    protected override void Start()
    {
        base.Start();
        var game = GameManager.instance;
        Vector2Int pos = GameManager.ToVector2Int(transform.position);
        game.ApplyFieldOfView(pos, radius);
    }

    public override bool Turn()
    {
        base.Turn();
        if (stateMoveable != StateMoveable.Idle)
            return true;

        if (statePlayer == StatePlayer.Backward)
        {
            var game = GameManager.instance;
            statePlayer = StatePlayer.Idle;
            game.LevelBackward();
            return true;
        }
        else if (statePlayer == StatePlayer.Forward)
        {
            var game = GameManager.instance;
            statePlayer = StatePlayer.Idle;
            game.LevelForward();
            return true;
        }

        foreach (KeyValuePair<KeyCode, Vector2Int> kvp in mapKeys)
        {
            if (Input.GetKey(kvp.Key))
            {
                Vector2Int dir = kvp.Value;
                var game = GameManager.instance;
                Vector2Int dest = GameManager.ToVector2Int(transform.position) + dir;
                if (TryMoveTo(dir, () => game.NextTurn()))
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
                }
                break;
            }
        }
        return true;
    }
}
