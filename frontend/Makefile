.PHONY: build
build:
	@echo "=> building frontend ..."
	yarn install
	yarn run build

.PHONY: lint
lint:
	@echo "=> running linter ..."
	@test -e node_modules || yarn install
	yarn run lint

.PHONY: clean
clean:
	@echo "=> cleaning ..."
	rm -rf node_modules
	rm -rf build
