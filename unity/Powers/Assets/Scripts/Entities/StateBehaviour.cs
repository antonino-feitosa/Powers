using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public abstract class StateBehaviour : MonoBehaviour
{
    public enum State {Idle, Running};
    public StateBehaviour next;
    public abstract State Turn(Entity entity, int turn);
}
