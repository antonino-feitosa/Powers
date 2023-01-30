using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BH_Sight : StateBehaviour
{
    public int viewRadius = 5;
    public override State Turn(Entity entity)
    {
        var game = GameManager.instance;
        var playerPosition = game.GetPlayerPosition();
        var view = game.FieldOfView(entity.position, viewRadius);
        if (!view.Contains(playerPosition))
        {
            entity.isEndOfTurn = true;
            return State.Running;
        }
        else
        {
            return State.Idle;
        }
    }
}
