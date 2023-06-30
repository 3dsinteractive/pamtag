#!/bin/bash

function build_and_commit() {
    local IMAGE=$1
    docker login -u $DOCKER_USER -p $DOCKER_PASS
    docker build -f ./Dockerfile -t 3dsinteractive/$IMAGE:$NAMESPACE-$APP_VERSION.$TIMESTAMP .
    docker push 3dsinteractive/$IMAGE:$NAMESPACE-$APP_VERSION.$TIMESTAMP
}

function build_pam_tracker() {
    local IMAGE=pam4-tracker

    if [[ $? != 0 ]]; then exit $?; fi
    build_and_commit $IMAGE
}

function build_nano() {
    local IMAGE=pam.nano.base.trackerjs

    if [[ $? != 0 ]]; then exit $?; fi
    build_and_commit $IMAGE
}