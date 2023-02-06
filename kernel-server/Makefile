.PHONY: install test unittest clean
.DEFAULT: help

BINARY ?= AdServer.exe

help:
	@echo "make install: compile packages and dependencies"

install:
	@go build -o ${BINARY}
	@test -n "${ENV}" && swag init || true
	@test -f ./env/.env.${ENV} && cp ./env/.env.${ENV} .env || true
	@test -f ./docker-compose/docker-compose.${ENV}.yaml && cp ./docker-compose/docker-compose.${ENV}.yaml docker-compose.override.yaml || true

test: 
	@go test -v -cover -covermode=atomic ./...

unittest:
	@go test -short  ./...

lint:
	@docker run --rm -v $(shell pwd):/app -w /app golangci/golangci-lint:v1.42.0-alpine golangci-lint run -v --timeout 300s
	@go run -race main.go

clean: 
	@test -f ${BINARY} && rm ${BINARY} || true
	@test -f .env && rm .env || true
	@test -f docker-compose.override.yaml && rm docker-compose.override.yaml || true

docker-start:
	@docker-compose -f docker-compose.yaml -f docker-compose.override.yaml up -d

docker-stop:
	@docker-compose -f docker-compose.yaml -f docker-compose.override.yaml down