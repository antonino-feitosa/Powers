using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BH_Enemy : StateBehaviourPositionCondition
{
    public override State Turn(Entity entity, int turn)
    {
        return State.Idle;
    }
}
