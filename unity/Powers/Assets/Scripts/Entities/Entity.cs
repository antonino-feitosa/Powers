using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Entity : MonoBehaviour
{
    public static readonly Vector2Int Up = new Vector2Int(0, 1);
    public static readonly Vector2Int Down = new Vector2Int(0, -1);
    public static readonly Vector2Int Left = new Vector2Int(-1, 0);
    public static readonly Vector2Int Right = new Vector2Int(1, 0);
    public static readonly Vector2Int UpLeft = new Vector2Int(-1, +1);
    public static readonly Vector2Int UpRight = new Vector2Int(1, +1);
    public static readonly Vector2Int DownLeft = new Vector2Int(-1, -1);
    public static readonly Vector2Int DownRight = new Vector2Int(1, -1);
    public static readonly Vector2Int[] Directions = { Up, Down, Left, Right, UpLeft, UpRight, DownLeft, DownRight };

    private static readonly Dictionary<Vector2Int, string> dirToAnim;

    static Entity()
    {
        dirToAnim = new Dictionary<Vector2Int, string>();
        dirToAnim.Add(Up, "Up");
        dirToAnim.Add(Down, "Down");
        dirToAnim.Add(Left, "Left");
        dirToAnim.Add(Right, "Right");
        dirToAnim.Add(UpLeft, "UpLeft");
        dirToAnim.Add(UpRight, "UpRight");
        dirToAnim.Add(DownLeft, "DownLeft");
        dirToAnim.Add(DownRight, "DownRight");
    }

    public StateBehaviour behaviour;

    public bool isBlock = false;
    [HideInInspector]
    public bool isDead = false;
    [HideInInspector]
    public bool isEndOfTurn = false;

    public Vector2Int position;
    public Vector2Int direction = Right;

    [HideInInspector]
    public Animator animator;
    void Awake()
    {
        animator = GetComponent<Animator>();
        position = GameManager.ToVector2Int(transform.position);
    }

    public void SetAnimatorFreeze(bool enable){
        animator.speed = enable ? 0 : 1;
    }

    public void PlayIdle()
    {
        animator.Play("Idle " + dirToAnim[direction]);
    }

    public void PlayRest()
    {
        animator.Play("Rest " + dirToAnim[direction]);
    }

    public void PlayWalk()
    {
        animator.Play("Walk " + dirToAnim[direction]);
    }

    public void PlayRun()
    {
        animator.Play("Run " + dirToAnim[direction]);
    }

    public void PlayHurt()
    {
        animator.Play("Hurt " + dirToAnim[direction]);
    }
    
    public void PlayDead()
    {
        animator.Play("Dead " + dirToAnim[direction]);
    }
    public void PlayFade()
    {
        animator.Play("Fade " + dirToAnim[direction]);
    }

    public void PlayActive()
    {
        animator.Play("Active " + dirToAnim[direction]);
    }

    public bool IsAnimationEnd()
    {
        return animator.GetCurrentAnimatorStateInfo(0).normalizedTime > 1;
    }

    public void DoProcess()
    {
        StateBehaviour current = behaviour;
        while (current != null && current.Turn(this) == StateBehaviour.State.Idle)
        {
            current = current.next;
        }
    }

    public Type GetBehaviour<Type>()
    {
        StateBehaviour current = behaviour;
        while (current != null)
        {
            if (current is Type behaviour)
            {
                return behaviour;
            }
            current = current.next;
        }
        return default(Type);
    }
}
