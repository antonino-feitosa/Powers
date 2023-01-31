using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public abstract class StateBehaviourDecision : StateBehaviour
{
    public StateBehaviour alternative;
    [HideInInspector]
    public StateBehaviour normal;

    void Awake(){
        normal = next;
    }

    protected void SetNormalFlow(){
        next = normal;
    }

    protected void SetAlternativeFlow(){
        next = alternative;
    }
}
