using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BH_Unit : StateBehaviour
{
    public int hp = 10;
    public int numTurnsDying = 10;
    public LinkedList<int> damageEvent = new LinkedList<int>();

    protected enum StateUnit { Idle, Hurt, Dying, Fading, Dead };
    protected StateUnit stateUnit = StateUnit.Idle;

    private int countTurns = 0;

    public virtual void ReceiveDamage(int damage)
    {
        damageEvent.AddLast(damage);
    }

    public override State Turn(Entity entity)
    {
        switch (stateUnit)
        {
            case StateUnit.Idle:
                if (damageEvent.Count > 0)
                {
                    foreach (var dmg in damageEvent)
                    {
                        hp -= dmg;
                    }
                    damageEvent.Clear();
                    if (hp <= 0)
                    {
                        countTurns = 0;
                        entity.isBlock = false;
                        entity.PlayDead();
                        stateUnit = StateUnit.Dying;
                    }
                    else
                    {
                        entity.PlayHurt();
                        stateUnit = StateUnit.Hurt;
                    }
                    return State.Running;
                }
                else
                {
                    entity.PlayIdle();
                    return State.Idle;
                }
            case StateUnit.Hurt:
                if (entity.IsAnimationEnd())
                {
                    entity.PlayIdle();
                    stateUnit = StateUnit.Idle;
                    return State.Idle;
                }
                else
                {
                    return State.Running;
                }
            case StateUnit.Dying:
                if (countTurns >= numTurnsDying)
                {
                    entity.PlayFade();
                    stateUnit = StateUnit.Fading;
                } else {
                    countTurns++;
                    entity.isEndOfTurn = true;
                }
                return State.Running;
            case StateUnit.Fading:
                if (entity.IsAnimationEnd())
                    stateUnit = StateUnit.Dead;
                return State.Running;
            case StateUnit.Dead:
                entity.isDead = true;
                return State.Running;
            default:
                return State.Idle;
        }
    }
}
