deploy_env ?= deploy.env
include $(deploy_env)
export $(shell sed 's/=.*//' $(deploy_env))

IMG_NAME=${DOCKER_REPO}/${APP_NAME}
# GIT_VERSION=${shell git rev-parse @}


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
build: GIT_VERSION=${shell git rev-parse @}
build: PREV_GIT_VERSION=${shell git rev-parse @~}
build: DEL_VER=$(shell docker images -f reference=${IMG_NAME}:latest --format "{{.ID}}")
build:
	docker build -t ${IMG_NAME}:latest .
	docker tag ${IMG_NAME}:latest ${IMG_NAME}:${GIT_VERSION}
	docker image rm ${IMG_NAME}:${PREV_GIT_VERSION}
	docker image rm ${IMG_NAME}:${DEL_VER}


push-patch: ## Push new patch version to gcr.io/zero-inbox-organizer
push-patch: PATCH_SEM_VER=$(shell npm version patch)
push-patch: PREV_GIT_VERSION=${shell git rev-parse @~}
push-patch: GIT_VERSION=${shell git rev-parse @}
push-patch: SEM_VERSION=${shell jq -rM '.version' package.json}
push-patch:
	@echo 'Previous git version: ${PREV_GIT_VERSION}'
	@echo 'Current git version: ${GIT_VERSION}'
	@echo 'Semantic version: ${PATCH_SEM_VER}'
	docker tag ${IMG_NAME}:latest ${IMG_NAME}:${GIT_VERSION}
	docker image rm ${IMG_NAME}:${PREV_GIT_VERSION}
	docker push ${IMG_NAME}:${GIT_VERSION}
	docker push ${IMG_NAME}:latest
	docker tag ${IMG_NAME}:${GIT_VERSION} ${IMG_NAME}:v${SEM_VERSION}
	docker push ${IMG_NAME}:v${SEM_VERSION}
	docker image rm ${IMG_NAME}:v${SEM_VERSION}


push-minor: ## Push new minor version to gcr.io/zero-inbox-organizer
push-minor: PATCH_SEM_VER=$(shell npm version minor)
push-minor: PREV_GIT_VERSION=${shell git rev-parse @~}
push-minor: GIT_VERSION=${shell git rev-parse @}
push-minor: SEM_VERSION=${shell jq -rM '.version' package.json}
push-minor:
	@echo ${GIT_VERSION}
	@echo ${PREV_GIT_VERSION}
	@echo ${PATCH_SEM_VER}
	@echo ${SEM_VERSION}
	@docker tag ${IMG_NAME}:latest ${IMG_NAME}:${GIT_VERSION}
	@docker image rm ${IMG_NAME}:${PREV_GIT_VERSION}
	@docker push ${IMG_NAME}:${GIT_VERSION}
	@docker push ${IMG_NAME}:latest
	@docker tag ${IMG_NAME}:${GIT_VERSION} ${IMG_NAME}:v${SEM_VERSION}
	@docker push ${IMG_NAME}:v${SEM_VERSION}
	@docker image rm ${IMG_NAME}:v${SEM_VERSION}