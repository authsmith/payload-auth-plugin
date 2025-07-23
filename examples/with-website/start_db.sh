#!/bin/bash

branch=$(git symbolic-ref --short HEAD)

echo "named container '${branch}'"
docker start -i $branch || docker run --name $branch -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=localdb -p 0.0.0.0:5432:5432 postgres:latest