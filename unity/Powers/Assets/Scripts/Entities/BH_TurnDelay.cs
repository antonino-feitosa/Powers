using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BH_TurnDelay : StateBehaviour
{
    public int numOfTurns = 1;
    private int count = 0;
    public override State Turn(Entity entity)
    {
        if(count == numOfTurns){
            count = 0;
            return State.Idle;
        } else {
            count++;
            entity.isEndOfTurn = true;
            return State.Running;
        }
    }
}
