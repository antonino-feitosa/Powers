using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(fileName = "Room - Bernoulli - ", menuName = "PCG/Room - Bernoulli")]
public class Room_Bernoulli : Room_Empty
{
    // Start is called before the first frame update
    public override void Generate(int level = 1)
    {
        base.Generate(level);
        for (int y = center.y - radius + 2; y < center.y + radius + 1; y += 3)
        {
            for (int x = center.x - radius + 2; x < center.x + radius + 1; x += 3)
            {
                int dx = -1 + Random.Range(0, 2);
                int dy = -1 + Random.Range(0, 2);
                floor.Remove(new Vector2Int(x + dx, y + dy));
            }
        }
        floor.Add(stairsUp);
        floor.Add(stairsDown);
        PutFloorAtNeighborhood(stairsUp);
        PutFloorAtNeighborhood(stairsDown);
    }
}
