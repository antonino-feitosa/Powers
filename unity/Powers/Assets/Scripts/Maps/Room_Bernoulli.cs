using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(fileName ="Room - Bernoulli - ", menuName ="PCG/Room - Bernoulli")]
public class Room_Bernoulli : ProceduralMap
{
    // Start is called before the first frame update
    public override void Generate(int level = 1)
    {
        for (int y = center.y - radius; y < center.y + radius + 1; y++)
        {
            for (int x = center.x - radius; x < center.x + radius + 1; x++)
            {
                floor.Add(new Vector2Int(x, y));
            }
        }
        for (int y = center.y - radius + 2; y < center.y + radius + 1; y += 3)
        {
            for (int x = center.x - radius + 2; x < center.x + radius + 1; x += 3)
            {
                int dx = -1 + Random.Range(0, 2);
                int dy = -1 + Random.Range(0, 2);
                floor.Remove(new Vector2Int(x + dx, y + dy));
            }
        }
        
        int [] xpos = {center.x - radius, 0, center.x + radius};
        int [] ypos = {center.y - radius, 0, center.y + radius};
        int px = Random.Range(0, xpos.Length);
        int py = px == 1 ? 2 * Random.Range(0, 2) : Random.Range(0, ypos.Length);
        stairsUp = new Vector2Int(xpos[px] + 2 < xpos.Length ? xpos[px] + 2 : 0, ypos[py]);
        stairsDown = new Vector2Int(xpos[xpos.Length - px], ypos[ypos.Length - py]);
        floor.Add(stairsUp);
        floor.Add(stairsDown);
    }
}
