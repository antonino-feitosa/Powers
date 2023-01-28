using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerControler : Moveable
{

    private static Dictionary<KeyCode, Vector2Int> mapKeys;

    static PlayerControler()
    {
        mapKeys = new Dictionary<KeyCode, Vector2Int>();
        mapKeys.Add(KeyCode.L, new Vector2Int(+1, +0));
        mapKeys.Add(KeyCode.H, new Vector2Int(-1, +0));
        mapKeys.Add(KeyCode.K, new Vector2Int(+0, +1));
        mapKeys.Add(KeyCode.J, new Vector2Int(+0, -1));
        mapKeys.Add(KeyCode.Y, new Vector2Int(-1, +1));
        mapKeys.Add(KeyCode.U, new Vector2Int(+1, +1));
        mapKeys.Add(KeyCode.B, new Vector2Int(-1, -1));
        mapKeys.Add(KeyCode.N, new Vector2Int(+1, -1));
    }

    public int radius = 5;

    protected enum StatePlayer { Idle, Forward, Backward };
    protected StatePlayer statePlayer = StatePlayer.Idle;

    protected override void Start()
    {
        base.Start();
        var game = GameManager.instance;
        Vector2Int pos = GameManager.ToVector2Int(transform.position);
        game.ApplyFieldOfView(pos, radius);
    }

    void Update()
    {
        if (stateMoveable != StateMoveable.Idle)
            return;

        if (statePlayer == StatePlayer.Backward)
        {
            var game = GameManager.instance;
            statePlayer = StatePlayer.Idle;
            game.LevelBackward();
            return;
        }
        else if (statePlayer == StatePlayer.Forward)
        {
            var game = GameManager.instance;
            statePlayer = StatePlayer.Idle;
            game.LevelForward();
            return;
        }

        foreach (KeyValuePair<KeyCode, Vector2Int> kvp in mapKeys)
        {
            if (Input.GetKey(kvp.Key))
            {
                Vector2Int dir = kvp.Value;
                var game = GameManager.instance;
                Vector2Int dest = GameManager.ToVector2Int(transform.position) + dir;
                if (TryMoveTo(dir))
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
    }
}
