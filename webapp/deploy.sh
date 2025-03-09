# pnpm run build-only
# bun generateCachedFilesList.ts
rsync -avz dist/ dreamgenerator@staging.noisedestroyer.com:/home/dreamgenerator/website/app/
# cd ../website
# ./deploy.sh