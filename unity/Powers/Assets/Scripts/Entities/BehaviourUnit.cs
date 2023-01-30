using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BehaviourUnit : StateBehaviour
{
    public int hp = 10;
    public int attack;
    public LinkedList<int> damageEvent = new LinkedList<int>();

    protected enum StateUnit { Idle, Dead };
    protected StateUnit stateUnit = StateUnit.Idle;

    public virtual void ReceiveDamage(int damage)
    {
        damageEvent.AddLast(damage);
    }

    public override State Turn(Entity entity)
    {
        if (stateUnit == StateUnit.Dead)
        {
            entity.isDead = true;
            return State.Running;
        }
        else if (stateUnit == StateUnit.Idle)
        {
            if (damageEvent.Count > 0)
            {
                foreach (var dmg in damageEvent)
                {
                    hp -= dmg;
                }
                damageEvent.Clear();
                var moveable = entity.GetBehaviour<BehaviourMoveable>();
                if (moveable != null)
                {
                    moveable.Blink();
                    if (hp <= 0) stateUnit = StateUnit.Dead;
                    return State.Running;
                }
            }
        }
        return State.Idle;
    }
}
