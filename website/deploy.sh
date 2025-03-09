# bun build.ts
# # upload only files with no extension and set --header-upload "Content-type: text/html"
# rclone copy build cloudflare:dreamgenerator --exclude="**/*.*" --exclude="**/.*" --header-upload "Content-type: text/html"

# # now upload all files that have a name and extension
# rclone copy build cloudflare:dreamgenerator --include="**/*.*"

bun build.ts
rsync -avz build/ dreamgenerator@staging.noisedestroyer.com:/home/dreamgenerator/website/
