using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TriggerTrap : Moveable
{
    public string damageType;
    public int damage;

    public Vector2Int position;

    private enum StateTrap { Idle, Active, Deactive };
    private StateTrap stateTrap = StateTrap.Idle;

    private object Monitor = new object();

    public bool AcceptPosition(Vector2Int pos)
    {
        var game = GameManager.instance;
        if(game.HasEntityAt(pos)){
            return false;
        }
        int[] incx = new int[8] { -1, -1, -1, +0, +0, +1, +1, +1 };
        int[] incy = new int[8] { -1, +0, +1, -1, +1, -1, +0, +1 };
        var floor = game.level.floor;
        for (int i = 0; i < incx.Length; i++)
        {
            var n = new Vector2Int(pos.x + incx[i], pos.y + incy[i]);
            if (game.HasEntityAt(pos) || game.level.positionToEntity.ContainsKey(position))
                return false;
        }
        position = pos;
        transform.position = new Vector3(pos.x, pos.y);
        return true;
    }

    public override bool Turn()
    {
        if (base.Turn()) return true;
        
        var game = GameManager.instance;
        gameObject.SetActive(game.IsVisibleAt(position));

        if (stateTrap == StateTrap.Idle)
        {
            List<Moveable> list = game.level.positionToEntity[position];
            bool activate = false;
            foreach (var ent in list.FindAll(e => e is PlayerControler))
            {
                activate = true;
                ent.ReceiveDamage(this, damageType, damage);
            }
            if (activate)
            {
                anim.Play("Active");
                stateTrap = StateTrap.Active;
                return true;
            }
            return false;
        }
        else if (stateTrap == StateTrap.Active)
        {
            if (anim.GetCurrentAnimatorStateInfo(0).normalizedTime > 1)
            {
                anim.Play("Idle");
                stateTrap = StateTrap.Idle;
                return false;
            }
            else
            {
                return true;
            }
        }
        return false;
    }
}
