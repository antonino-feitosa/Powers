
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEditor;
using UnityEditor.Animations;
using UnityEngine;

public class CreateAnim : MonoBehaviour
{
    public AnimatorController controller;
    public string prefix;
    public Sprite[] sprites;

    private static readonly string[] NAMES = new string[]{
        "Idle Right",
        "Idle UpRight",
        "Idle Down",
        "Idle DownRight",
        "Idle Left",
        "Idle DownLeft",
        "Idle Up",
        "Idle UpLeft",
        "Walk Right",
        "Walk UpRight",
        "Walk Down",
        "Walk DownRight",
        "Walk Left",
        "Walk DownLeft",
        "Walk Up",
        "Walk UpLeft"
    };

    public void Create()
    {
        if (sprites.Length < NAMES.Length * 4)
        {
            Debug.Log("The number of sprites is insufficient!");
        }
        else
        {
            for (int i = 0; i < NAMES.Length; i++)
            {
                var dest = new Sprite[4];
                Array.Copy(sprites, i, dest, 0, 4);
                var anim = CreateAnimation(prefix, NAMES[i], dest);
                anim.name = NAMES[i];
                controller.AddMotion(anim);
            }
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
        }
    }

    protected AnimationClip CreateAnimation(string prefix, string name, Sprite[] sprites)
    {
        AnimationClip animClip = new AnimationClip();
        animClip.name = name;
        animClip.frameRate = 12;   // FPS
        animClip.wrapMode = WrapMode.Loop;

        EditorCurveBinding spriteBinding = new EditorCurveBinding();
        spriteBinding.type = typeof(SpriteRenderer);
        spriteBinding.path = "";
        spriteBinding.propertyName = "m_Sprite";

        ObjectReferenceKeyframe[] spriteKeyFrames = new ObjectReferenceKeyframe[sprites.Length];
        for (int i = 0; i < (sprites.Length); i++)
        {
            spriteKeyFrames[i] = new ObjectReferenceKeyframe();
            spriteKeyFrames[i].time = i;
            spriteKeyFrames[i].value = sprites[i];
        }
        AnimationUtility.SetObjectReferenceCurve(animClip, spriteBinding, spriteKeyFrames);

        AssetDatabase.CreateAsset(animClip, "assets/Animations/" + prefix + " " + name + ".anim");
        return animClip;
    }
}