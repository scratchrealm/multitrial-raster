#!/bin/bash

set -ex

TARGET=gs://figurl/visualization-template-1

yarn build

zip -r build/bundle.zip build

gsutil -m cp -R ./build/* $TARGET/