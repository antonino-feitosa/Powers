using System.Collections;
using System.Collections.Generic;
using System;
using UnityEngine;

public class BH_Melee : StateBehaviourDecision
{
    public override State Turn(Entity entity)
    {
        var game = GameManager.instance;
        var playerPosition = game.GetPlayerPosition();
        var neighbor = game.Neighborhood(entity.position);
        if (Array.Exists(Entity.Directions, pos => (pos + entity.position) == playerPosition))
        {
            SetNormalFlow();
            entity.direction = playerPosition - entity.position;
            entity.PlayIdle();
            return State.Idle;
        }
        else
        {
            SetAlternativeFlow();
            return State.Idle;
        }
    }
}
