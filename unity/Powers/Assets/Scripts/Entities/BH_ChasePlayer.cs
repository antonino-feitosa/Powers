using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BH_ChasePlayer : StateBehaviour
{
    protected enum StateChase {Idle, Moving};
    protected StateChase state = StateChase.Moving;

    public override State Turn(Entity entity)
    {
        switch(state){
            case StateChase.Moving:
                var game = GameManager.instance;
                var playerPosition = game.GetPlayerPosition();

                var map = game.MakeDijkstraMap(game.level.floor);
                map.AddAttractionPoint(playerPosition);
                map.Calculate();

                Vector2Int pos = map.Chase(entity.position);
                var moveable = entity.GetBehaviour<BH_Moveable>();
                moveable.TryMoveTo(entity, pos - entity.position);
                state = StateChase.Idle;
                return State.Running;
            case StateChase.Idle:
                state = StateChase.Moving;
                return State.Idle;
            default:
                return State.Idle;
        }
    }
}
