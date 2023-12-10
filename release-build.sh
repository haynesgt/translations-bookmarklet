#!/bin/bash

# this automatically runs in release.sh

set -e

encode-js() {
    cat dist/index.js | sed -e 's/["]/\&quot;/g'
}

TARGET=release/bookmarklet.html
echo -n "<a href=\"javascript:" > release/bookmarklet.html
cat dist/index.js | head -n1 | encode-js >> $TARGET
echo "\">Right click + copy link address then create bookmark in bookmarks bar + paste</a>" >> $TARGET

cat dist/index.js | head -n1 > release/index.js

ls -lh ./release
date
