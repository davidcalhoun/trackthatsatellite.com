#!/bin/sh

printf '\n\x1B[33m%s\033[0m\n' 'Compiling JS/CSS/images with Webpack...'

# Remove the old dist.
rm -rf dist || true

# Run Webpack in prod mode.
NODE_ENV=production ./node_modules/.bin/webpack

printf '\n\x1B[32m%s\033[0m\n' 'Webpack compilation complete.'

printf '\n\x1B[32m%s\033[0m\n' 'Installing server packages'

# Update non-webpack'd stuff.
cp src/index.html dist/public/index.html
cp src/favicon.ico dist/public/favicon.ico

mkdir dist/public/data
cp src/js/tles/_all-tles.txt dist/public/data/tles.txt

printf '\n\x1B[32m%s\033[0m\n' 'Outputted to /dist'