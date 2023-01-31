using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BH_TurnDelay : StateBehaviour
{
    public int numOfTurns = 1;
    private int waitTurn = 0;

    private enum StateDelay { Active, Waiting };
    private StateDelay stateDelay = StateDelay.Active;
    public override State Turn(Entity entity, int turn)
    {
        switch (stateDelay)
        {
            case StateDelay.Waiting:
                if (turn - waitTurn >= numOfTurns)
                {
                    stateDelay = StateDelay.Active;
                    return State.Idle;
                }
                else
                {
                    entity.isEndOfTurn = true;
                    return State.Running;
                }
            case StateDelay.Active:
                if (turn - waitTurn > numOfTurns)
                {
                    waitTurn = turn;
                    stateDelay = StateDelay.Waiting;
                    entity.isEndOfTurn = true;
                    return State.Running;
                }
                else
                {
                    return State.Idle;
                }
            default: return State.Idle;
        }
    }
}
