VETARGS?=-all
EXTERNAL_TOOLS=\
	github.com/kardianos/govendor \
	github.com/jteeuwen/go-bindata/... \
	github.com/elazarl/go-bindata-assetfs/...

GOFILES_NOVENDOR = $(shell find . -type f -name '*.go' -not -path "./backend/vendor/*")

.PHONY: bootstrap
bootstrap:
	@for tool in $(EXTERNAL_TOOLS); do \
		echo "Installing $$tool" ; \
    go get $$tool; \
	done

.PHONY: fmt
fmt:
	@echo "--> Running go fmt" ;
	@if [ -n "`go fmt ${GOFILES_NOVENDOR}`" ]; then \
		echo "[ERR] go fmt updated formatting. Please commit formatted code first."; \
		exit 1; \
	fi

.PHONY: vet
vet: fmt
	@go tool vet 2>/dev/null ; if [ $$? -eq 3 ]; then \
		go get golang.org/x/tools/cmd/vet; \
	fi
	@echo "--> Running go tool vet $(VETARGS) ${GOFILES_NOVENDOR}"
	@go tool vet $(VETARGS) ${GOFILES_NOVENDOR} ; if [ $$? -eq 1 ]; then \
		echo ""; \
		echo "[LINT] Vet found suspicious constructs. Please check the reported constructs"; \
		echo "and fix them if necessary before submitting the code for review."; \
	fi

.PHONY: frontend
frontend:
	@echo "=> building frontend ..."
	$(MAKE) -C frontend build

.PHONY: backend/bindata_assetfs.go
backend/bindata_assetfs.go: frontend
	@echo "=> packaging assets ..."
	go-bindata-assetfs -prefix frontend frontend/build/...
	mv -f bindata_assetfs.go backend/

.PHONY: build
build: fmt vet bootstrap frontend backend/bindata_assetfs.go
	$(MAKE) -C backend build

.PHONY: rebuild
rebuild:
	rm -f backend/bindata_assetfs.go
	rm -f backend/build/hashi-ui-darwin-amd64
	$(MAKE) -j build

.PHONY: clean
clean:
	@echo "=> cleaning ..."
	$(MAKE) -C backend clean
	$(MAKE) -C frontend clean
	rm -f backend/bindata_assetfs.go

.PHONY: docker
docker:
	@echo "=> build and push Docker image ..."
	@docker login -e $(DOCKER_EMAIL) -u $(DOCKER_USER) -p $(DOCKER_PASS)
	docker build -f Dockerfile -t jippi/hashi-ui:$(COMMIT) .
	docker tag jippi/hashi-ui:$(COMMIT) jippi/hashi-ui:$(TAG)
	docker push jippi/hashi-ui:$(TAG)
