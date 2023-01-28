using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ChasePoint : Moveable
{
    public Vector2Int target;
    private DijkstraMap map;

    protected override void Start()
    {
        base.Start();
        var game = GameManager.instance;
        map = game.MakeDijkstraMap(game.level.floor);
        map.AddAttractionPoint(target);
        map.AddRepulsionPoint(new Vector2Int(0, 0), 5, 1.2f);
        map.AddRepulsionPoint(new Vector2Int(-2, 0), 5, 1.2f);
        map.AddRepulsionPoint(new Vector2Int(-4, -4), 5, 1.2f);
        map.AddRepulsionPoint(new Vector2Int(-3, 4), 5, 1.2f);
        map.Calculate();
    }

    void Update()
    {
        if (stateMoveable != StateMoveable.Idle) return;

        Vector2Int current = new Vector2Int((int)(transform.position.x - 0.5f), (int)(transform.position.y - 0.5f));
        if(Vector2Int.Distance(current, target) > 0.05){
            Vector2Int pos = map.Chase(current);
            TryMoveTo(pos - current);
        }
    }

    void OnGUI(){
        //var game = GameManager.instance;
        //game.DebugDijkstraMap(map);
    }
}
