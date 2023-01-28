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

    protected enum StateMoveable {Moving, Idle};
    protected StateMoveable stateMoveable = StateMoveable.Idle;
    
    private Animator anim;

    protected virtual void Start()
    {
        anim = GetComponent<Animator>();
    }

    protected bool TryMoveTo(Vector2Int dir)
    {
        Vector2Int origin = GameManager.ToVector2Int(transform.position);
        Vector2Int dest = origin + dir;

        var game = GameManager.instance;
        if (game.TryMoveTo(origin, dest))
        {
            stateMoveable = StateMoveable.Moving;
            anim.Play("Walk " + mapAnim[dir], 0);
            StartCoroutine(SmoothMovement(dir));
            return true;
        }
        return false;
    }

    private IEnumerator SmoothMovement(Vector2Int dir)
    {
        Vector3 destination = new Vector3(transform.position.x + dir.x, transform.position.y + dir.y);
        while (Vector3.Distance(transform.position, destination) > 0.05f)
        {
            transform.position = Vector3.MoveTowards(transform.position, destination, moveSpeed * Time.deltaTime);
            yield return null;
        }
        transform.position = destination;
        anim.Play("Idle " + mapAnim[dir], 0);
        stateMoveable = StateMoveable.Idle;
    }
}
