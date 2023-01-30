using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BH_Visible : StateBehaviour
{
    public bool runInBackground = false;
    public override State Turn(Entity entity)
    {
        var game = GameManager.instance;
        if(game.IsVisibleAt(entity.position)){
            gameObject.SetActive(true);
            return State.Idle;
        } else {
            if(runInBackground){
                return State.Idle;
            } else {
                entity.isEndOfTurn = true;
                return State.Running;
            }
        }
    }
}
