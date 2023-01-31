using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BH_Sight : StateBehaviourDecision
{
    public int viewRadius = 5;
    public override State Turn(Entity entity)
    {
        var game = GameManager.instance;
        if(!game.HasPlayer()){
            SetAlternativeFlow();
            return State.Idle;
        }

        var playerPosition = game.GetPlayerPosition();
        var view = game.FieldOfView(entity.position, viewRadius);
        if (view.Contains(playerPosition))
        {
            SetNormalFlow();
        }
        else
        {
            SetAlternativeFlow();
        }
        return State.Idle;
    }
}
