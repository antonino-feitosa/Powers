using System.Collections;
using System.Collections.Generic;
using System;
using UnityEngine;

public class BH_Melee : StateBehaviourDecision
{
    public override State Turn(Entity entity, int turn)
    {
        var game = GameManager.instance;
        if(!game.HasPlayer()){
            SetAlternativeFlow();
            return State.Idle;
        }

        var playerPosition = game.GetPlayerPosition();
        if (Mathf.Max(Mathf.Abs(entity.position.x - playerPosition.x), Mathf.Abs(entity.position.y - playerPosition.y)) <= 1)
        {
            SetNormalFlow();
            if(playerPosition != entity.position)
                entity.direction = playerPosition - entity.position;
            return State.Idle;
        }
        else
        {
            SetAlternativeFlow();
            return State.Idle;
        }
    }
}
