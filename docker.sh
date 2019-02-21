#!/bin/bash

usage="$(basename "$0") [-h] [-b] [-p 'patch' || 'minor'] -- program to build and push docker container images"
help="
where:
	-h  help
	-b  build container
	-p  push (default: patch)"

echo "$usage"

push="patch"
APP_NAME="zeroinbox-api"
REPO="gcr.io/zero-inbox-organizer"
IMG_NAME="$REPO/$APP_NAME"

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
			 printf "Previoud ID: $PREV_ID\n"
			 printf "Current ID: $CUR_ID\n"
			 printf "Previous Git Tag: $PREV_GIT_TAG"
			 if [ "$PREV_ID" != "$CUR_ID" ]; then
					echo New Image found
					docker image rm $PREV_ID
			 else if [ ! -z "$PREV_GIT_TAG"]; then
			 		echo Previous git version found
					echo "$PREV_GIT_TAG"
					docker image rm $IMG_NAME:$PREV_GIT_VERSION
			 fi
			 fi
			 exit
       ;;
    p) push=$OPTARG
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