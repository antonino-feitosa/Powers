using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(fileName = "Map - Random Walk - ", menuName = "PCG/Map - Random Walk")]
public class Map_RandomWalk : ProceduralMap
{
    public int iterations = 20;
    public float roomPercent = 0.8f;
    public ProceduralMap[] rooms;
    public override void Generate(int level = 1)
    {
        Vector2Int pos = new Vector2Int(center.x, center.y);
        Vector2Int[] inc = new Vector2Int[4] { Vector2Int.left, Vector2Int.right, Vector2Int.up, Vector2Int.down };
        for (int i = 0; i < iterations; i++)
        {
            int index = Random.Range(0, inc.Length);
            for (int j = 0; j < radius; j++)
            {
                floor.Add(pos);
                pos += inc[index];
            }
            if (Random.value < roomPercent)
            {
                var room = rooms[Random.Range(0, rooms.Length)];
                room.center = pos;
                room.radius = radius - 5;
                room.Generate(level);
                floor.UnionWith(room.floor);
                if (i == 0)
                {
                    stairsUp = room.stairsUp;
                }
                else if (i == iterations - 1)
                {
                    stairsDown = room.stairsDown;
                }
            }
        }
    }
}
