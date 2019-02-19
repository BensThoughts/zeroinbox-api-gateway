NAME    := gcr.io/zero-inbox-organizer/zeroinbox_api
TAG     := $$(git log -1 --pretty=%H(MISSING))
IMG     := ${NAME}:${TAG}
LATEST  := ${NAME}:latest

build:
  @docker build -t ${IMG} .
  @docker tag ${IMG}:${LATEST}

push:
  @docker push ${NAME}
