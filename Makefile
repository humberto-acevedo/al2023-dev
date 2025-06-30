# Makefile

IMAGE_NAME=al2023-dev
ACCOUNT_ID=$(shell aws sts get-caller-identity --query Account --output text)
REGION=us-west-2
ECR_URI=$(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/$(IMAGE_NAME)

build:
	docker build -t $(IMAGE_NAME) .

run:
	docker run -it --rm -v "$$PWD":/workspace $(IMAGE_NAME)

save:
	docker save $(IMAGE_NAME) | gzip > $(IMAGE_NAME).tar.gz

load:
	gunzip -c $(IMAGE_NAME).tar.gz | docker load

push:
	docker tag $(IMAGE_NAME):latest $(ECR_URI):latest
	aws ecr get-login-password --region $(REGION) | docker login --username AWS --password-stdin $(ECR_URI)
	docker push $(ECR_URI):latest

pull:
	docker pull $(ECR_URI):latest
