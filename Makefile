VETARGS?=-all
EXTERNAL_TOOLS=\
	github.com/kardianos/govendor \
	github.com/jteeuwen/go-bindata/... \
	github.com/elazarl/go-bindata-assetfs/...

GOFILES_NOVENDOR = $(shell find . -type f -name '*.go' -not -path "./backend/vendor/*")

bootstrap:
	@for tool in $(EXTERNAL_TOOLS); do \
		echo "Installing $$tool" ; \
    go get $$tool; \
	done

fmt:
	@echo "--> Running go fmt" ;
	@if [ -n "`go fmt ${GOFILES_NOVENDOR}`" ]; then \
		echo "[ERR] go fmt updated formatting. Please commit formatted code first."; \
		exit 1; \
	fi

vet:
	@go tool vet 2>/dev/null ; if [ $$? -eq 3 ]; then \
		go get golang.org/x/tools/cmd/vet; \
	fi
	@echo "--> Running go tool vet $(VETARGS) ${GOFILES_NOVENDOR}"
	@go tool vet $(VETARGS) ${GOFILES_NOVENDOR} ; if [ $$? -eq 1 ]; then \
		echo ""; \
		echo "[LINT] Vet found suspicious constructs. Please check the reported constructs"; \
		echo "and fix them if necessary before submitting the code for review."; \
	fi

frontend:
	@echo "=> building frontend ..."
	$(MAKE) -C frontend build

backend/bindata_assetfs.go:
	@echo "=> packaging assets ..."
	go-bindata-assetfs -prefix frontend frontend/build/...
	mv -f bindata_assetfs.go backend/

build: fmt vet bootstrap frontend backend/bindata_assetfs.go
	$(MAKE) -C backend build

clean:
	@echo "=> cleaning ..."
	$(MAKE) -C backend clean
	$(MAKE) -C frontend clean
	rm -f backend/bindata_assetfs.go

docker:
	@echo "=> build and push Docker image ..."
	@docker login -e $(DOCKER_EMAIL) -u $(DOCKER_USER) -p $(DOCKER_PASS)
	docker build -f Dockerfile -t iverberk/nomad-ui:$(COMMIT) .
	docker tag iverberk/nomad-ui:$(COMMIT) iverberk/nomad-ui:$(TAG)
	docker push iverberk/nomad-ui:$(TAG)

.PHONY: docker clean build backend frontend fmt vet
