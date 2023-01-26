using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerControler : MonoBehaviour{
	
	private static Dictionary<KeyCode,Vector3> mapKeys;
	private static Dictionary<Vector3,string> mapAnim;
	
	static PlayerControler(){
		mapKeys = new Dictionary<KeyCode,Vector3>();
		mapKeys.Add(KeyCode.L, new Vector3(+1,+0,0));
		mapKeys.Add(KeyCode.H, new Vector3(-1,+0,0));
		mapKeys.Add(KeyCode.K, new Vector3(+0,+1,0));
		mapKeys.Add(KeyCode.J, new Vector3(+0,-1,0));
		mapKeys.Add(KeyCode.Y, new Vector3(-1,+1,0));
		mapKeys.Add(KeyCode.U, new Vector3(+1,+1,0));
		mapKeys.Add(KeyCode.B, new Vector3(-1,-1,0));
		mapKeys.Add(KeyCode.N, new Vector3(+1,-1,0));
		
		mapAnim = new Dictionary<Vector3,string>();
		mapAnim.Add(new Vector3(+1,+0,0), "Right");
		mapAnim.Add(new Vector3(-1,+0,0), "Left");
		mapAnim.Add(new Vector3(+0,+1,0), "Up");
		mapAnim.Add(new Vector3(+0,-1,0), "Down");
		mapAnim.Add(new Vector3(-1,+1,0), "UpLeft");
		mapAnim.Add(new Vector3(+1,+1,0), "UpRight");
		mapAnim.Add(new Vector3(-1,-1,0), "DownLeft");
		mapAnim.Add(new Vector3(+1,-1,0), "DownRight");
	}
	
	private enum State {Idle, Moving};

    public float moveSpeed = 5f;

	public int radius = 5;
	
	private State state = State.Idle;
	
	private Animator anim;
	
	
    void Start(){
		anim = GetComponent<Animator>();
		var game = GameManager.instance;
		Vector2Int pos = new Vector2Int((int)transform.position.x, (int)transform.position.y);
		game.ApplyFieldOfView(pos, radius);
    }

    void Update(){
		if(state == State.Moving){
			return;
		}
		
		foreach(KeyValuePair<KeyCode, Vector3> kvp in mapKeys){
			if(Input.GetKeyDown(kvp.Key)){
				Vector3 dir = kvp.Value;
				TryMoveTo(dir);
				break;
			}
		}
    }
	
	protected void TryMoveTo(Vector3 dir){
		Vector3 destination = dir + transform.position;
		
		Vector2Int origin = new Vector2Int((int)transform.position.x, (int)transform.position.y);
		Vector2Int dest = new Vector2Int((int)(destination.x - 0.5), (int)(destination.y - 0.5));
		
		var game = GameManager.instance;
		if(game.TryMoveTo(origin, dest)){
			state = State.Moving;
			game.ApplyFieldOfView(dest, radius);
			anim.Play("Walk " + mapAnim[dir], 0);
			StartCoroutine(SmoothMovement(dir));
		}
	}

    protected IEnumerator SmoothMovement(Vector3 dir){
		Vector3 destination = dir + transform.position;
        while(Vector3.Distance(transform.position, destination) > 0.05f){
            transform.position = Vector3.MoveTowards(transform.position, destination, moveSpeed * Time.deltaTime);
            yield return null;
        }
        transform.position = destination;
		anim.Play("Idle " + mapAnim[dir], 0);
		state = State.Idle;
    }
}
