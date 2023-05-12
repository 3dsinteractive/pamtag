#!/bin/bash

function npm_install_yarn {
    npm install -g yarn
}

function commit() {
    local IMAGE=$1
    docker login -u $DOCKER_USER -p $DOCKER_PASS
    docker build -f ./dockerfiles/dockerfile-script -t 3dsinteractive/$IMAGE:$NAMESPACE-$APP_VERSION.$TIMESTAMP .
    docker push 3dsinteractive/$IMAGE:$NAMESPACE-$APP_VERSION.$TIMESTAMP
}

function build_pam_tracker() {
    local IMAGE=pam4-tracker

    npm_install_yarn

    yarn upgrade
    yarn install
    yarn build
    if [[ $? != 0 ]]; then exit $?; fi

    cd consent-request
    yarn
    yarn build
    cd ..

    commit $IMAGE
}
