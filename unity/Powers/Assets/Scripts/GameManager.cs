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
        public LinkedList<Entity> turn = new LinkedList<Entity>();
        public Dictionary<Vector2Int, List<Entity>> positionToEntity = new Dictionary<Vector2Int, List<Entity>>();

        public bool HasEntityAt(Vector2Int position)
        {
            if (positionToEntity.ContainsKey(position))
                return true;
            if (stairsUp == position)
                return true;
            if (stairsDown == position)
                return true;
            if (player == position)
                return true;
            return false;
        }

        public void AddEntities(float frequency, StateBehaviourPositionCondition[] entities)
        {
            int numFloors = floor.Count;
            int length = (int)(numFloors * frequency);
            List<Vector2Int> list = new List<Vector2Int>(floor);
            for (int i = 0; i < length; i++)
            {
                var model = entities[Random.Range(0, entities.Length)];
                for (int j = 0; j < 10; j++)
                {
                    var pos = list[Random.Range(0, list.Count)];
                    if (!HasEntityAt(pos) && model.AcceptPosition(pos, this))
                    {
                        if (!positionToEntity.ContainsKey(pos))
                            positionToEntity.Add(pos, new List<Entity>());
                        var entityObject = Instantiate(model.gameObject, ToVector3(pos), Quaternion.identity);
                        var entity = entityObject.GetComponent<Entity>();
                        entity.gameObject.name += " Lv(" + level + ") #" + i;
                        entity.gameObject.SetActive(false);
                        positionToEntity[pos].Add(entity);
                        break;
                    }
                }
            }
        }
    }

    public static GameManager instance;
    public int currentLevel = 0;
    public int maxLevel = 100;
    public int countTurn = 0;
    public List<Level> levels = new List<Level>();

    public Level level { get { return levels[currentLevel]; } }

    public ProceduralGeneratorParameters proc;
    public BH_PlayerControler player;
    public ProceduralMap[] maps;
    private AudioSource audioSource;

    void OnGUI()
    {
        GUI.color = Color.green;
        if (player)
        {
            var unit = player.GetComponent<BH_Unit>();
            GUI.Label(new Rect(10, 10, 300, 20), "Health Points: " + unit.hp + "/10    Turn: " + countTurn);
        }
        else
        {
            GUI.Label(new Rect(10, 10, 200, 20), "You died!");
        }
    }

    private object Monitor = new object();
    void Awake()
    {
        Random.InitState(proc.seed);
        instance = this;
        audioSource = GetComponent<AudioSource>();
        audioSource.Play();
        NewLevel(currentLevel);
        player.transform.position = ToVector3(level.player);
        proc.cameraPosition.position = new Vector3(player.transform.position.x, player.transform.position.y, proc.cameraPosition.position.z);
        ChangeMap(currentLevel);
    }

    void Update()
    {
        Entity current = level.turn.First.Value;
        current.DoProcess(countTurn);
        if (current.isDead)
        {
            Vector2Int position = ToVector2Int(current.transform.position);
            level.positionToEntity[position].Remove(current);
            level.turn.RemoveFirst();
            if (current.GetBehaviour<BH_PlayerControler>())
            {
                player = null; // game over
            }
            Destroy(current.gameObject);
        }
        else if (current.isEndOfTurn)
        {
            if (current.GetBehaviour<BH_PlayerControler>()) countTurn++;
            //Debug.Log("End Of Turn: " + current);
            current.isEndOfTurn = false;
            level.turn.RemoveFirst();
            level.turn.AddLast(current);
            //Debug.Log("\t\t\t\t\t\tNext Turn: " + level.turn.First.Value);
        }
    }

    public void LevelForward()
    {
        int nextLevel = level.level + 1;
        if (nextLevel >= levels.Count)
        {
            NewLevel(nextLevel);
        }
        ChangeMap(nextLevel);
    }

    public void LevelBackward()
    {
        int nextLevel = level.level - 1;
        if (nextLevel < 0)
        {
            Debug.LogError("You cannot ascend to a negative level!");
            return;
        }
        ChangeMap(nextLevel);
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
        level.turn.AddFirst(player.GetComponent<Entity>());
        level.positionToEntity.Add(level.player, new List<Entity> { player.GetComponent<Entity>() });
        level.AddEntities(proc.frequencyTraps, proc.traps);
        level.AddEntities(proc.frequencyEnemies, proc.enemies);
        levels.Add(level);
        return level;
    }

    public void ChangeMap(int nextLevel)
    {
        level.player = ToVector2Int(player.transform.position);
        foreach (Entity ent in level.turn)
        {
            ent.gameObject.SetActive(false);
            //Debug.Log("Deactive " + ent.gameObject.name + " " + ent.gameObject.activeSelf);
        }
        level.turn.Clear();

        currentLevel = nextLevel;

        player.transform.position = ToVector3(level.player);
        player.GetComponent<Entity>().position = level.player;
        player.gameObject.SetActive(true);
        proc.cameraPosition.position = new Vector3(player.transform.position.x, player.transform.position.y, proc.cameraPosition.position.z);
        
        Clear();
        DetectWalls();
        PaintFloor();
        PaintWalls();
        ApplyFieldOfView(level.player, player.radius);
    }

    public void ApplyFieldOfView(Vector2Int center, int radius)
    {
        HashSet<Vector2Int> view = FieldOfView(center, radius);
        player.map = MakeDijkstraMap(view);
        player.map.AddAttractionPoint(center);
        player.map.Calculate();

        var current = level.turn.First;
        while(current != null){
            var ent = current.Value;
            if(!view.Contains(ent.position)){
                ent.gameObject.SetActive(false);
                level.turn.Remove(current);
            }
            current = current.Next;
        }

        foreach (var pos in view)
        {
            if (level.positionToEntity.ContainsKey(pos))
            {
                foreach (var ent in level.positionToEntity[pos])
                {
                    if (!level.turn.Contains(ent))
                    {
                        ent.gameObject.SetActive(true);
                        level.turn.AddLast(ent);
                    }
                }
            }
        }

        HashSet<Vector2Int> newRevealed = new HashSet<Vector2Int>(level.visible);
        newRevealed.ExceptWith(view);

        if (proc.hasFog)
        {
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
        }
        level.visible = view;
    }

    public bool IsFreePosition(Vector2Int position)
    {
        bool isFree = level.floor.Contains(position);
        if (isFree && level.positionToEntity.ContainsKey(position))
        {
            isFree = !level.positionToEntity[position].Find(ent => ent.isBlock);
        }
        return isFree;
    }

    public bool TryMoveTo(Entity entity, Vector2Int current, Vector2Int destination)
    {
        if (IsFreePosition(destination))
        {
            entity.position = destination;
            level.positionToEntity[current].Remove(entity);
            if (level.positionToEntity[current].Count == 0)
                level.positionToEntity.Remove(current);
            if (!level.positionToEntity.ContainsKey(destination))
                level.positionToEntity.Add(destination, new List<Entity>());
            level.positionToEntity[destination].Add(entity);
            return true;
        }
        return false;
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

    public bool HasPlayer()
    {
        return player != null;
    }

    public Vector2Int GetPlayerPosition()
    {
        return player.GetComponent<Entity>().position;
    }

    public List<Vector2Int> Neighborhood(Vector2Int pos)
    {
        List<Vector2Int> neighborhood = new List<Vector2Int>();
        foreach (var p in Entity.Directions)
        {
            var n = pos + p;
            if (IsFreePosition(n) && IsVisibleAt(n))
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

    public HashSet<Vector2Int> FieldOfView(Vector2Int center, int radius)
    {
        return FOV.Calculate(center, radius, isOpaque);
    }

    void DetectWalls()
    {
        foreach (var pos in level.floor)
        {
            foreach (var d in Entity.Directions)
            {
                var wall = pos + d;
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
