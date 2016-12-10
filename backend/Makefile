VETARGS?=-all
EXTERNAL_TOOLS=\
	github.com/kardianos/govendor \
	github.com/jteeuwen/go-bindata/... \
	github.com/elazarl/go-bindata-assetfs/...

GOFILES_NOVENDOR = $(shell find . -type f -name '*.go' -not -path "./vendor/*")

BUILD_DIR ?= $(abspath build)

$(BUILD_DIR):
	mkdir -p $@

GOBUILD ?= $(shell go env GOOS)-$(shell go env GOARCH)

GET_GOOS   = $(word 1,$(subst -, ,$1))
GET_GOARCH = $(word 2,$(subst -, ,$1))

BINARIES = $(addprefix $(BUILD_DIR)/hashi-ui-, $(GOBUILD))
$(BINARIES): $(BUILD_DIR)/hashi-ui-%: $(BUILD_DIR) bindata_assetfs.go
	@echo "=> building $@ ..."
	GOOS=$(call GET_GOOS,$*) GOARCH=$(call GET_GOARCH,$*) CGO_ENABLED=0 govendor build -o $@

.PHONY: bootstrap
bootstrap:
	@for tool in $(EXTERNAL_TOOLS); do \
		echo "Installing $$tool" ; \
    go get $$tool; \
	done

	@echo "=> installing go-ps library..."
	go get github.com/mitchellh/go-ps

	@echo "=> govendor sync..."
	govendor sync

.PHONY: fmt
fmt:
	@echo "=> Running go fmt" ;
	@if [ -n "`go fmt ${GOFILES_NOVENDOR}`" ]; then \
		echo "[ERR] go fmt updated formatting. Please commit formatted code first."; \
		exit 1; \
	fi

.PHONY: vet
vet: fmt
	@go tool vet 2>/dev/null ; if [ $$? -eq 3 ]; then \
		go get golang.org/x/tools/cmd/vet; \
	fi

	@echo "=> Running go tool vet $(VETARGS) ${GOFILES_NOVENDOR}"
	@go tool vet $(VETARGS) ${GOFILES_NOVENDOR} ; if [ $$? -eq 1 ]; then \
		echo ""; \
		echo "[LINT] Vet found suspicious constructs. Please check the reported constructs"; \
		echo "and fix them if necessary before submitting the code for review."; \
	fi

ifdef DONT_REBUILD_FRONTEND_ASSETS
.PHONY: bindata_assetfs.go
endif
bindata_assetfs.go:
	$(MAKE) -j -C .. frontend

	@echo "=> packaging assets ..."
	go-bindata-assetfs -prefix ../frontend ../frontend/build/...

.PHONY: build
build: bootstrap fmt vet
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
	rm -f bindata_assetfs.go

.PHONY: dist-clean
dist-clean: clean
	@echo "=> dist-cleaning backend ..."
	rm -rf vendor/{github.com,golang.org,gopkg.in}
