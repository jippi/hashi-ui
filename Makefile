BUILD_DIR ?= $(abspath build)
DESTDIR ?= /usr/local/bin

GOPKG = github.com/iverberk/nomad-ui/backend
GOFILES = $(shell find . -type f -name '*.go')
GOFILES_NOVENDOR = $(shell find . -type f -name '*.go' -not -path "./backend/vendor/*")

.PHONY: all
all: check-deps build

.PHONY: check-deps
check-deps:
	@echo "=> checking dependencies ..."
	@(go version      | grep -qF '1.6.3'             ) && echo    go: `go      version | sed "s/go version //"`
	@(node --version  | grep -qF 'v4'                ) && echo  node: `node  --version`
	@(npm  --version  | grep -qF -e '3.10' -e '2.15' ) && echo   npm: `npm   --version`

$(BUILD_DIR):
	mkdir -p $@

$(BUILD_DIR)/frontend:
	@echo "=> building webpack ..."
	cd frontend && $(MAKE) build

backend/bindata_assetfs.go: 3rdparty $(BUILD_DIR)/frontend
	@echo "=> building assetfs ..."
	env PATH=$(BUILD_DIR)/bin:$(PATH) go-bindata-assetfs -prefix frontend frontend/build/...
	cp -f bindata_assetfs.go backend/

.PHONY: 3rdparty
3rdparty: $(BUILD_DIR)
	mkdir -p $(BUILD_DIR)/bin
	cd 3rdparty && DESTDIR=$(BUILD_DIR)/bin $(MAKE) install
	cd 3rdparty/glide && DESTDIR=$(BUILD_DIR)/bin $(MAKE) install

.PHONY: frontend
frontend: $(BUILD_DIR)/frontend

.PHONY: backend
backend: $(BUILD_DIR) backend/bindata_assetfs.go
	mkdir -p $(BUILD_DIR)/bin
	cd backend && env PATH=$(BUILD_DIR)/bin:$(PATH) DESTDIR=$(BUILD_DIR) $(MAKE) install

.PHONY: build
build: frontend backend

.PHONY: install
install: build
	install -m 0755  $(shell ls $(BUILD_DIR)/nomad-ui-*) $(DESTDIR)

.PHONY: vet
vet:
	@gofmt -l $(GOFILES_NOVENDOR) | read && echo "Code differs from gofmt style" 1>&2 && exit 1 || true
	go vet $(GOPKG)

.PHONY: fmt
fmt:
	gofmt -l -w $(GOFILES_NOVENDOR)

.PHONY: simplify
simplify:
	gofmt -l -s -w $(GOFILES_NOVENDOR)

.PHONY: clean
clean:
	@echo "=> cleaning ..."
	cd 3rdparty && $(MAKE) clean
	cd backend  && $(MAKE) clean
	cd frontend && $(MAKE) clean
	rm -rf $(BUILD_DIR)
	rm -rf bindata_assetfs.go backend/bindata_assetfs.go

.PHONY: docker
docker:
	@echo "=> build and push Docker image ..."
	@docker login -e $(DOCKER_EMAIL) -u $(DOCKER_USER) -p $(DOCKER_PASS)
	docker build -f Dockerfile -t iverberk/nomad-ui:$(COMMIT) .
	docker tag iverberk/nomad-ui:$(COMMIT) iverberk/nomad-ui:$(TAG)
	docker push iverberk/nomad-ui:$(TAG)
