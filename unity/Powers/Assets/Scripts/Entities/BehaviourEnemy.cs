using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BehaviourEnemy : StateBehaviour
{
    public bool AcceptPosition(Vector2Int pos)
    {
        var game = GameManager.instance;
        var playerPosition = game.player.GetComponent<Entity>().position;
        var entity = GetComponent<Entity>();
        if (game.HasEntityAt(pos) || Vector2Int.Distance(pos, playerPosition) < 10)
        {
            return false;
        }
        int[] incx = new int[8] { -1, -1, -1, +0, +0, +1, +1, +1 };
        int[] incy = new int[8] { -1, +0, +1, -1, +1, -1, +0, +1 };
        var floor = game.level.floor;
        for (int i = 0; i < incx.Length; i++)
        {
            var n = new Vector2Int(pos.x + incx[i], pos.y + incy[i]);
            if (!floor.Contains(n) || game.HasEntityAt(n) || game.level.positionToEntity.ContainsKey(n))
                return false;
        }
        entity.position = pos;
        transform.position = new Vector3(pos.x, pos.y);
        return true;
    }

    public override State Turn(Entity entity)
    {
        var game = GameManager.instance;
        entity.gameObject.SetActive(game.IsVisibleAt(entity.position));
        entity.isEndOfTurn = true;
        return State.Idle;
    }
}
