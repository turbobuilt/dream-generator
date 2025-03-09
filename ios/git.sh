# first mysqldump aicode database to aicode.sql.gz with max compression
mysqldump -u root aicode | gzip -9 > aicode.sql.gz
mysqldump -u root aircraft | gzip -9 > aircraft.sql.gz
git add .

MSG=$1

if [ -z "$MSG" ]; then
    MSG="work"
fi

git commit -m "$MSG"
git push --all origin