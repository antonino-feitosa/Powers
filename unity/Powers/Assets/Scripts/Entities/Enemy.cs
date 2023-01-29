using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Enemy : Moveable
{
    public string damageType = "physical";
    public int damage = 2;
    public int hp = 10;

    public Vector2Int position;
    public LinkedList <(Moveable,string,int,Action)> damageEvent = new LinkedList<(Moveable,string,int,Action)>();

    public override void ReceiveDamage(Moveable ohter, string damageType, int damage, Action call = null)
    {
        base.ReceiveDamage(ohter, damageType, damage, call);
        damageEvent.AddLast((ohter, damageType, damage, call));
    }

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
            if (!floor.Contains(n))
                return false;
        }
        position = pos;
        transform.position = new Vector3(pos.x, pos.y);
        return true;
    }

    protected virtual void ProcessDamage(){
        foreach(var (ent,dtype,dam,call) in damageEvent){
            hp -= dam;
            if(hp <= 0){
                isDead = true;
            }
        }
    }

    public override bool Turn()
    {
        if (base.Turn()) return true;
        
        ProcessDamage();
        if(!isDead){

        }

        return false;
    }
}
