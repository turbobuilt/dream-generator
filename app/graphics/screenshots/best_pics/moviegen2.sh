#ffmpeg -framerate 0.5 -i %1d.png -vf fps=2 -f nut - | ffmpeg -f nut -i - -vf framerate=25 -c:v mpeg4 out.mp4

ffmpeg -i %1d.png -vf zoompan=d=(A+B)/B:s=WxH:fps=1/B,framerate=25:interp_start=0:interp_end=255:scene=100 -c:v mpeg4 -maxrate 5M -q:v 2 out.mp4
