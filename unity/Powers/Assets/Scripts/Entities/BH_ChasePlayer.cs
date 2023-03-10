using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BH_ChasePlayer : StateBehaviour
{
    public override State Turn(Entity entity, int turn)
    {
        var game = GameManager.instance;
        if (!game.HasPlayer())
        {
            return State.Idle;
        }

        var playerPosition = game.GetPlayerPosition();
        var map = game.player.map;

        Vector2Int pos = map.Chase(entity.position);
        var moveable = entity.GetBehaviour<BH_Moveable>();
        if (moveable.TryMoveTo(entity, pos - entity.position))
        {
            return State.Running;
        }
        else
        {
            return State.Idle;
        }
    }
}
