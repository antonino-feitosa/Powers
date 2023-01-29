using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Tilemaps;
using Random = UnityEngine.Random;

public class GameManager : MonoBehaviour
{
    public class Level
    {
        public int level = 1;
        public Vector2Int player;
        public Vector2Int stairsUp;
        public Vector2Int stairsDown;
        public HashSet<Vector2Int> floor = new HashSet<Vector2Int>();
        public HashSet<Vector2Int> walls = new HashSet<Vector2Int>();
        public HashSet<Vector2Int> visible = new HashSet<Vector2Int>();
        public HashSet<Vector2Int> revealed = new HashSet<Vector2Int>();
        public LinkedList<Moveable> turn = new LinkedList<Moveable>();
        public Dictionary<Vector2Int, List<Moveable>> positionToEntity = new Dictionary<Vector2Int, List<Moveable>>();
    }

    public static GameManager instance;
    public int currentLevel = 0;
    public int maxLevel = 100;
    public List<Level> levels = new List<Level>();

    public Level level { get { return levels[currentLevel]; } }

    public ProceduralGeneratorParameters proc;
    public PlayerControler player;
    public ProceduralMap[] maps;
    
    private object Monitor = new object();
    void Awake()
    {
        Random.InitState(proc.seed);
        instance = this;
        NewLevel(currentLevel);
        proc.player.position = ToVector3(level.player);
        proc.cameraPosition.position = new Vector3(proc.player.position.x, proc.player.position.y, proc.cameraPosition.position.z);
        ChangeMap(currentLevel);
    }

    public void NextTurn()
    {
        lock (Monitor)
        {
            Moveable current = level.turn.First.Value;
            level.turn.RemoveFirst();
            level.turn.AddLast(current);
        }
    }

    void Update()
    {
        lock (Monitor)
        {
            Moveable current = level.turn.First.Value;
            while (!current.Turn())
            {
                if (current.isDead)
                {
                    Vector2Int position = new Vector2Int((int)current.transform.position.x, (int)current.transform.position.y);
                    level.positionToEntity[position].Remove(current);
                    level.turn.RemoveFirst();
                    Destroy(current);
                    current = level.turn.First.Value;
                }
                else
                {
                    level.turn.RemoveFirst();
                    level.turn.AddLast(current);
                    current = level.turn.First.Value;
                }
            }
        }
    }

    public void LevelForward()
    {
        lock (Monitor)
        {
            int nextLevel = level.level + 1;
            if (nextLevel >= levels.Count)
            {
                NewLevel(nextLevel);
            }
            ChangeMap(nextLevel);
        }
    }

    public void LevelBackward()
    {
        lock (Monitor)
        {
            int nextLevel = level.level - 1;
            if (nextLevel < 0)
            {
                Debug.Log("You cannot ascend to a negative level!");
                return;
            }
            ChangeMap(nextLevel);
        }
    }

    public Level NewLevel(int nv)
    {
        Level level = new Level();
        level.level = nv;
        int index = Random.Range(0, maps.Length);
        var map = maps[index];
        map.Generate();
        level.floor = map.floor;
        level.player = map.stairsUp;
        level.stairsUp = map.stairsUp;
        level.stairsDown = map.stairsDown;
        level.turn.AddFirst(player);
        Debug.Log("Player Position" + level.player.ToString());
        level.positionToEntity.Add(level.player, new List<Moveable> { player });
        levels.Add(level);
        AddTraps(level);
        return level;
    }

    public void ChangeMap(int nextLevel)
    {
        level.player = ToVector2Int(proc.player.position);
        foreach (Moveable ent in level.turn)
        {
            ent.gameObject.SetActive(false);
            Debug.Log("Deactive " + ent.gameObject.name + " " + ent.gameObject.activeSelf);
        }

        currentLevel = nextLevel;

        proc.player.position = ToVector3(level.player);
        proc.cameraPosition.position = new Vector3(proc.player.position.x, proc.player.position.y, proc.cameraPosition.position.z);
        foreach (Moveable ent in level.turn)
        {
            ent.gameObject.SetActive(true);
            Debug.Log("Active " + ent.gameObject.name + " " + ent.gameObject.activeSelf);
        }
        Clear();
        DetectWalls();
        PaintFloor();
        PaintWalls();
        if (proc.hasFog)
        {
            ApplyFieldOfView(level.player, player.radius);
        }
    }

    public bool IsFreePosition(Vector2Int position)
    {
        bool isFree = level.floor.Contains(position);
        if (isFree && level.positionToEntity.ContainsKey(position))
        {
            isFree = !level.positionToEntity[position].Find(ent => ent.block);
        }
        return isFree;
    }

    public bool TryMoveTo(Moveable entity, Vector2Int current, Vector2Int destination)
    {
        lock (Monitor)
        {
            if (IsFreePosition(destination))
            {
                Debug.Log("Current Position" + current.ToString());
                level.positionToEntity[current].Remove(entity);
                if (level.positionToEntity[current].Count == 0)
                    level.positionToEntity.Remove(current);
                if (!level.positionToEntity.ContainsKey(destination))
                    level.positionToEntity.Add(destination, new List<Moveable>());
                level.positionToEntity[destination].Add(entity);
                return true;
            }
            return false;
        }
    }

    protected void AddTraps(Level level)
    {
        int numFloors = level.floor.Count;
        int numTraps = Mathf.Max((int)(numFloors * proc.trapFrequency), 1);
        List<Vector2Int> list = new List<Vector2Int>(level.floor);
        for (int i = 0; i < numTraps; i++)
        {
            var model = proc.traps[Random.Range(0, proc.traps.Length)];
            for (int j = 0; j < 10; j++)
            {
                var pos = list[Random.Range(0, list.Count)];
                if (model.AcceptPosition(pos))
                {
                    if (!level.positionToEntity.ContainsKey(pos))
                        level.positionToEntity.Add(pos, new List<Moveable>());
                    var trap = Instantiate(model.gameObject).GetComponent<TriggerTrap>();
                    trap.gameObject.name = "Trap " + level.level + " " + i;
                    level.positionToEntity[pos].Add(trap);
                    level.turn.AddLast(trap);
                    break;
                }
            }
        }
    }


    public bool IsVisibleAt(Vector2Int position)
    {
        return !proc.hasFog || level.visible.Contains(position);
    }

    public bool IsUpStairs(Vector2Int pos)
    {
        return level.level > 0 && pos == level.stairsUp;
    }

    public bool IsDownStairs(Vector2Int pos)
    {
        return level.level < maxLevel && pos == level.stairsDown;
    }

    public static Vector2Int ToVector2Int(Vector3 vec)
    {
        return new Vector2Int((int)(vec.x), (int)(vec.y));
    }
    public static Vector3 ToVector3(Vector2Int vec)
    {
        return new Vector3(vec.x, vec.y);
    }

    public bool HasEntityAt(Vector2Int position)
    {
        if (level.positionToEntity.ContainsKey(position))
            return true;
        if (level.stairsUp == position)
            return true;
        if (level.stairsDown == position)
            return true;
        if (level.player == position)
            return true;
        return false;
    }

    public List<Vector2Int> Neighborhood(Vector2Int pos)
    {
        int[] incx = new int[8] { -1, -1, -1, +0, +0, +1, +1, +1 };
        int[] incy = new int[8] { -1, +0, +1, -1, +1, -1, +0, +1 };
        List<Vector2Int> neighborhood = new List<Vector2Int>();
        for (int i = 0; i < incx.Length; i++)
        {
            var n = new Vector2Int(pos.x + incx[i], pos.y + incy[i]);
            if (IsFreePosition(n))
            {
                neighborhood.Add(n);
            }
        }
        return neighborhood;
    }

    public void DebugDijkstraMap(DijkstraMap map)
    {
        foreach (var entry in map.distance)
        {
            Vector3 pos = proc.tilemap.WorldToCell(new Vector3(entry.Key.x, entry.Key.y));
            GUI.color = pos.x == 0 && pos.y == 0 ? Color.red : Color.black;
            GUI.Label(new Rect(320 + pos.x * 32, 640 - (320 + pos.y * 32), 100, 100), entry.Value.ToString("0.0"));
        }
    }

    public float MoveCost(Vector2Int source, Vector2Int dest)
    {
        return Vector2.Distance(source, dest);
    }

    public bool isOpaque(Vector2Int pos)
    {
        return !level.floor.Contains(pos);
    }

    public DijkstraMap MakeDijkstraMap(HashSet<Vector2Int> grid)
    {
        return new DijkstraMap(grid, Neighborhood, MoveCost);
    }

    public void ApplyFieldOfView(Vector2Int center, int radius)
    {
        if (!proc.hasFog)
        {
            return;
        }

        HashSet<Vector2Int> view = FieldOfView(center, radius);

        HashSet<Vector2Int> newRevealed = new HashSet<Vector2Int>(level.visible);
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
        level.revealed.UnionWith(view);
        level.visible = view;
    }

    public HashSet<Vector2Int> FieldOfView(Vector2Int center, int radius)
    {
        return FOV.Calculate(center, radius, isOpaque);
    }

    void DetectWalls()
    {
        int[] incx = new int[8] { -1, -1, -1, +0, +0, +1, +1, +1 };
        int[] incy = new int[8] { -1, +0, +1, -1, +1, -1, +0, +1 };
        foreach (var pos in level.floor)
        {
            for (int i = 0; i < incx.Length; i++)
            {
                var wall = new Vector2Int(pos.x + incx[i], pos.y + incy[i]);
                if (!level.floor.Contains(wall))
                {
                    level.walls.Add(wall);
                }
            }
        }
    }

    void PaintFloor()
    {
        foreach (var pos in level.floor)
        {
            int index = Random.Range(0, proc.floorTile.Length);
            TileBase tile = proc.floorTile[index];
            PaintTile(pos, tile);
        }
        if (level.level < maxLevel)
            PaintTile(level.stairsDown, proc.stairsDown);
        if (level.level > 0)
            PaintTile(level.stairsUp, proc.stairsUp);
    }

    void PaintWalls()
    {
        foreach (var pos in level.walls)
        {
            int mask = 0;
            if (level.walls.Contains(new Vector2Int(pos.x, pos.y + 1))) { mask += 1; }
            if (level.walls.Contains(new Vector2Int(pos.x, pos.y - 1))) { mask += 2; }
            if (level.walls.Contains(new Vector2Int(pos.x - 1, pos.y))) { mask += 4; }
            if (level.walls.Contains(new Vector2Int(pos.x + 1, pos.y))) { mask += 8; }
            switch (mask)
            {
                case 0: PaintTile(pos, proc.wallPillar); break;
                case 1: PaintTile(pos, proc.wallNorth); break;
                case 2: PaintTile(pos, proc.wallSouth); break;
                case 3: PaintTile(pos, proc.wallNorthSouth); break;
                case 4: PaintTile(pos, proc.wallWest); break;
                case 5: PaintTile(pos, proc.wallNorthWest); break;
                case 6: PaintTile(pos, proc.wallSouthWest); break;
                case 7: PaintTile(pos, proc.wallNorthSouthWest); break;
                case 8: PaintTile(pos, proc.wallEast); break;
                case 9: PaintTile(pos, proc.wallNorthEast); break;
                case 10: PaintTile(pos, proc.wallSouthEast); break;
                case 11: PaintTile(pos, proc.wallNorthSouthEast); break;
                case 12: PaintTile(pos, proc.wallEastWest); break;
                case 13: PaintTile(pos, proc.wallEastWestNorth); break;
                case 14: PaintTile(pos, proc.wallEastWestSouth); break;
                case 15: PaintTile(pos, proc.wallAllSides); break;
            }
        }
    }

    void PaintTile(Vector2Int p, TileBase tile)
    {
        var pos = ToVector3(p);
        var tilePosition = proc.tilemap.WorldToCell(pos);
        proc.tilemap.SetTile(tilePosition, tile);
        if (proc.hasFog)
        {
            proc.fieldOfView.SetTile(tilePosition, proc.hiddenTile);
        }
    }

    void Clear()
    {
        proc.fieldOfView.ClearAllTiles();
        proc.tilemap.ClearAllTiles();
    }
}
