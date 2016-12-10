BUILD_DIR ?= $(abspath build)

$(BUILD_DIR):
	mkdir -p $@

GOBUILD ?= $(shell go env GOOS)-$(shell go env GOARCH)

GET_GOOS   = $(word 1,$(subst -, ,$1))
GET_GOARCH = $(word 2,$(subst -, ,$1))

BINARIES = $(addprefix $(BUILD_DIR)/hashi-ui-, $(GOBUILD))
$(BINARIES): $(BUILD_DIR)/hashi-ui-%: $(BUILD_DIR)
	@echo "=> building $@ ..."
	GOOS=$(call GET_GOOS,$*) GOARCH=$(call GET_GOARCH,$*) CGO_ENABLED=0 govendor build -o $@

bootstrap:
	@echo "=> installing go-ps library..."
	go get github.com/mitchellh/go-ps

build: bootstrap $(BINARIES)

rebuild: clean bootstrap $(BINARIES)

clean:
	@echo "=> cleaning ..."
	rm -rf $(BUILD_DIR)

.PHONY: bootstrap build rebuild clean
