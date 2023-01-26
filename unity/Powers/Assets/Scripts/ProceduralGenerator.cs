using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Tilemaps;
using Random = UnityEngine.Random;

public class ProceduralGenerator : MonoBehaviour {

	public int seed = 0;    
    public int center = 0;
    public int radius = 5;
	
    public Tilemap tilemap;
	public Tilemap fieldOfView;
	public Transform player;
	
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
