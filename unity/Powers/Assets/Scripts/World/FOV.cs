
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ComparePoints : IComparer<Vector2Int> {
	Vector2Int center;
	public ComparePoints(Vector2Int center){
		this.center = center;
	}

	public int Compare(Vector2Int a, Vector2Int b){
		float diff = Vector2Int.Distance(a, center) - Vector2Int.Distance(b, center);
		return diff == 0f ? 0 : (diff < 0 ? -1 : 1);
	}
}

public class FOV {
	
	public static HashSet<Vector2Int> Calculate(Vector2Int center, int radius, Func<Vector2Int,bool> opaque){
		Func<Vector2Int,float> dist = vet => Vector2Int.Distance(center, vet);
		return FOV.ShadowCast(center, radius, opaque, dist);
	}

	private static Func<Vector2Int,float> dist;
	private static Func<Vector2Int,bool> opaque;
	private static HashSet<Vector2Int> visible;

	public static HashSet<Vector2Int> ShadowCast(Vector2Int origin, int rangeLimit, Func<Vector2Int,bool> opaque, Func<Vector2Int,float> dist) {
		//http://www.adammil.net/blog/v125_roguelike_vision_algorithms.html#diamondcode
		FOV.visible = new HashSet<Vector2Int>();
		FOV.dist = dist;
		FOV.opaque = opaque;

		visible.Add(new Vector2Int(origin.x, origin.y));
		for(int octant=0; octant<8; octant++){
			int x = 1;
			Vector2Int top = new Vector2Int(1,1);
			Vector2Int bottom = new Vector2Int(1,0);
			ComputeShadowCast(octant, origin, rangeLimit, x, top, bottom);
		}
		return FOV.visible;
	}

	private static void ComputeShadowCast(int octant, Vector2Int origin, int rangeLimit, int x, Vector2Int top, Vector2Int bottom){
		for(; x <= rangeLimit; x++){ // rangeLimit < 0 || x <= rangeLimit
			
			// compute the Y coordinates where the top vector leaves the column (on the right) and where the bottom vector
			// enters the column (on the left). this equals (x+0.5)*top+0.5 and (x-0.5)*bottom+0.5 respectively, which can
			// be computed like (x+0.5)*top+0.5 = (2(x+0.5)*top+1)/2 = ((2x+1)*top+1)/2 to avoid floating point math
			int topY = top.x == 1 ? x : ((x*2+1) * top.y + top.x - 1) / (top.x*2); // the rounding is a bit tricky, though
			int bottomY = bottom.y == 0 ? 0 : ((x*2-1) * bottom.y + bottom.x) / (bottom.x*2);
				
			int wasOpaque = -1; // 0:false, 1:true, -1:not applicable
			for(int y=topY; y >= bottomY; y--){
				int tx = origin.x, ty = origin.y;
				switch(octant){ // translate local coordinates to map coordinates
					case 0: tx += x; ty -= y; break;
					case 1: tx += y; ty -= x; break;
					case 2: tx -= y; ty -= x; break;
					case 3: tx -= x; ty -= y; break;
					case 4: tx -= x; ty += y; break;
					case 5: tx -= y; ty += x; break;
					case 6: tx += y; ty += x; break;
					case 7: tx += x; ty += y; break;
				}

				Vector2Int pos = new Vector2Int(tx, ty);
				bool inRange = rangeLimit < 0 || dist(pos) <= rangeLimit;
				//if(inRange) visible.Add(new Vector2Int(tx, ty));
				// NOTE: use the next line instead if you want the algorithm to be symmetrical
				if(inRange && (y != topY || top.y*x >= top.x*y) && (y != bottomY || bottom.y*x <= bottom.x*y)) visible.Add(pos);

				bool isOpaque = !inRange || opaque(pos);
				if(x != rangeLimit){
					if(isOpaque) {
						if(wasOpaque == 0){ // if we found a transition from clear to opaque, this sector is done in this column, so
											// adjust the bottom vector upwards and continue processing it in the next column.
							Vector2Int newBottom = new Vector2Int(x*2-1, y*2+1); // (x*2-1, y*2+1) is a vector to the top-left of the opaque tile
							if(!inRange || y == bottomY) { bottom = newBottom; break; } // don't recurse unless we have to
							else ComputeShadowCast(octant, origin, rangeLimit, x+1, top, newBottom);
						}
						wasOpaque = 1;
					} else { // adjust top vector downwards and continue if we found a transition from opaque to clear
						// (x*2+1, y*2+1) is the top-right corner of the clear tile (i.e. the bottom-right of the opaque tile)
						if(wasOpaque > 0) top = new Vector2Int(x*2+1, y*2+1);
						wasOpaque = 0;
					}
				}
			}

			if(wasOpaque != 0) break; // if the column ended in a clear tile, continue processing the current sector
		}
	}

	public static HashSet<Vector2Int> CalculateNeighborhood(Vector2Int center, int radius, Func<Vector2Int,bool> opaque){
		HashSet<Vector2Int> visible = new HashSet<Vector2Int>();
		visible.Add(new Vector2Int(center.x -1, center.y -1));
		visible.Add(new Vector2Int(center.x -1, center.y +0));
		visible.Add(new Vector2Int(center.x -1, center.y +1));
		visible.Add(new Vector2Int(center.x +0, center.y -1));
		visible.Add(new Vector2Int(center.x +0, center.y +0));
		visible.Add(new Vector2Int(center.x +0, center.y +1));
		visible.Add(new Vector2Int(center.x +1, center.y -1));
		visible.Add(new Vector2Int(center.x +1, center.y +0));
		visible.Add(new Vector2Int(center.x +1, center.y +1));
		return visible;
	}
	
	public static HashSet<Vector2Int> CalculateQuad(Vector2Int center, int radius, Func<Vector2Int,bool> opaque){
		HashSet<Vector2Int> visible = new HashSet<Vector2Int>();
		ComparePoints cmp = new ComparePoints(center);
		for(int y=center.y-radius;y<center.y+radius;y++){
			for(int x=center.x-radius;x<center.x+radius;x++){
				var pos = new Vector2Int(x, y);
				HashSet<Vector2Int> line = FOV.Line(center, pos);
				List<Vector2Int> points = new List<Vector2Int>(line);
				points.Sort(cmp);
				foreach(var c in points){
					visible.Add(c);
					if(opaque(c)){break;}
				}
			}
		}
		return visible;
	}
	
	public static HashSet<Vector2Int> Line (Vector2Int start, Vector2Int end){
		if (Mathf.Abs(end.y - start.y) < Mathf.Abs(end.x - start.x)) {
			return start.x > end.x ? LineLow(end, start) : LineLow(start, end);
		} else {
			return start.y > end.y ? LineHigh(end, start) : LineHigh(start, end);
		}
	}
	
	private static HashSet<Vector2Int> LineLow (Vector2Int start, Vector2Int end){
		HashSet<Vector2Int> points = new HashSet<Vector2Int>();
		
        int dx = end.x - start.x;
        int dy = end.y - start.y;
        int yi = 1;
        if (dy < 0) {
            yi = -1;
            dy = -dy;
        }
        int D = (2 * dy) - dx;
        int y = start.y;

        for (int x = start.x; x < end.x; x++) {
			points.Add(new Vector2Int(x, y));
            if (D > 0) {
                y = y + yi;
                D = D + (2 * (dy - dx));
            } else {
                D = D + 2 * dy;
            }
        }
		return points;
	}
	
	private static HashSet<Vector2Int> LineHigh (Vector2Int start, Vector2Int end){
		HashSet<Vector2Int> points = new HashSet<Vector2Int>();
		
		int dx = end.x - start.x;
        int dy = end.y - start.y;
        int xi = 1;
        if (dx < 0) {
            xi = -1;
            dx = -dx;
        }
        int D = (2 * dx) - dy;
        int x = start.x;

        for (int y = start.y; y < end.y; y++) {
			points.Add(new Vector2Int(x, y));
            if (D > 0) {
                x = x + xi;
                D = D + (2 * (dx - dy));
            } else {
                D = D + 2 * dx;
            }
        }
		return points;
	}
	
	private static HashSet<Vector2Int> Circle(Vector2Int center, int radius){
		HashSet<Vector2Int> points = new HashSet<Vector2Int>();
		
		// Mid-Point Circle Drawing Algorithm
		int x = radius, y = 0;

		if (radius == 0) { // When radius is zero only a single point will be printed
			points.Add(new Vector2Int(center.x, center.y));
		} else {
			points.Add(new Vector2Int(center.x - radius, center.y + 0));
			points.Add(new Vector2Int(center.x + radius, center.y + 0));
			
			points.Add(new Vector2Int(center.x - 0, center.y - radius));
			points.Add(new Vector2Int(center.x + 0, center.y + radius));
		}

		// Initialising the value of P
		int P = 1 - radius;
		while (x > y) {
			y++;
			if (P <= 0) {// Mid-point is inside or on the perimeter
				P = P + 2 * y + 1;
			} else { // Mid-point is outside the perimeter
				x--;
				P = P + 2 * y - 2 * x + 1;
			}

			// All the perimeter points have already been printed
			if (x < y) break;

			// Printing the generated point and its reflection in the other octants after translation
			points.Add(new Vector2Int(center.x + x, center.y + y));
			points.Add(new Vector2Int(center.x - x, center.y + y));
			points.Add(new Vector2Int(center.x + x, center.y - y));
			points.Add(new Vector2Int(center.x - x, center.y - y));

			// If the generated point is on the line x = y then the perimeter points have already been printed
			if (x != y) {
				points.Add(new Vector2Int(center.x + y, center.y + x));
				points.Add(new Vector2Int(center.x - y, center.y + x));
				points.Add(new Vector2Int(center.x + y, center.y - x));
				points.Add(new Vector2Int(center.x - y, center.y - x));	
			}
		}
		return points;
	}
}
