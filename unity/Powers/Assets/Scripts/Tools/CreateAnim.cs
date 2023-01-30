
using System.Linq;
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
    public string path = "assets/Animations/Anim/";
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

        "Rest Right",
        "Rest UpRight",
        "Rest Down",
        "Rest DownRight",
        "Rest Left",
        "Rest DownLeft",
        "Rest Up",
        "Rest UpLeft",

        "Walk Right",
        "Walk UpRight",
        "Walk Down",
        "Walk DownRight",
        "Walk Left",
        "Walk DownLeft",
        "Walk Up",
        "Walk UpLeft",

        "Run Right",
        "Run UpRight",
        "Run Down",
        "Run DownRight",
        "Run Left",
        "Run DownLeft",
        "Run Up",
        "Run UpLeft",

        "Hurt Right",
        "Hurt UpRight",
        "Hurt Down",
        "Hurt DownRight",
        "Hurt Left",
        "Hurt DownLeft",
        "Hurt Up",
        "Hurt UpLeft",

        "Dead Right",
        "Dead UpRight",
        "Dead Down",
        "Dead DownRight",
        "Dead Left",
        "Dead DownLeft",
        "Dead Up",
        "Dead UpLeft",

        "Fade Right",
        "Fade UpRight",
        "Fade Down",
        "Fade DownRight",
        "Fade Left",
        "Fade DownLeft",
        "Fade Up",
        "Fade UpLeft"
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
                Array.Copy(sprites, i * 4, dest, 0, 4);
                var anim = CreateAnimation(prefix, NAMES[i], 12, !NAMES[i].StartsWith("Hurt"), dest);
                anim.name = NAMES[i];
                controller.AddMotion(anim);
            }
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
        }
    }

    protected AnimationClip CreateAnimation(string prefix, string name, float frameRate, bool isLooping, Sprite[] sprites)
    {
        AnimationClip animClip = new AnimationClip();
        animClip.name = name;
        animClip.frameRate = frameRate;
        animClip.wrapMode = isLooping ? WrapMode.Once : WrapMode.Loop;

        AnimationClipSettings clipSettings = new AnimationClipSettings();
        clipSettings.loopTime = isLooping;
        AnimationUtility.SetAnimationClipSettings(animClip, clipSettings);

        EditorCurveBinding spriteBinding = new EditorCurveBinding();
        spriteBinding.type = typeof(SpriteRenderer);
        spriteBinding.path = "";
        spriteBinding.propertyName = "m_Sprite";

        ObjectReferenceKeyframe[] spriteKeyFrames = new ObjectReferenceKeyframe[sprites.Length];
        for (int i = 0; i < (sprites.Length); i++)
        {
            spriteKeyFrames[i] = new ObjectReferenceKeyframe();
            spriteKeyFrames[i].time = i/animClip.frameRate;
            spriteKeyFrames[i].value = sprites[i];
        }
        AnimationUtility.SetObjectReferenceCurve(animClip, spriteBinding, spriteKeyFrames);

        AssetDatabase.CreateAsset(animClip, path + prefix + " " + name + ".anim");
        return animClip;
    }
}
