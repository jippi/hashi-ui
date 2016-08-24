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
DESTDIR ?= /usr/local/bin

.PHONY: all
all: build

$(BUILD_DIR):
	mkdir -p $@

$(BUILD_DIR)/$(GLIDE_ARCHIVE): $(BUILD_DIR)
	@echo "=> downloading $(@F) ..."
	curl -sL $(GLIDE_URL) -o $@

$(BUILD_DIR)/glide: $(BUILD_DIR)/$(GLIDE_ARCHIVE)
	tar -zxvf $< -C $(@D)
	cp -fv $(@D)/$(GLIDE_OS)-$(GLIDE_ARCH)/glide $@

.PHONY: build
build: $(BUILD_DIR)/glide

.PHONY: install
install: $(BUILD_DIR)/glide
	install -m 0755 $? $(DESTDIR)

.PHONY: clean
clean:
	@echo "=> cleaning ..."
	rm -rf $(BUILD_DIR)
