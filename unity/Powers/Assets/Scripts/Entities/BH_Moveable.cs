using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BH_Moveable : StateBehaviour
{
    public float moveSpeed = 5f;

    protected enum StateMoveable { Moving, Idle };
    protected StateMoveable stateMoveable = StateMoveable.Idle;

    private Vector3 _movingDestination;

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
                entity.PlayIdle();
                return State.Idle;
            }
        }
        return State.Idle;
    }

    public bool TryMoveTo(Entity entity, Vector2Int dir)
    {
        if (stateMoveable != StateMoveable.Idle) return false;

        Vector2Int origin = GameManager.ToVector2Int(transform.position);
        Vector2Int dest = origin + dir;

        var game = GameManager.instance;
        if (game.TryMoveTo(entity, origin, dest))
        {
            entity.direction = dir;
            entity.PlayWalk();
            _movingDestination = new Vector3(transform.position.x + dir.x, transform.position.y + dir.y);
            stateMoveable = StateMoveable.Moving;
            return true;
        }
        return false;
    }
}
