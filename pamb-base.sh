#!/bin/bash

function commit() {
    local IMAGE=$1
    docker login -u $DOCKER_USER -p $DOCKER_PASS
    docker build -f ./Dockerfile -t 3dsinteractive/$IMAGE:$NAMESPACE-$APP_VERSION.$TIMESTAMP .
    docker push 3dsinteractive/$IMAGE:$NAMESPACE-$APP_VERSION.$TIMESTAMP
}

function build_pam_tracker() {
    local IMAGE=pam4-tracker

    npm install -g yarn
    yarn
    yarn build
    if [[ $? != 0 ]]; then exit $?; fi

    commit $IMAGE
}
