
# --exclude server/src/projects/3u7gePQmk1rMLKKLjq36iN/.env
# cp server/src/projects/3u7gePQmk1rMLKKLjq36iN/.env server/build.nosync/projects/3u7gePQmk1rMLKKLjq36iN/.env

cd server && npx etsc && cd ../
rsync -rptgoDvz --exclude node_modules --exclude .env --exclude .DS_Store server/ root@159.65.188.35:/home/dreamgenerator/app/
ssh root@159.65.188.35 "cd /home/dreamgenerator/app/ && pnpm install --production && which pm2 && chown -R dreamgenerator /home/dreamgenerator"
ssh dreamgenerator@159.65.188.35 "pm2 restart all"
rm -rf server/build.nosync

# cd website
# ./deploy.sh

# cd ../webapp
# ./deploy.sh

# mysqldump -u root dream_generator | gzip -9 > dreamgenerator.sql.gz
# scp dreamgenerator.sql.gz root@165.227.214.218:/root/
# ssh root@165.227.214.218 "cd /root && gunzip -f dreamgenerator.sql.gz && mysql -D dreamgenerator < dreamgenerator.sql && rm dreamgenerator.sql"

#  && /home/app/node/bin/pm2 restart 'dreamgenerator.ai'
