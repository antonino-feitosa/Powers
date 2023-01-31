using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BH_ChasePlayer : StateBehaviour
{
    protected enum StateChase {Idle, Moving};
    protected StateChase state = StateChase.Moving;

    public override State Turn(Entity entity)
    {
        var game = GameManager.instance;
        var playerPosition = game.GetPlayerPosition();

        var map = game.MakeDijkstraMap(game.level.floor);
        map.AddAttractionPoint(playerPosition);
        map.Calculate();

        Vector2Int pos = map.Chase(entity.position);
        var moveable = entity.GetBehaviour<BH_Moveable>();
        if(moveable.TryMoveTo(entity, pos - entity.position)){
            state = StateChase.Moving;
            return State.Running;
        } else {
            state = StateChase.Idle;
            return State.Idle;
        }
    }
}
