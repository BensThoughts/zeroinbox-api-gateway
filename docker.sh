#!/bin/bash

usage="$(basename "$0") [-h] [-b] [-p push patch] [-m push minor] -- program to build and push docker container images"
help="
where:
	-h  help
	-b  build container
	-p  push a new patch version
	-m  push a new minor version"

echo "$usage"

source ./deploy.env
IMG_NAME="$DOCKER_REPO/$APP_NAME"

while getopts ':hbp:' option; do
  case "$option" in
		h) printf "$help\n"
			 exit
			 ;;
    b) printf "Building docker image: \n"
			 GIT_VER=$(git rev-parse @)
			 PREV_GIT_VER=$(git rev-parse @~)
			 PREV_ID=$(docker images -f reference=$IMG_NAME:latest --format "{{.ID}}")
			 PREV_GIT_TAG=$(docker images -f reference=$IMG_NAME:$PREV_GIT_VER --format "{{.Tag}}")
			 printf "Image: $IMG_NAME:$GIT_VER\n"
			 docker build -t $IMG_NAME:latest .
			 docker tag $IMG_NAME:latest $IMG_NAME:$GIT_VER
			 CUR_ID=$(docker images -f reference=$IMG_NAME:latest --format "{{.ID}}")
			 if [ "$PREV_ID" != "$CUR_ID" ]; then
					docker image rm $PREV_ID
			 elif [ ! -z "$PREV_GIT_TAG" ]; then
					docker image rm "$IMG_NAME:$PREV_GIT_TAG"
			 fi
			 exit
       ;;
    p) printf "Pushing new patch version:\n"
			 PREV_SEM_VER="v$(jq -rM '.version' package.json)"
			 NEW_SEM_VER=$(npm version patch)
			 printf "Previous sem version: $PREV_SEM_VER\n"
			 printf "New sem version: $NEW_SEM_VER\n"
			 NEW_GIT_VER=$(git rev-parse @)
			 PREV_GIT_VER=$(git rev-parse @~)
			 docker tag $IMG_NAME:latest $IMG_NAME:$NEW_GIT_VERSION
			 docker image rm $IMG_NAME:$PREV_GIT_VERSION
			 docker push $IMG_NAME:$NEW_GIT_VERSION
			 docker push $IMG_NAME:latest
			 docker tag $IMG_NAME:$NEW_GIT_VERSION $IMG_NAME:$NEW_SEM_VERSION
			 docker push $IMG_NAME:$NEW_SEM_VERSION
			 docker image rm $IMG_NAME:$NEW_SEM_VERSION
			 exit
       ;;
    :) printf "missing argument for -%s\n" "$OPTARG" >&2
       echo "$usage" >&2
       exit 1
       ;;
   \?) printf "illegal option: -%s\n" "$OPTARG" >&2
       echo "$usage" >&2
       exit 1
       ;;
  esac
done
shift $((OPTIND - 1))