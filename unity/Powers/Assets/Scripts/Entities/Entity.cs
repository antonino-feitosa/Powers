using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Entity : MonoBehaviour
{
    public StateBehaviour behaviour;

    public bool isBlock = false;
    public bool isDead = false;
    public bool isEndOfTurn = false;

    [HideInInspector]
    public Vector2Int position;


    public void DoProcess(){
        StateBehaviour current = behaviour;
        while(current != null && current.Turn(this) == StateBehaviour.State.Idle){
            current = current.next;
        }
    }

    public Type GetBehaviour<Type>(){
        StateBehaviour current = behaviour;
        while(current != null){
            if(current is Type behaviour){
                return behaviour;
            }
            current = current.next;
        }
        return default(Type);
    }
}
