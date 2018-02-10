.PHONY: frontend
frontend:
	@echo "=> building frontend ..."
	$(MAKE) -j -C frontend build

.PHONY: backend
backend:
	$(MAKE) -j -C backend build
	$(MAKE) -j -C backend test

# Since backend will call the frontend/Makefile when need be, this target will
# just trigger a pure bakcend build
#
.PHONY: build
build: backend

.PHONY: rebuild
rebuild: clean
	$(MAKE) -j build

.PHONY: install
install:
	@echo "=> install ..."
	$(MAKE) -j -C backend install
	$(MAKE) -j -C frontend install

.PHONY: clean
clean:
	@echo "=> cleaning ..."
	$(MAKE) -j -C backend clean
	$(MAKE) -j -C frontend clean

PHONY: dist-clean
dist-clean:
	@echo "=> dist-cleaning ..."
	$(MAKE) -j -C backend dist-clean
	$(MAKE) -j -C frontend dist-clean

.PHONY: docker
docker:
	@echo "=> build and push Docker image ..."
	@docker login -u $(DOCKER_USER) -p $(DOCKER_PASS)
	docker build -f Dockerfile -t jippi/hashi-ui:$(COMMIT) .
	docker tag jippi/hashi-ui:$(COMMIT) jippi/hashi-ui:$(TAG)
	docker push jippi/hashi-ui:$(TAG)
