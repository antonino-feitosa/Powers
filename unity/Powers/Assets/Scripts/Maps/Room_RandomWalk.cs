using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(fileName = "Room - RandomWalk - ", menuName = "PCG/Room - Random Walk")]
public class Room_RandomWalk : ProceduralMap
{
    public int iterations = 20;
    public int length = 20;
    public bool restart = false;
    public override void Generate(int level = 1)
    {
        stairsUp = new Vector2Int(center.x, center.y);
        
        Vector2Int pos = new Vector2Int(center.x, center.y);
        Vector2Int[] inc = new Vector2Int[4] { Vector2Int.left, Vector2Int.right, Vector2Int.up, Vector2Int.down };
        for (int r = 0; r < iterations; r++)
        {
            for (int i = 0; i < length; i++)
            {
                int index = Random.Range(0, inc.Length);
                pos += inc[index];
                floor.Add(pos);
            }
            stairsDown = new Vector2Int(pos.x, pos.y);
            if (restart){
                pos = new Vector2Int(center.x, center.y);
            }
        }
    }
}
