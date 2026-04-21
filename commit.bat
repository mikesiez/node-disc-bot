SET /P confirm="commit msg: "
git add .
git commit -m %confirm%
git push -u origin main