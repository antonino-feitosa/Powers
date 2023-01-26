using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Tilemaps;
using Random = UnityEngine.Random;

public class GameManager : MonoBehaviour
{

    public static GameManager instance;

    public int level = 1;
    public HashSet<Vector2Int> floor;
    public HashSet<Vector2Int> walls;
    public HashSet<Vector2Int> blocked;
    public HashSet<Vector2Int> visible;
    public HashSet<Vector2Int> revealed;
    public ProceduralGenerator proc;

    void Awake()
    {
        instance = this;
        floor = new HashSet<Vector2Int>();
        walls = new HashSet<Vector2Int>();
        blocked = new HashSet<Vector2Int>();

        visible = new HashSet<Vector2Int>();
        revealed = new HashSet<Vector2Int>();

        MakeEmptyMap();
        DetectWalls();
        PaintFloor();
        PaintWalls();
    }

    public List<Vector2Int> Neighborhood(Vector2Int pos)
    {
        int[] incx = new int[8] { -1, -1, -1, +0, +0, +1, +1, +1 };
        int[] incy = new int[8] { -1, +0, +1, -1, +1, -1, +0, +1 };
        List<Vector2Int> neighborhood = new List<Vector2Int>();
        for (int i = 0; i < incx.Length; i++)
        {
            var n = new Vector2Int(pos.x + incx[i], pos.y + incy[i]);
            if (floor.Contains(n) && !blocked.Contains(n))
            {
                neighborhood.Add(n);
            }
        }
        return neighborhood;
    }

    public float MoveCost(Vector2Int source, Vector2Int dest)
    {
        return Mathf.Max(Mathf.Abs(source.x - dest.x), Mathf.Abs(source.y - dest.y));
    }

    public bool isOpaque(Vector2Int pos)
    {
        return !floor.Contains(pos);
    }

    public DijkstraMap MakeDijkstraMap(HashSet<Vector2Int> grid)
    {
        return new DijkstraMap(grid, Neighborhood, MoveCost);
    }

    public void ApplyFieldOfView(Vector2Int center, int radius)
    {
		if(!proc.hasFog){
			return;
		}
		
        HashSet<Vector2Int> view = FieldOfView(center, radius);

        HashSet<Vector2Int> newRevealed = new HashSet<Vector2Int>(visible);
        newRevealed.ExceptWith(view);

        foreach (var pos in newRevealed)
        {
            var v = new Vector3Int(pos.x, pos.y, 0);
            var tilePosition = proc.fieldOfView.WorldToCell(v);
            proc.fieldOfView.SetTile(tilePosition, proc.revealedTile);
        }

        foreach (var pos in view)
        {
            var v = new Vector3Int(pos.x, pos.y, 0);
            var tilePosition = proc.fieldOfView.WorldToCell(v);
            proc.fieldOfView.SetTile(tilePosition, null);
        }
        revealed.UnionWith(view);
        visible = view;
    }

    public HashSet<Vector2Int> FieldOfView(Vector2Int center, int radius)
    {
        return FOV.Calculate(center, radius, isOpaque);
    }

    public bool TryMoveTo(Vector2Int current, Vector2Int destination)
    {
        if (floor.Contains(destination) && !blocked.Contains(destination))
        {
            blocked.Remove(current);
            blocked.Add(destination);
            return true;
        }
        return false;
    }

    void MakeEmptyMap()
    {
        proc.player.position = new Vector3(proc.center + 0.5f, proc.center + 0.5f, 0);
        for (int y = proc.center - proc.radius; y < proc.center + proc.radius; y++)
        {
            for (int x = proc.center - proc.radius; x < proc.center + proc.radius; x++)
            {
                floor.Add(new Vector2Int(x, y));
            }
        }
    }

    void MakeRandomWalkMap()
    {
        proc.player.position = new Vector3(proc.center + 0.5f, proc.center + 0.5f, 0);
        floor.Add(new Vector2Int(proc.center, proc.center));

        int length = 100;
        int iterations = 10;
        bool reset = false;
        Vector2Int pos = new Vector2Int(proc.center, proc.center);
        Vector2Int[] inc = new Vector2Int[4] { Vector2Int.left, Vector2Int.right, Vector2Int.up, Vector2Int.down };
        for (int r = 0; r < iterations; r++)
        {
            for (int i = 0; i < length; i++)
            {
                int index = Random.Range(0, inc.Length);
                pos += inc[index];
                floor.Add(pos);
            }
            if (reset)
            {
                pos = new Vector2Int(proc.center, proc.center);
            }
        }
    }

    void DetectWalls()
    {
        int[] incx = new int[8] { -1, -1, -1, +0, +0, +1, +1, +1 };
        int[] incy = new int[8] { -1, +0, +1, -1, +1, -1, +0, +1 };
        foreach (var pos in floor)
        {
            for (int i = 0; i < incx.Length; i++)
            {
                var wall = new Vector2Int(pos.x + incx[i], pos.y + incy[i]);
                if (!floor.Contains(wall))
                {
                    walls.Add(wall);
                }
            }
        }
    }

    void PaintFloor()
    {
        foreach (var pos in floor)
        {
            int index = Random.Range(0, proc.floorTile.Length);
            TileBase tile = proc.floorTile[index];
            PaintTile(pos.x, pos.y, tile);
        }
    }

    void PaintWalls()
    {
        foreach (var pos in walls)
        {
            int mask = 0;
            if (walls.Contains(new Vector2Int(pos.x, pos.y + 1))) { mask += 1; }
            if (walls.Contains(new Vector2Int(pos.x, pos.y - 1))) { mask += 2; }
            if (walls.Contains(new Vector2Int(pos.x - 1, pos.y))) { mask += 4; }
            if (walls.Contains(new Vector2Int(pos.x + 1, pos.y))) { mask += 8; }
            switch (mask)
            {
                case 0: PaintTile(pos.x, pos.y, proc.wallPillar); break;
                case 1: PaintTile(pos.x, pos.y, proc.wallNorth); break;
                case 2: PaintTile(pos.x, pos.y, proc.wallSouth); break;
                case 3: PaintTile(pos.x, pos.y, proc.wallNorthSouth); break;
                case 4: PaintTile(pos.x, pos.y, proc.wallWest); break;
                case 5: PaintTile(pos.x, pos.y, proc.wallNorthWest); break;
                case 6: PaintTile(pos.x, pos.y, proc.wallSouthWest); break;
                case 7: PaintTile(pos.x, pos.y, proc.wallNorthSouthWest); break;
                case 8: PaintTile(pos.x, pos.y, proc.wallEast); break;
                case 9: PaintTile(pos.x, pos.y, proc.wallNorthEast); break;
                case 10: PaintTile(pos.x, pos.y, proc.wallSouthEast); break;
                case 11: PaintTile(pos.x, pos.y, proc.wallNorthSouthEast); break;
                case 12: PaintTile(pos.x, pos.y, proc.wallEastWest); break;
                case 13: PaintTile(pos.x, pos.y, proc.wallEastWestNorth); break;
                case 14: PaintTile(pos.x, pos.y, proc.wallEastWestSouth); break;
                case 15: PaintTile(pos.x, pos.y, proc.wallAllSides); break;
            }
        }
    }

    void PaintTile(int x, int y, TileBase tile)
    {
        var pos = new Vector3Int(x, y, 0);
        var tilePosition = proc.tilemap.WorldToCell(pos);
        proc.tilemap.SetTile(tilePosition, tile);
		if(proc.hasFog){
        	proc.fieldOfView.SetTile(tilePosition, proc.hiddenTile);
		}
    }

    void Clear()
    {
        proc.tilemap.ClearAllTiles();
    }
}
