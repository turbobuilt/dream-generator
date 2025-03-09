#!/usr/bin/env sh

rm -rf release
mkdir release
cd vue && npx vite build && cp -r dist ../release/vue && cd ../
mkdir -p release/llamacpp/win32_x64
cp -R llamacpp/win32_x64/avx2 release/llamacpp/win32_x64
rm release/llamacpp/win32_x64/avx2/*.log

cp -R node release/node

mkdir -p release/models/openvino-lcm
cp models/openvino-lcm/lcm_dreamshaper_win32_x64.exe release/models/openvino-lcm
cp models/openvino-lcm/*.dll release/models/openvino-lcm

npx tsx build_local_release.ts
cp package.json release/package.json
cd release
npm i --production
cd ..
cp common/vcredist/* release/node_modules/openvino-node/bin
cp common/vcredist/* release/models/openvino-lcm
cp common/openvino/* release/models/openvino-lcm

# out to releases
npx @electron/packager release --verbose --overwrite --out=releases --icon="C:\Users\hdtru\prg\dreamgenerator-monorepo\electron\assets\logo.ico"

# Import AWS credentials from keys.txt
if [ -f "./keys.txt" ]; then
  . ./keys.txt
else
  echo "Error: keys.txt file not found. Please create it with your AWS credentials."
  exit 1
fi

# npx electron-builder build  --prepackaged="releases/Dream Generator AI-win32-x64" --windows --x64 --config electron-builder.yml
#  --publish always 
npx electron-builder build --publish always --prepackaged="releases/Dream Generator AI-win32-x64" --windows --x64 --config electron-builder.yml