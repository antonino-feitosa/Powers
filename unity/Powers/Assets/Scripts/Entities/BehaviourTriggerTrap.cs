using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BehaviourTriggerTrap : StateBehaviour
{
    public int damage;

    private enum StateTrap { Idle, Active, Deactive };
    private StateTrap stateTrap = StateTrap.Idle;

    private object Monitor = new object();
    protected Animator anim;

    void Awake()
    {
        anim = GetComponent<Animator>();
    }

    public bool AcceptPosition(Vector2Int pos)
    {
        var game = GameManager.instance;
        var entity = GetComponent<Entity>();
        if (game.HasEntityAt(pos))
        {
            return false;
        }
        int[] incx = new int[8] { -1, -1, -1, +0, +0, +1, +1, +1 };
        int[] incy = new int[8] { -1, +0, +1, -1, +1, -1, +0, +1 };
        var floor = game.level.floor;
        for (int i = 0; i < incx.Length; i++)
        {
            var n = new Vector2Int(pos.x + incx[i], pos.y + incy[i]);
            if (!floor.Contains(n) || game.HasEntityAt(n) || game.level.positionToEntity.ContainsKey(n))
                return false;
        }
        entity.position = pos;
        transform.position = new Vector3(pos.x, pos.y);
        return true;
    }

    public override State Turn(Entity entity)
    {
        var game = GameManager.instance;
        gameObject.SetActive(game.IsVisibleAt(entity.position));

        if (stateTrap == StateTrap.Idle)
        {
            List<Entity> list = game.level.positionToEntity[entity.position];
            bool activate = false;
            foreach (var ent in list)
            {
                var unit = ent.GetBehaviour<BehaviourUnit>();
                if (unit != null)
                {
                    activate = true;
                    unit.ReceiveDamage(damage);
                }
            }
            if (activate)
            {
                anim.Play("Active");
                stateTrap = StateTrap.Active;
            }
        }
        else if (stateTrap == StateTrap.Active)
        {
            if (anim.GetCurrentAnimatorStateInfo(0).normalizedTime > 1)
            {
                anim.Play("Idle");
                stateTrap = StateTrap.Idle;
            }
        }

        if(stateTrap == StateTrap.Idle){
            entity.isEndOfTurn = true;
            return State.Idle;
        } else {
            return State.Running;
        }
    }
}
