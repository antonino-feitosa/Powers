using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BH_Alternating : StateBehaviourDecision
{
    public override State Turn(Entity entity, int turn)
    {
        if (turn % 2 == 0)
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
