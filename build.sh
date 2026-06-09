#!/bin/sh
set -e

cd server
npm install
npm run generate

cd ../client
npm install --include=dev
npm run build
