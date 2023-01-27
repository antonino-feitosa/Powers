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

        int [] xpos = {center.x - radius, 0, center.x + radius};
        int [] ypos = {center.y - radius, 0, center.y + radius};
        int px = Random.Range(0, xpos.Length);
        int py = px == 1 ? 2 * Random.Range(0, 2) : Random.Range(0, ypos.Length);
        stairsUp = new Vector2Int(xpos[px] + 2 < xpos.Length ? xpos[px] + 2 : 0, ypos[py]);
        stairsDown = new Vector2Int(xpos[xpos.Length - px], ypos[ypos.Length - py]);
    }
}
