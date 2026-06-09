#!/bin/sh
set -e

echo ">>> Step 1: install server deps"
cd server
npm install

echo ">>> Step 2: check prisma binary"
ls node_modules/.bin/prisma && echo "prisma binary found" || echo "prisma binary MISSING"

echo ">>> Step 3: prisma generate"
npm run generate

echo ">>> Step 4: install client deps"
cd ../client
npm install

echo ">>> Step 5: build client"
npm run build

echo ">>> Done"
