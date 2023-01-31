using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BH_TriggerPosition : StateBehaviour
{
    public override State Turn(Entity entity, int turn)
    {
        var game = GameManager.instance;
        List<Entity> list = game.level.positionToEntity[entity.position];
        if(list.Count > 0){
            return State.Idle;
        } else {
            return State.Running;
        }
    }
}
