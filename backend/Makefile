BUILD_DIR ?= $(abspath build)
VENDOR_DIR = $(abspath vendor)
DESTDIR ?= /usr/local/bin

GOPACKAGE = github.com/iverberk/nomad-ui
GOPATH = $(BUILD_DIR)/gopath
GOBUILD ?= $(shell go env GOOS)-$(shell go env GOARCH)

GET_GOOS   = $(word 1,$(subst -, ,$1))
GET_GOARCH = $(word 2,$(subst -, ,$1))

.PHONY: all
all: build

$(BUILD_DIR):
	mkdir -p $@

$(GOPATH): $(BUILD_DIR)
	mkdir -p $@
	mkdir -p $@/src
	mkdir -p $@/bin

$(VENDOR_DIR): $(GOPATH)
	@echo "=> updating vendor ..."
	GOPATH=$(GOPATH) glide up

#
# Go requires source files itself to be in GOPATH that we use to build. It is an interesting
# idea so we have an interesting solution with faking root path during build process.
#
# Probably we can use https://getgb.io/ but it requires us to have src/ and eh, maybe later.
#
BINARIES = $(addprefix $(BUILD_DIR)/nomad-ui-, $(GOBUILD))
$(BINARIES): $(BUILD_DIR)/nomad-ui-%: $(BUILD_DIR) $(VENDOR_DIR) $(GOPATH)
	@echo "=> building $@ ..."
	mkdir -p            $(GOPATH)/src/$(GOPACKAGE)
	ln -sf $(abspath .) $(GOPATH)/src/$(GOPACKAGE)/backend
	cd $(GOPATH)/src/$(GOPACKAGE)/backend && GOPATH=$(GOPATH) GOOS=$(call GET_GOOS,$*) GOARCH=$(call GET_GOARCH,$*) CGO_ENABLED=0 go build -v -o $@

.PHONY: build
build: $(BINARIES)

.PHONY: install
install: $(BINARIES)
	install -m 0755 $? $(DESTDIR)

.PHONY: clean
clean:
	@echo "=> cleaning ..."
	rm -rf $(BUILD_DIR)
	rm -rf $(VENDOR_DIR) glide.lock
