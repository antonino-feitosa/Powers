using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BehaviourEnemyChaseHalfTurn : BehaviourEnemy
{
    public int radius = 5;
    private bool passTurn = false;

    private enum StateEnemy {Pass, Chase, EndOfTurn};
    private StateEnemy stateEnemy = StateEnemy.Pass;

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

        if(stateEnemy == StateEnemy.EndOfTurn){
            entity.isEndOfTurn = true;
            stateEnemy = passTurn ? StateEnemy.Pass : StateEnemy.Chase;
            passTurn = !passTurn;
            return State.Running;
        } else if(stateEnemy == StateEnemy.Pass){
            stateEnemy = StateEnemy.EndOfTurn;
            return State.Running;
        } else if(stateEnemy == StateEnemy.Chase){
            var map = game.MakeDijkstraMap(game.level.floor);
            map.AddAttractionPoint(playerPosition);
            map.Calculate();

            Vector2Int pos = map.Chase(entity.position);
            var moveable = entity.GetBehaviour<BehaviourMoveable>();
            moveable.TryMoveTo(entity, pos - entity.position);

            stateEnemy = StateEnemy.EndOfTurn;
            return State.Running;
        }
        return State.Running;
    }
}
