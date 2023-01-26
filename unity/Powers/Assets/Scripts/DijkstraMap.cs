using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Random = UnityEngine.Random;

public class DijkstraMap : IComparer<Vector2Int>
{

    private static float INF = 100f;
    private Func<Vector2Int, List<Vector2Int>> neighborhood;
    private Func<Vector2Int, Vector2Int, float> moveCost;
    private HashSet<Vector2Int> grid;

    private Dictionary<Vector2Int, float> attractionPoints;
    private Dictionary<Vector2Int, float> repulsionPoints;
    private Dictionary<Vector2Int, float> distance;

    public DijkstraMap(HashSet<Vector2Int> grid, Func<Vector2Int, List<Vector2Int>> neighborhood, Func<Vector2Int, Vector2Int, float> moveCost)
    {
        this.grid = grid;
        this.moveCost = moveCost;
        this.neighborhood = neighborhood;
        distance = new Dictionary<Vector2Int, float>();
        repulsionPoints = new Dictionary<Vector2Int, float>();
        attractionPoints = new Dictionary<Vector2Int, float>();
    }

    public void AddAttractionPoint(Vector2Int point, float force = 0)
    {
        attractionPoints.Add(point, force);
    }

    public void AddRepulsionPoint(Vector2Int point, float force = 1f)
    {
        repulsionPoints.Add(point, force);
    }

    public int Compare(Vector2Int x, Vector2Int y)
    {
        float diff = distance[x] - distance[y];
        return diff == 0 ? 0 : (diff < 0 ? -1 : +1);
    }

    protected float Cost(Vector2Int source, Vector2Int dest)
    {
        float inc = 0;
        foreach (var entry in repulsionPoints)
        {
            float sourceToRep = Vector2Int.Distance(source, entry.Key);
            float destToRep = Vector2Int.Distance(dest, entry.Key);
            if (destToRep < sourceToRep)
            {
                inc += entry.Value * (destToRep - sourceToRep); // approximation
            }
        }
        return Vector2Int.Distance(source, dest) + inc;
    }

    protected void Calculate()
    {
        distance.Clear();
        foreach (var pos in grid)
        {
            distance.Add(pos, INF);
        }
        foreach (var entry in attractionPoints)
        {
            distance.Add(entry.Key, entry.Value);
        }
        ApplyDijkstra();
    }

    public Vector2Int Chase(Vector2Int point)
    {
        Vector2Int best = Vector2Int.zero;
        float dist = -1;
        foreach (var pos in neighborhood(point))
        {
            if (dist == -1 || distance[pos] < dist)
            {
                dist = distance[pos];
                best = pos;
            }
        }
        return best;
    }


    protected void ApplyDijkstra()
    {
        PriorityQueue<Vector2Int> queue = new PriorityQueue<Vector2Int>(this);
        foreach (var pos in grid)
        {
            queue.Push(pos);
        }
        while (queue.Count > 0)
        {
            Vector2Int current = queue.Pop();
            foreach (var neighbor in neighborhood(current))
            {
                float alt = distance[current] + Cost(current, neighbor);
                if (alt < distance[neighbor])
                {
                    distance[neighbor] = alt;
                    queue.Update(neighbor);
                }
            }
        }
    }

    public DijkstraMap MakeRangeMap(float range = 3, float force = -1.2f)
    {
        DijkstraMap map = new DijkstraMap(grid, neighborhood, moveCost);
        map.distance.Clear();
        foreach (var pos in grid)
        {
            float val = distance[pos];
            if (val < DijkstraMap.INF && val >= range)
            {
                map.distance.Add(pos, (float)(force * val + (0.001 * Random.value)));
            }
            else
            {
                map.distance.Add(pos, INF);
            }
        }
        map.ApplyDijkstra();
        return map;
    }

    public DijkstraMap MakeFleeMap(float force = -1.2f, float cut = 0.9f)
    {
        float max = 0f;
        foreach (var pos in grid)
        {
            max = Mathf.Max(max, distance[pos]);
        }
        float threshold = max * cut;
        DijkstraMap map = new DijkstraMap(grid, neighborhood, moveCost);
        map.distance.Clear();
        foreach (var pos in grid)
        {
            float val = distance[pos];
            if (val < DijkstraMap.INF && val >= threshold)
            {
                map.distance.Add(pos, (float)(force * val + (0.001 * Random.value)));
            }
            else
            {
                map.distance.Add(pos, INF);
            }
        }
        map.ApplyDijkstra();
        return map;
    }
}
