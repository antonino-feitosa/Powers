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

    private int waitTurn = 0;

    public virtual void ReceiveDamage(int damage)
    {
        if(hp > 0){
            GetComponent<Entity>().PlayHurt();
            damageEvent.AddLast(damage);
        }
    }

    public override State Turn(Entity entity, int turn)
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
                        hp = 0;
                        waitTurn = turn;
                        entity.isBlock = false;
                        entity.PlayDead();
                        stateUnit = StateUnit.Dying;
                    }
                    else
                    {
                        stateUnit = StateUnit.Hurt;
                    }
                    return State.Running;
                }
                else
                {
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
                if (turn - waitTurn >= numTurnsDying)
                {
                    entity.PlayFade();
                    stateUnit = StateUnit.Fading;
                } else {
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
