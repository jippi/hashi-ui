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

$(BUILD_DIR)/webpack:
	@echo "=> building webpack ..."
	npm install
	npm run-script build

backend/bindata_assetfs.go: 3rdparty $(BUILD_DIR)/webpack
	@echo "=> building assetfs ..."
	env PATH=$(BUILD_DIR)/bin:$(PATH) go-bindata-assetfs -prefix $(BUILD_DIR) $(BUILD_DIR)/webpack/...
	cp -f bindata_assetfs.go backend/

.PHONY: 3rdparty
3rdparty: $(BUILD_DIR)
	mkdir -p $(BUILD_DIR)/bin
	cd 3rdparty && DESTDIR=$(BUILD_DIR)/bin $(MAKE) install

.PHONY: webpack
webpack: $(BUILD_DIR)/webpack

.PHONY: nomad-ui
nomad-ui: $(BUILD_DIR) backend/bindata_assetfs.go
	mkdir -p $(BUILD_DIR)/bin
	cd backend && env PATH=$(BUILD_DIR)/bin:$(PATH) DESTDIR=$(BUILD_DIR) $(MAKE) install

.PHONY: build
build: webpack nomad-ui

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

.PHONY: lint
lint:
	@test -e node_modules || npm install
	npm run-script lint

.PHONY: clean
clean:
	@echo "=> cleaning ..."
	cd 3rdparty && $(MAKE) clean
	cd backend  && $(MAKE) clean
	rm -rf $(BUILD_DIR)
	rm -rf node_modules
	rm -rf bindata_assetfs.go backend/bindata_assetfs.go
