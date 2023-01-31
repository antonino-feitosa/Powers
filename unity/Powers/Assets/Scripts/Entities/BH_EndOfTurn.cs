using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BH_EndOfTurn : StateBehaviour
{
    public override State Turn(Entity entity, int turn)
    {
        entity.isEndOfTurn = true;
        return State.Running;
    }
}
