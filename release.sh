#!/bin/bash

SCRIPT_DIR=$(dirname ${BASH_SOURCE[0]})
cd $SCRIPT_DIR

git diff HEAD --quiet || (echo "Please commit your changes before releasing" && exit 1)

set -e

set +x
pnpm run clean-build
mkdir -p release
set -x

./release-build.sh

set +x
git fetch --tags
LAST_TAG=$(git tag --list | grep -E "^v[0-9]+\.[0-9]+\.[0-9]+$" | sort -g | tail -n1)
NEXT_TAG=$(echo $LAST_TAG | awk -F. '{print $1 "." $2 "." $3+1}')

git add release
git commit -m "feat: release $NEXT_TAG" || echo "Release already built"

git tag -a $NEXT_TAG -m "Release $NEXT_TAG"

git push origin HEAD $NEXT_TAG
