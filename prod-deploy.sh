#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

exit

# navigate into the build output directory
#cd dist

# git init
# git remote add origin git@github.com:espoire/sudoku.git
#git add -A
#git commit -m 'deploy'
#git push -u -f origin gh-pages

# git subtree push --prefix dist origin gh-pages

#cd -