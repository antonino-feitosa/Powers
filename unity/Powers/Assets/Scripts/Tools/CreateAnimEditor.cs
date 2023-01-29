using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;

[CustomEditor(typeof(CreateAnim))]
public class CreateAnimEditor : Editor
{
    private CreateAnim createAnim;
    private void Awake()
    {
        createAnim = (CreateAnim) target;
    }

    public override void OnInspectorGUI()
    {
        if(GUILayout.Button("Create Anim")){
            createAnim.Create();
        }
        base.OnInspectorGUI();
    }
}
