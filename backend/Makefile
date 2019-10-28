BUILD_DIR ?= $(abspath build)
GET_GOARCH = $(word 2,$(subst -, ,$1))
GET_GOOS   = $(word 1,$(subst -, ,$1))
GIT_COMMIT := $(shell git describe --tags)
GIT_DIRTY := $(if $(shell git status --porcelain),+CHANGES)
GO_LDFLAGS := "-X main.GitCommit=$(GIT_COMMIT)$(GIT_DIRTY)"
GOBUILD ?= $(shell go env GOOS)-$(shell go env GOARCH)

$(BUILD_DIR):
	mkdir -p $@

BINARIES = $(addprefix $(BUILD_DIR)/hashi-ui-, $(GOBUILD))
$(BINARIES): $(BUILD_DIR)/hashi-ui-%: $(BUILD_DIR) bindata_assetfs.go
	@echo "=> building $@ ..."
	GOOS=$(call GET_GOOS,$*) GOARCH=$(call GET_GOARCH,$*) CGO_ENABLED=0 go build -o $@ -ldflags $(GO_LDFLAGS)

.PHONY: install
install:
	@go mod download
	@go get -u github.com/go-bindata/go-bindata/...
	@go get -u github.com/elazarl/go-bindata-assetfs/...

bindata_assetfs.go:
	$(MAKE) -j -C .. frontend

	@echo "=> packaging assets ..."
	go-bindata-assetfs -prefix ../frontend ../frontend/build/...

.PHONY: build
build: install
	@echo "=> building backend ..."
	$(MAKE) -j $(BINARIES)

.PHONY: rebuild
rebuild: clean
	@echo "=> rebuilding backend ..."
	$(MAKE) -j build

.PHONY: clean
clean:
	@echo "=> cleaning backend ..."
	rm -rf $(BUILD_DIR)
ifndef KEEP_BINDATA_ASSETFS
	rm -f bindata_assetfs.go
endif

test:
	@echo "==> Running $@..."
	@go test -v -tags $(shell go list ./...)
