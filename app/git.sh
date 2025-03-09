git add .

MSG=$1

if [ -z "$MSG" ]; then
    MSG="work"
fi

git commit -m "$MSG"
git push --all origin