# get img_path from command line
import sys
img_path = sys.argv[1]

from nudenet import NudeDetector
nude_detector = NudeDetector()
print(">>>>RESULT>>>>")
result = nude_detector.detect(img_path)
print(result)