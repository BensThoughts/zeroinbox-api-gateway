APP_NAME=zeroinbox_api
TAG=${shell ./git-version.sh}
IMG=${NAME}:${TAG}
LATEST=${NAME}:latest
VERSION=${shell ./sem-version.sh}
DOCKER_REPO=gcr.io/zero-inbox-organizer


# HELP
# This will output the help for each task
# thanks to https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
.PHONY: help

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.DEFAULT_GOAL := help

# DOCKER TASKS
# Build the container
build: ## Build the container
	@docker build -t ${DOCKER_REPO}/$(APP_NAME):${TAG} .
	@docker tag ${DOCKER_REPO}/$(APP_NAME):${TAG} ${DOCKER_REPO}/${APP_NAME}:latest
	@docker tag ${DOCKER_REPO}/$(APP_NAME):${TAG} ${DOCKER_REPO}/${APP_NAME}:${VERSION}

push: ## Push to gcr.io/zero-inbox-organizer
	@docker push ${DOCKER_REPO}/${APP_NAME}:${TAG}
	@docker push ${DOCKER_REPO}/${APP_NAME}:${VERSION}
	@docker push ${DOCKER_REPO}/${APP_NAME}:latest
