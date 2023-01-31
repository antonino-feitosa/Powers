using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BH_Attack : StateBehaviourDecision
{
    public int damage = 1;

    private enum StateAttack { Idle, Attacking }
    private StateAttack stateAttack = StateAttack.Idle;
    public override State Turn(Entity entity, int turn)
    {
        switch (stateAttack)
        {
            case StateAttack.Idle:
                var game = GameManager.instance;
                if (game.HasPlayer())
                {
                    var unit = game.player.GetComponent<Entity>().GetBehaviour<BH_Unit>();
                    unit.ReceiveDamage(damage);
                    entity.PlayAttack();
                    stateAttack = StateAttack.Attacking;
                    return State.Running;
                }
                else
                {
                    SetAlternativeFlow();
                    return State.Idle;
                }
            case StateAttack.Attacking:
                if (entity.IsAnimationEnd())
                {
                    entity.PlayIdle();
                    SetNormalFlow();
                    stateAttack = StateAttack.Idle;
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
