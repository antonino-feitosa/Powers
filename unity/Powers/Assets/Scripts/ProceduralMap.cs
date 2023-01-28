using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public abstract class ProceduralMap : ScriptableObject
{
    public int radius = 20;
    [HideInInspector]
    public Vector2Int center = Vector2Int.zero;
    public HashSet<Vector2Int> floor = new HashSet<Vector2Int>();
    [HideInInspector]
    public Vector2Int stairsUp = Vector2Int.zero;
    [HideInInspector]
    public Vector2Int stairsDown = Vector2Int.zero;

    public abstract void Generate(int level = 1);
}
