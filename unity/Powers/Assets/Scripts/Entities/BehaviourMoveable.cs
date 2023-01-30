using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BehaviourMoveable : StateBehaviour
{
    private static Dictionary<Vector2Int, string> mapAnim;

    static BehaviourMoveable()
    {
        mapAnim = new Dictionary<Vector2Int, string>();
        mapAnim.Add(new Vector2Int(+1, +0), "Right");
        mapAnim.Add(new Vector2Int(-1, +0), "Left");
        mapAnim.Add(new Vector2Int(+0, +1), "Up");
        mapAnim.Add(new Vector2Int(+0, -1), "Down");
        mapAnim.Add(new Vector2Int(-1, +1), "UpLeft");
        mapAnim.Add(new Vector2Int(+1, +1), "UpRight");
        mapAnim.Add(new Vector2Int(-1, -1), "DownLeft");
        mapAnim.Add(new Vector2Int(+1, -1), "DownRight");
    }

    public float moveSpeed = 5f;

    protected enum StateMoveable { Moving, Idle, IdleHurt, MovingHurt };
    protected StateMoveable stateMoveable = StateMoveable.Idle;

    protected Animator anim;
    private Vector2Int dir = Vector2Int.right;
    private Entity entity;
    private Vector3 _movingDestination;

    void Awake()
    {
        anim = GetComponent<Animator>();
        entity = GetComponent<Entity>();
        entity.position = GameManager.ToVector2Int(entity.transform.position);
    }

    public override State Turn(Entity entity)
    {
        if (stateMoveable == StateMoveable.Moving)
        {
            if (Vector3.Distance(transform.position, _movingDestination) > 0.05f)
            {
                transform.position = Vector3.MoveTowards(transform.position, _movingDestination, moveSpeed * Time.deltaTime);
                return State.Running;
            }
            else
            {
                transform.position = _movingDestination;
                stateMoveable = StateMoveable.Idle;
                anim.Play("Idle " + mapAnim[dir]);
                return State.Idle;
            }
        }
        else if (stateMoveable == StateMoveable.IdleHurt)
        {
            float time = anim.GetCurrentAnimatorStateInfo(0).normalizedTime;
            if (time > 1)
            {
                anim.Play("Idle " + mapAnim[dir]);
                stateMoveable = StateMoveable.Idle;
                return State.Idle;
            } else {
                return State.Running;
            }
        }
        else if (stateMoveable == StateMoveable.MovingHurt)
        {
            if (anim.GetCurrentAnimatorStateInfo(0).normalizedTime > 1)
            {
                anim.Play("Idle " + mapAnim[dir]);
                stateMoveable = StateMoveable.Moving;
            }
            return State.Running;
        }
        return State.Idle;
    }

    public void Blink()
    {
        if (stateMoveable == StateMoveable.Idle)
        {
            anim.Play("Hurt " + mapAnim[dir], 0, 0);
            stateMoveable = StateMoveable.IdleHurt;
        }
        else if (stateMoveable == StateMoveable.Moving)
        {
            anim.Play("Hurt " + mapAnim[dir], 0, 0);
            stateMoveable = StateMoveable.MovingHurt;
        }
    }

    public bool TryMoveTo(Entity entity, Vector2Int dir)
    {
        if (stateMoveable != StateMoveable.Idle) return false;

        Vector2Int origin = GameManager.ToVector2Int(transform.position);
        Vector2Int dest = origin + dir;

        var game = GameManager.instance;
        if (game.TryMoveTo(entity, origin, dest))
        {
            stateMoveable = StateMoveable.Moving;
            anim.Play("Walk " + mapAnim[dir]);
            _movingDestination = new Vector3(transform.position.x + dir.x, transform.position.y + dir.y);
            this.dir = dir;
            return true;
        }
        return false;
    }
}
