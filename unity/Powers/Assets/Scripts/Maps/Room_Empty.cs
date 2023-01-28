using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(fileName ="Room - Empty - ", menuName ="PCG/Room - Empty")]
public class Room_Empty : ProceduralMap
{
    public override void Generate(int level = 1)
    {
        for (int y = center.y - radius; y < center.y + radius + 1; y++)
        {
            for (int x = center.x - radius; x < center.x + radius + 1; x++)
            {
                floor.Add(new Vector2Int(x, y));
            }
        }

        List<Vector2Int> points = new List<Vector2Int>{
            new Vector2Int(center.x - radius, center.y - radius),
            new Vector2Int(center.x - radius, center.y + 0),
            new Vector2Int(center.x - radius, center.y + radius),
            new Vector2Int(center.x, center.y - radius),
            new Vector2Int(center.x, center.y + 0),
            new Vector2Int(center.x, center.y + radius),
            new Vector2Int(center.x + radius, center.y - radius),
            new Vector2Int(center.x + radius, center.y + 0),
            new Vector2Int(center.x + radius, center.y + radius)
        };
        int index = Random.Range(0, points.Count);
        stairsUp = points[index];
        floor.Add(stairsUp);
        points.RemoveAt(index);
        index = Random.Range(0, points.Count);
        stairsDown = points[index];
        floor.Add(stairsDown);
    }
}
