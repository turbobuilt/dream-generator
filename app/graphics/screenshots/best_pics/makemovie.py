from moviepy.editor import ImageSequenceClip, concatenate_videoclips, concatenate, ImageClip
import os

# Replace with the path to your directory with images
image_folder = 'landscape'
image_files = [os.path.join(image_folder, img) for img in os.listdir(image_folder) if img.endswith((".jpg", ".jpeg", ".png"))]
image_files.sort()  # Sort the files if needed

# Each image will be displayed for 2 seconds
duration = 4
crossfade_duration = 1  # Crossfade transition duration

# Load the images and set the duration for each image
clips = [ImageSequenceClip([img], durations=[duration]) for img in image_files]


clips_with_crossfade = []
for i in range(len(clips)):
    clip = clips[i]
    # else: 
    if i == 0:
        clips_with_crossfade.append(clip)
    else:
        clips_with_crossfade.append(clip.crossfadein(crossfade_duration))
    if i == len(clips) - 1:
        # the movie should start with crossfade from the last image to the first one immediately so looping looks
        clips_with_crossfade.append(ImageClip(image_files[0], duration=crossfade_duration*2).crossfadein(crossfade_duration))

# Concatenate all clips
final_clip = concatenate(clips_with_crossfade, padding=-crossfade_duration, method="compose")

# # Create a transition between every two consecutive clips
# transition_clips = []
# for i in range(len(clips) - 1):
#     transition_clip = clips[i].crossfadeout(crossfade_duration).set_end(clips[i+1].start)
#     transition_clips.append(transition_clip)

# # Concatenate all clips with transitions
# final_clip = concatenate_videoclips(clips + transition_clips, method="compose")

# Write the result to a file
final_clip.write_videofile("slideshow.mp4", fps=48)