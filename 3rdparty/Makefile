#
# Note that this Makefile is borked and it will rebuild everything every time you run it. This is due
# me depending on $(BUILD_DIR) everywhere.
#

GLIDE_VERSION = 0.11.1
GLIDE_OS = $(shell go env GOOS)
GLIDE_ARCH = $(shell go env GOARCH)
GLIDE_URL = https://github.com/Masterminds/glide/releases/download/v$(GLIDE_VERSION)/glide-v$(GLIDE_VERSION)-$(GLIDE_OS)-$(GLIDE_ARCH).tar.gz
GLIDE_ARCHIVE = $(notdir $(GLIDE_URL))

BUILD_DIR ?= $(abspath build)
VENDOR_DIR = $(abspath vendor)
DESTDIR ?= /usr/local/bin

GOPATH = $(BUILD_DIR)/gopath

.PHONY: all
all: build

$(BUILD_DIR):
	mkdir -p $@

$(GOPATH): $(BUILD_DIR)
	mkdir -p $@
	mkdir -p $@/src
	mkdir -p $@/bin

$(BUILD_DIR)/$(GLIDE_ARCHIVE): $(BUILD_DIR)
	@echo "=> downloading $(@F) ..."
	curl -sL $(GLIDE_URL) -o $@

$(BUILD_DIR)/glide: $(BUILD_DIR)/$(GLIDE_ARCHIVE)
	tar -zxvf $< -C $(@D)
	cp -fv $(@D)/$(GLIDE_OS)-$(GLIDE_ARCH)/glide $@

$(VENDOR_DIR): $(GOPATH) $(BUILD_DIR)/glide
	@echo "=> updating vendor ..."
	env GOPATH=$(GOPATH) $(BUILD_DIR)/glide up

$(BUILD_DIR)/go-bindata: $(BUILD_DIR) $(VENDOR_DIR) $(GOPATH)
	@echo "=> building $(@F) ..."
	ln -sf $(VENDOR_DIR)/github.com $(GOPATH)/src/github.com
	env GOPATH=$(GOPATH) go build -o $@ github.com/jteeuwen/go-bindata/go-bindata

$(BUILD_DIR)/go-bindata-assetfs: $(BUILD_DIR) $(VENDOR_DIR) $(GOPATH)
	@echo "=> building $(@F) ..."
	ln -sf $(VENDOR_DIR)/github.com $(GOPATH)/src/github.com
	env GOPATH=$(GOPATH) go build -o $@ github.com/elazarl/go-bindata-assetfs/go-bindata-assetfs

.PHONY: build
build: $(BUILD_DIR)/go-bindata $(BUILD_DIR)/go-bindata-assetfs $(BUILD_DIR)/glide

.PHONY: install
install: $(BUILD_DIR)/go-bindata $(BUILD_DIR)/go-bindata-assetfs $(BUILD_DIR)/glide
	install -m 0755 -t $(DESTDIR) $?

.PHONY: clean
clean:
	@echo "=> cleaning ..."
	rm -rf $(BUILD_DIR)
	rm -rf $(VENDOR_DIR) glide.lock
