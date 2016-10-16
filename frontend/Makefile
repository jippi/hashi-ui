.PHONY: build
build:
	@echo "=> building frontend ..."
	npm install
	npm run-script build

.PHONY: lint
lint:
	@echo "=> running linter ..."
	@test -e node_modules || npm install
	npm run-script lint

.PHONY: clean
clean:
	@echo "=> cleaning ..."
	rm -rf node_modules
	rm -rf build
