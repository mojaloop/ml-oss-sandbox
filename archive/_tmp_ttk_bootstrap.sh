#!/usr/bin/env bash


# TODO: change to upstream
BRANCH_NAME=feat/3p-scheme-adapter-outbound-ttk
REPO_URL=https://github.com/lewisdaly/pisp/archive/${BRANCH_NAME}.zip
SRC_CONFIG_PATH=/tmp/pisp/pisp-feat-3p-scheme-adapter-outbound-ttk/docker-contract/ml-testing-toolkit/spec_files
DEST_CONFIG_PATH=/opt/mojaloop-testing-toolkit/spec_files
mkdir -p /tmp/pisp
wget ${REPO_URL} -O /tmp/pisp.zip
unzip /tmp/pisp.zip -d /tmp/pisp
# Copy the config 
cp -R ${SRC_CONFIG_PATH} ${DEST_CONFIG_PATH}
# run the thingo
npm run start