using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Tilemaps;

public class GameManager : MonoBehaviour {
    
	public static GameManager instance;
	
	public int level = 1;
	public HashSet<Vector2Int> floor;
	public HashSet<Vector2Int> walls;
	public ProceduralGenerator proc;
	
	void Awake(){
		instance = this;
		floor = new HashSet<Vector2Int>();
		
		MakeRandomWalkMap();
		DetectWalls();
		PaintFloor();
		PaintWalls();
	}
	
	void MakeEmptyMap(){
		proc.player.position = new Vector3(proc.center, proc.center, 0);
		for (int y = proc.center - proc.radius; y < proc.center + proc.radius; y++){
            for (int x = proc.center - proc.radius; x < proc.center + proc.radius; x++){
                floor.Add(new Vector2Int(x, y));
            }
        }
	}
	
	void MakeRandomWalkMap(){
		proc.player.position = new Vector3(proc.center, proc.center, 0);
		floor.Add(new Vector2Int(proc.center, proc.center));
		
		int length = 100;
		int iterations = 10;
		bool reset = false;
		Vector2Int pos = new Vector2Int(proc.center, proc.center);
		Vector2Int [] inc = new Vector2Int[4] {Vector2Int.left,Vector2Int.right,Vector2Int.up,Vector2Int.down};
		for(int r=0;r<iterations;r++){
			for(int i=0;i<length;i++){
				int index = Random.Range(0, inc.Length);
				pos += inc[index];
				floor.Add(pos);
			}
			if(reset){
				pos = new Vector2Int(proc.center, proc.center);
			}
		}
	}
	
	void DetectWalls(){
		int [] incx = new int[8]{-1, -1, -1, +0, +0, +1, +1, +1};
		int [] incy = new int[8]{-1, +0, +1, -1, +1, -1, +0, +1};
		walls = new HashSet<Vector2Int>();
		foreach(var pos in floor){
			for(int i=0;i<incx.Length;i++){
				var wall = new Vector2Int(pos.x + incx[i], pos.y + incy[i]);
				if(!floor.Contains(wall)){
					walls.Add(wall);
				}
			}
		}
	}
	
	void PaintFloor(){
		foreach(var pos in floor){
			int index = Random.Range(0, proc.floorTile.Length);
			TileBase tile = proc.floorTile[index];
			PaintTile(pos.x, pos.y, tile);
		}
	}
	
	void PaintWalls(){
		foreach(var pos in walls){
			int mask = 0;
			if(walls.Contains(new Vector2Int(pos.x, pos.y + 1))){ mask += 1; }
			if(walls.Contains(new Vector2Int(pos.x, pos.y - 1))){ mask += 2; }
			if(walls.Contains(new Vector2Int(pos.x - 1, pos.y))){ mask += 4; }
			if(walls.Contains(new Vector2Int(pos.x + 1, pos.y))){ mask += 8; }
			switch(mask){
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
	
	void PaintTile(int x, int y, TileBase tile){
		var pos = new Vector3Int(x, y, 0);
        var tilePosition = proc.tilemap.WorldToCell(pos);
        proc.tilemap.SetTile(tilePosition, tile);
    }

    void Clear(){
        proc.tilemap.ClearAllTiles();
    }
}
