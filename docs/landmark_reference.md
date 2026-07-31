# MediaPipe Pose — 33-Point Landmark Reference

The MediaPipe Pose model detects **33 body landmarks** in real-time. Each
landmark provides `x`, `y`, `z` coordinates (normalised to the image frame) and
a `visibility` score.

## Landmark Table

| Index | Name                    | Body Location                              |
| ----: | ----------------------- | ------------------------------------------ |
|     0 | `nose`                  | Tip of the nose                            |
|     1 | `left_eye_inner`        | Inner corner of the left eye               |
|     2 | `left_eye`              | Centre of the left eye                     |
|     3 | `left_eye_outer`        | Outer corner of the left eye               |
|     4 | `right_eye_inner`       | Inner corner of the right eye              |
|     5 | `right_eye`             | Centre of the right eye                    |
|     6 | `right_eye_outer`       | Outer corner of the right eye              |
|     7 | `left_ear`              | Left ear tragion                           |
|     8 | `right_ear`             | Right ear tragion                          |
|     9 | `mouth_left`            | Left corner of the mouth                   |
|    10 | `mouth_right`           | Right corner of the mouth                  |
|    11 | `left_shoulder`         | Left shoulder joint                        |
|    12 | `right_shoulder`        | Right shoulder joint                       |
|    13 | `left_elbow`            | Left elbow joint                           |
|    14 | `right_elbow`           | Right elbow joint                          |
|    15 | `left_wrist`            | Left wrist joint                           |
|    16 | `right_wrist`           | Right wrist joint                          |
|    17 | `left_pinky`            | Left pinky finger (first knuckle)          |
|    18 | `right_pinky`           | Right pinky finger (first knuckle)         |
|    19 | `left_index`            | Left index finger (first knuckle)          |
|    20 | `right_index`           | Right index finger (first knuckle)         |
|    21 | `left_thumb`            | Left thumb (first knuckle)                 |
|    22 | `right_thumb`           | Right thumb (first knuckle)                |
|    23 | `left_hip`              | Left hip joint                             |
|    24 | `right_hip`             | Right hip joint                            |
|    25 | `left_knee`             | Left knee joint                            |
|    26 | `right_knee`            | Right knee joint                           |
|    27 | `left_ankle`            | Left ankle joint                           |
|    28 | `right_ankle`           | Right ankle joint                          |
|    29 | `left_heel`             | Left heel                                  |
|    30 | `right_heel`            | Right heel                                 |
|    31 | `left_foot_index`       | Left foot index toe tip                    |
|    32 | `right_foot_index`      | Right foot index toe tip                   |

## Landmark Groups

- **Face (0–10):** nose, eyes, ears, mouth
- **Upper body (11–22):** shoulders, elbows, wrists, fingers, thumbs
- **Lower body (23–32):** hips, knees, ankles, heels, foot index toes

## Coordinate System

| Axis | Description                                                         |
| ---- | ------------------------------------------------------------------- |
| `x`  | Horizontal position, normalised [0, 1] (left → right of the frame) |
| `y`  | Vertical position, normalised [0, 1] (top → bottom of the frame)   |
| `z`  | Depth relative to the hip midpoint; smaller = closer to the camera  |

`visibility` ranges from 0 to 1 and indicates confidence that the landmark is
visible (not occluded) in the current frame.
