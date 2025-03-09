#!/usr/bin/env sh

rm -rf release
mkdir release
cd vue && npx vite build && cp -r dist ../release/vue && cd ../
mkdir -p release/llamacpp/mac_x64/build/bin
cp llamacpp/mac_x64/build/bin/server release/llamacpp/mac_x64/build/bin/server
npx tsx build_local_release.ts

cp package.json release/package.json
cd release
npm i --production
cd ..

# out to releases
npx @electron/packager release --overwrite --out=releases --icon=assets/logo.jpg