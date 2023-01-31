using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BH_Alternating : StateBehaviourDecision
{
    private bool isNormal = true;
    public override State Turn(Entity entity)
    {
        if (isNormal)
        {
            SetNormalFlow();
            isNormal = false;
        }
        else
        {
            SetAlternativeFlow();
            isNormal = true;
        }
        return State.Idle;
    }
}
