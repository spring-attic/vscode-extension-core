#!/bin/bash
set -e

buildversion=`date '+%Y-%m-%d-%H-%M-%S'`

pushd git-repo > /dev/null
envsubst < ~/.npmrc > ~/.npmrc.tmp && mv  ~/.npmrc.tmp ~/.npmrc
npm install && npm pack && npm run publish:next
popd > /dev/null

pushd triggers > /dev/null
mkdir ${BUILD_NAME}
touch ${BUILD_NAME}/trigger-${buildversion}
popd > /dev/null
