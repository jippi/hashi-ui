.PHONY: build
build: install
	@echo "=> building frontend ..."
	yarn run build

.PHONY: install
install:
	@echo "=> install frontend"
	yarn install --mutex file

.PHONY: lint
lint: install
	@echo "=> running linter ..."
	yarn run lint

.PHONY: clean
clean:
	@echo "=> cleaning ..."
	rm -rf build

.PHONY: dist-clean
dist-clean: clean
	@echo "=> dist-cleaning ..."
	rm -rf node_modules
