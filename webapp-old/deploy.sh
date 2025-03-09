pnpm run build-only
rsync -avz dist/ dreamgenerator@staging.noisedestroyer.com:/home/dreamgenerator/website/app/
