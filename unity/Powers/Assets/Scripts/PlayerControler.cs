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

    protected override void Start()
    {
        base.Start();
        var game = GameManager.instance;
        Vector2Int pos = new Vector2Int((int)transform.position.x, (int)transform.position.y);
        game.ApplyFieldOfView(pos, radius);
    }

    void Update()
    {
        if (state != IDLE)
            return;

        foreach (KeyValuePair<KeyCode, Vector2Int> kvp in mapKeys)
        {
            if (Input.GetKey(kvp.Key))
            {
                Vector2Int dir = kvp.Value;
                if (TryMoveTo(dir))
                {
                    var game = GameManager.instance;
                    Vector2Int dest = new Vector2Int((int)(transform.position.x - 0.5f), (int)(transform.position.y - 0.5f));
                    game.ApplyFieldOfView(dest, radius);
                }
                break;
            }
        }
    }
}
