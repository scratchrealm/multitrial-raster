#!/bin/bash

set -ex

TARGET=gs://figurl/multitrial-raster-1

yarn build

zip -r build/bundle.zip build

gsutil -m cp -R ./build/* $TARGET/