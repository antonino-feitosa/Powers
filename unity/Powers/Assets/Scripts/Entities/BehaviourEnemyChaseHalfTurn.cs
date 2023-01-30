using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BehaviourEnemyChaseHalfTurn : BehaviourEnemy
{
    public int radius = 5;
    private bool passTurn = false;
    public override State Turn(Entity entity)
    {
        var game = GameManager.instance;
        var playerPosition = game.player.GetComponent<Entity>().position;
        var view = game.FieldOfView(entity.position, radius);
        if (!view.Contains(playerPosition))
        {
            entity.isEndOfTurn = true;
            return State.Running;
        }

        passTurn = !passTurn;
        if (passTurn)
        {
            entity.isEndOfTurn = true;
            return State.Running;
        }

        var map = game.MakeDijkstraMap(game.level.floor);
        map.AddAttractionPoint(playerPosition);
        map.Calculate();

        Vector2Int pos = map.Chase(entity.position);
        var moveable = entity.GetBehaviour<BehaviourMoveable>();
        moveable.TryMoveTo(entity, pos - entity.position, () => entity.isEndOfTurn = true);
        return State.Running;
    }
}
