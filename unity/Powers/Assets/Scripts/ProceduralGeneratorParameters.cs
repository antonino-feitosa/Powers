using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Tilemaps;

public class ProceduralGeneratorParameters : MonoBehaviour {

	public int seed = 0;
    public int radius = 5;
	public bool hasFog = true;
	public Vector2Int center = Vector2Int.zero;
	
    public Tilemap tilemap;
	public Tilemap fieldOfView;
	public Transform cameraPosition;
	public float frequencyTraps = 0.1f;
	public BH_Trap [] traps;
	
	public float frequencyEnemies = 0.1f;
	public BH_Enemy [] enemies;
	
	
	public TileBase stairsUp;
	public TileBase stairsDown;
	public TileBase hiddenTile;
	public TileBase revealedTile;
    public TileBase[] floorTile;
	
	public TileBase wallPillar;
	public TileBase wallNorth;
	public TileBase wallSouth;
	public TileBase wallNorthSouth;
	public TileBase wallWest;
	public TileBase wallNorthWest;
	public TileBase wallSouthWest;
	public TileBase wallNorthSouthWest;
	public TileBase wallEast;
	public TileBase wallNorthEast;
	public TileBase wallSouthEast;
	public TileBase wallNorthSouthEast;
	public TileBase wallEastWest;
	public TileBase wallEastWestSouth;
	public TileBase wallEastWestNorth;
	public TileBase wallAllSides;
}
