#!/bin/bash

docker pull hibooboo2/react-tetris
docker run --name my-mongo -d mongo
docker run --name tetris --link my-mongo:mongo -p 3000:3000 -d hibooboo2/react-tetris
