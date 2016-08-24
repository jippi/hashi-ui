#
# Note that this Makefile is borked and it will rebuild everything every time you run it. This is due
# me depending on $(BUILD_DIR) everywhere.
#

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

.PHONY: glide
glide: $(BUILD_DIR)
	@mkdir -p $(BUILD_DIR)/bin
	cd glide && DESTDIR=$(BUILD_DIR)/bin $(MAKE) install

$(VENDOR_DIR): $(GOPATH) glide
	@echo "=> updating vendor ..."
	env GOPATH=$(GOPATH) $(BUILD_DIR)/bin/glide up

$(BUILD_DIR)/go-bindata: $(BUILD_DIR) $(VENDOR_DIR) $(GOPATH)
	@echo "=> building $(@F) ..."
	ln -sf $(VENDOR_DIR)/github.com $(GOPATH)/src/github.com
	env GOPATH=$(GOPATH) go build -o $@ github.com/jteeuwen/go-bindata/go-bindata

$(BUILD_DIR)/go-bindata-assetfs: $(BUILD_DIR) $(VENDOR_DIR) $(GOPATH)
	@echo "=> building $(@F) ..."
	ln -sf $(VENDOR_DIR)/github.com $(GOPATH)/src/github.com
	env GOPATH=$(GOPATH) go build -o $@ github.com/elazarl/go-bindata-assetfs/go-bindata-assetfs

.PHONY: build
build: $(BUILD_DIR)/go-bindata $(BUILD_DIR)/go-bindata-assetfs

.PHONY: install
install: $(BUILD_DIR)/go-bindata $(BUILD_DIR)/go-bindata-assetfs
	install -m 0755 $? $(DESTDIR)

.PHONY: clean
clean:
	@echo "=> cleaning ..."
	rm -rf $(BUILD_DIR)
	rm -rf $(VENDOR_DIR) glide.lock
	cd glide && $(MAKE) clean
