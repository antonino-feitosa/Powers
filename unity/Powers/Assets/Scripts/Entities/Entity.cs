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

    public AudioSource audioSource;
    public AudioClip attack;
    public AudioClip step;
    public AudioClip death;
    public AudioClip trap;
    public AudioClip scream;
    public AudioClip hurt;
    public AudioClip rest;

    private Animator animator;

    void Awake()
    {
        animator = GetComponent<Animator>();
        position = GameManager.ToVector2Int(transform.position);
    }
    
    public void DoProcess(int turn)
    {
        StateBehaviour current = behaviour;
        while (current != null)
        {
            if(current.Turn(this, turn) == StateBehaviour.State.Running){
                //if(name != "Player") Debug.Log(name + " => " + current.GetType().Name);
                break;
            }
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

    public bool IsAnimationEnd()
    {
        return animator.GetCurrentAnimatorStateInfo(0).normalizedTime > 1;
    }

    public void PlayIdle()
    {
        animator.Play("Idle " + dirToAnim[direction]);
    }

    public void PlayRest()
    {
        EffectRest();
        animator.Play("Rest " + dirToAnim[direction]);
    }

    public void PlayWalk()
    {
        EffectStep();
        animator.Play("Walk " + dirToAnim[direction]);
    }

    public void PlayAttack()
    {
        EffectAttack();
        animator.Play("Attack " + dirToAnim[direction]);
    }

    public void PlayHurt()
    {
        animator.Play("Hurt " + dirToAnim[direction]);
    }
    
    public void PlayDead()
    {
        EffectDeath();
        animator.Play("Dead " + dirToAnim[direction]);
    }
    public void PlayFade()
    {
        animator.Play("Fade " + dirToAnim[direction]);
    }

    public void PlayActive()
    {
        EffectTrap();
        animator.Play("Active");
    }

    public void PlayDeactive()
    {
        animator.Play("Deactive");
    }

    public void EffectAttack(){
        audioSource.PlayOneShot(attack);
    }

    public void EffectDeath(){
        audioSource.PlayOneShot(death);
    }

    public void EffectStep(){
        audioSource.PlayOneShot(step);
    }

    public void EffectHurt(){
        audioSource.PlayOneShot(hurt);
    }

    public void EffectTrap(){
        audioSource.PlayOneShot(trap);
    }

    public void EffectRest(){
        audioSource.PlayOneShot(rest);
    }

    public void EffectScream(){
        audioSource.PlayOneShot(scream);
    }
}
