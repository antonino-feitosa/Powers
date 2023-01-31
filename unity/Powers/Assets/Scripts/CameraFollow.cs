using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraFollow : MonoBehaviour
{

    public Transform target;

    public float smoothSpeed = 0.125f;

    private Vector3 velocity = Vector3.zero;

    void LateUpdate()
    {
        if (GameManager.instance.HasPlayer())
        {
            Vector3 destination = target.position;
            destination.z = transform.position.z;
            Vector3 update = Vector3.SmoothDamp(transform.position, destination, ref velocity, smoothSpeed);
            transform.position = update;
        }
    }
}
