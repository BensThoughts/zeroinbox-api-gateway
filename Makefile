deploy_env ?= deploy.env
include $(deploy_env)
export $(shell sed 's/=.*//' $(deploy_env))

SEM_VERSION=${shell ./sem-version.sh}
GIT_VERSION=${shell git rev-parse @}
PREV_GIT_VERSION=${shell git rev-parse @~}

IMG_NAME=${DOCKER_REPO}/${APP_NAME}


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
	@docker build -t ${IMG_NAME}:latest .
	@docker tag ${IMG_NAME}:latest ${IMG_NAME}:${GIT_VERSION}
	@docker tag ${IMG_NAME}:${GIT_VERSION} ${IMG_NAME}:${SEM_VERSION}
	@docker image rm ${IMG_NAME}:${PREV_GIT_VERSION}

push: ## Push to gcr.io/zero-inbox-organizer
	@docker push ${IMG_NAME}:${GIT_VERSION}
	@docker push ${IMG_NAME}:latest
	@docker push ${IMG_NAME}:${SEM_VERSION}