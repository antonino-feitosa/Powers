using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BehaviourEnemy : StateBehaviour
{
    private Entity entity;
    void Awake()
    {
        entity = GetComponent<Entity>();
        entity.isBlock = true;
    }

    public bool AcceptPosition(Vector2Int pos)
    {
        var game = GameManager.instance;
        if (game.HasEntityAt(pos))
        {
            return false;
        }
        int[] incx = new int[8] { -1, -1, -1, +0, +0, +1, +1, +1 };
        int[] incy = new int[8] { -1, +0, +1, -1, +1, -1, +0, +1 };
        var floor = game.level.floor;
        for (int i = 0; i < incx.Length; i++)
        {
            var n = new Vector2Int(pos.x + incx[i], pos.y + incy[i]);
            if (!floor.Contains(n) || game.HasEntityAt(pos) ||
                game.level.positionToEntity.ContainsKey(entity.position))
                return false;
        }
        entity.position = pos;
        entity.transform.position = new Vector3(pos.x, pos.y);
        return true;
    }

    public override State Turn(Entity entity)
    {
        var game = GameManager.instance;
        entity.gameObject.SetActive(game.IsVisibleAt(entity.position));
        return State.Idle;
    }
}
