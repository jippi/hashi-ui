.PHONY: frontend
frontend:
	@echo "=> building frontend ..."
	$(MAKE) -C frontend build

.PHONY: backend
backend:
	$(MAKE) -C backend build

.PHONY: build
build: frontend backend backend/bindata_assetfs.go

.PHONY: rebuild
rebuild: clean
	$(MAKE) -j build

.PHONY: clean
clean:
	@echo "=> cleaning ..."
	$(MAKE) -C backend clean
	$(MAKE) -C frontend clean
	rm -f backend/bindata_assetfs.go

PHONY: dist-clean
dist-clean:
	@echo "=> dist-cleaning ..."
	$(MAKE) -C backend dist-clean
	$(MAKE) -C frontend dist-clean
	rm -f backend/bindata_assetfs.go

.PHONY: docker
docker:
	@echo "=> build and push Docker image ..."
	@docker login -e $(DOCKER_EMAIL) -u $(DOCKER_USER) -p $(DOCKER_PASS)
	docker build -f Dockerfile -t jippi/hashi-ui:$(COMMIT) .
	docker tag jippi/hashi-ui:$(COMMIT) jippi/hashi-ui:$(TAG)
	docker push jippi/hashi-ui:$(TAG)
