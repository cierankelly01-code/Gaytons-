#!/bin/sh
set -e

cd server
npm install
./node_modules/.bin/prisma generate
cd ../client
npm install
npm run build
