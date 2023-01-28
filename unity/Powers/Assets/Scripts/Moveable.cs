using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Moveable : MonoBehaviour
{
    private static Dictionary<Vector2Int, string> mapAnim;

    static Moveable()
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

    private Animator anim;
    private Vector2Int dir = Vector2Int.right;
    private object Monitor = new object();

    protected virtual void Start()
    {
        anim = GetComponent<Animator>();
    }

    public virtual bool Turn()
    {
        return false; // false -> end of turn
    }

    public virtual void ReceiveDamage(Moveable ohter, Action call = null)
    {
        lock (Monitor)
        {
            if (stateMoveable == StateMoveable.Idle || stateMoveable == StateMoveable.Moving)
            {
                anim.Play("Hurt " + mapAnim[dir], 1);
                if (stateMoveable == StateMoveable.Idle)
                    stateMoveable = StateMoveable.IdleHurt;
                else if (stateMoveable == StateMoveable.Moving)
                    stateMoveable = StateMoveable.MovingHurt;
            }
        }
    }

    void OnAnimatorMove()
    {
        lock (Monitor)
        {
            if (stateMoveable == StateMoveable.IdleHurt)
            {
                anim.Play("Idle " + mapAnim[dir]);
                stateMoveable = StateMoveable.Idle;
            }
            else if (stateMoveable == StateMoveable.IdleHurt)
            {
                anim.Play("Walk " + mapAnim[dir]);
                stateMoveable = StateMoveable.Moving;
            }
        }
    }

    protected bool TryMoveTo(Vector2Int dir, Action call = null)
    {
        lock (Monitor)
        {
            if (stateMoveable != StateMoveable.Idle) return false;

            Vector2Int origin = GameManager.ToVector2Int(transform.position);
            Vector2Int dest = origin + dir;

            var game = GameManager.instance;
            if (game.TryMoveTo(origin, dest))
            {
                stateMoveable = StateMoveable.Moving;
                anim.Play("Walk " + mapAnim[dir]);
                StartCoroutine(SmoothMovement(dir, call));
                return true;
            }
        }
        return false;
    }

    private IEnumerator SmoothMovement(Vector2Int dir, Action call = null)
    {
        this.dir = dir;
        Vector3 destination = new Vector3(transform.position.x + dir.x, transform.position.y + dir.y);
        while (Vector3.Distance(transform.position, destination) > 0.05f)
        {
            transform.position = Vector3.MoveTowards(transform.position, destination, moveSpeed * Time.deltaTime);
            yield return null;
        }
        transform.position = destination;
        lock (Monitor)
        {
            anim.Play("Idle " + mapAnim[dir]);
            stateMoveable = StateMoveable.Idle;
            if (call != null) call();
        }
    }
}
