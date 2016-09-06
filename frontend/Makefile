BUILD_DIR ?= $(abspath build)

.PHONY: all
all: build

$(BUILD_DIR):
	mkdir -p $@

.PHONY: build
build:
	@echo "=> building frontend ..."
	npm install
	npm run-script build

.PHONY: lint
lint:
	@test -e node_modules || npm install
	npm run-script lint

.PHONY: clean
clean:
	@echo "=> cleaning ..."
	rm -rf node_modules
	rm -rf $(BUILD_DIR)
