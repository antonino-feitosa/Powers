using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BH_Visible : StateBehaviourDecision
{
    public bool runInBackground = false;

    void Start(){
        var game = GameManager.instance;
        var entity = GetComponent<Entity>();
        gameObject.SetActive(game.IsVisibleAt(entity.position));
    }
    public override State Turn(Entity entity)
    {
        var game = GameManager.instance;
        if(game.IsVisibleAt(entity.position)){
            SetNormalFlow();
            gameObject.SetActive(true);
        } else {
            SetAlternativeFlow();
        }
        return State.Idle;
    }
}
