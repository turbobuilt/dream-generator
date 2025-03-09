#!/bin/bash

# Find all images in the ./landscape directory
images=$(find ./landscape -type f -name '*.jpg' -o -name '*.png')

# Create a temporary folder to store the processed images
mkdir temp_folder

# Loop through each image and apply crossfade transition
for img in $images; do
    # Use ImageMagick to apply crossfade transition and save the processed image to the temporary folder
    convert $img \( +clone -set option:modulate:colorspace gray +level 0x80% \) -compose blend -define compose:args=100,0 -composite -set delay 20 temp_folder/processed_$(basename $img)
done

# Create a list file to feed into ffmpeg
find temp_folder -name "processed_*.jpg" -printf "file '%p'\n" > temp_folder/list.txt

# Create a movie using the processed images in the temporary folder
ffmpeg -f concat -i temp_folder/list.txt -vf "fade=d=0.5:alpha=1, fade=d=0.5:alpha=1:st=2" -c:v libx264 -r 30 output_movie.mp4

# Remove the temporary folder and its contents
rm -rf temp_folder
