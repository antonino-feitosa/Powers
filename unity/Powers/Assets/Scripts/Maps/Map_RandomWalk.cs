using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(fileName = "Map - Random Walk - ", menuName = "PCG/Map - Random Walk")]
public class Map_RandomWalk : ProceduralMap
{
    public int iterations = 10;
    public float roomPercent = 0.8f;
    public ProceduralMap[] rooms;
    public override void Generate(int level = 1)
    {
        stairsUp = AddRoom(center, level) + Vector2Int.zero;
        stairsDown = stairsUp;
        Vector2Int pos = new Vector2Int(center.x, center.y);
        Vector2Int[] inc = new Vector2Int[4] { Vector2Int.left, Vector2Int.right, Vector2Int.up, Vector2Int.down };
        for (int i = 0; i < iterations; i++)
        {
            int index = Random.Range(0, inc.Length);
            for (int j = 0; j < radius * 2; j++)
            {
                floor.Add(pos);
                pos += inc[index];
            }
            stairsDown = AddRoom(pos, level) + Vector2Int.zero;
        }
    }

    public Vector2Int AddRoom(Vector2Int pos, int level)
    {
        ProceduralMap room = rooms[Random.Range(0, rooms.Length)];
        room.center = pos;
        room.Generate(level);
        floor.UnionWith(room.floor);
        return room.stairsUp;
    }
}
