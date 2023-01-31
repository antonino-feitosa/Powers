using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BH_Attack : StateBehaviour
{
    public int damage = 1;
    public override State Turn(Entity entity)
    {

        var game = GameManager.instance;
        var unit = game.player.GetComponent<Entity>().GetBehaviour<BH_Unit>();
        unit.ReceiveDamage(damage);
        //Debug.LogWarning("\t\t\t\t" + name + " Attacks " + unit);
        return State.Idle;
    }
}
