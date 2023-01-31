using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public abstract class StateBehaviourPositionCondition : StateBehaviour
{
    public virtual bool AcceptPosition(Vector2Int pos, GameManager.Level level)
    {
        var floor = level.floor;
        foreach (var inc in Entity.Directions)
        {
            var n = pos + inc;
            if (!floor.Contains(n) || level.positionToEntity.ContainsKey(n))
                return false;
        }
        transform.position = new Vector3(pos.x, pos.y);
        return true;
    }
}
