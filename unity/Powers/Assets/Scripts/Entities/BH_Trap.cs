using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BH_Trap : StateBehaviourPositionCondition
{
    public int damage;

    private enum StateTrap { Idle, Active };
    private StateTrap stateTrap = StateTrap.Idle;

    public override State Turn(Entity entity)
    {
        var game = GameManager.instance;
        switch (stateTrap)
        {
            case StateTrap.Idle:
                List<Entity> list = game.level.positionToEntity[entity.position];
                bool activate = false;
                foreach (var ent in list)
                {
                    var unit = ent.GetBehaviour<BH_Unit>();
                    if (unit != null)
                    {
                        activate = true;
                        unit.ReceiveDamage(damage);
                    }
                }
                if (activate)
                {
                    entity.PlayActive();
                    stateTrap = StateTrap.Active;
                    return State.Running;
                } else {
                    return State.Idle;
                }
            case StateTrap.Active:
                if (entity.IsAnimationEnd())
                {
                    entity.PlayIdle();
                    stateTrap = StateTrap.Idle;
                    return State.Idle;
                }
                else
                {
                    return State.Running;
                }
            default:
                return State.Idle;
        }
    }
}
