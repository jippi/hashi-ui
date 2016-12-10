.PHONY: frontend
frontend:
	@echo "=> building frontend ..."
	$(MAKE) -j -C frontend build

.PHONY: backend
backend:
	$(MAKE) -j -C backend build

.PHONY: build
build: frontend backend

.PHONY: rebuild
rebuild: clean
	$(MAKE) -j build

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
	@docker login -e $(DOCKER_EMAIL) -u $(DOCKER_USER) -p $(DOCKER_PASS)
	docker build -f Dockerfile -t jippi/hashi-ui:$(COMMIT) .
	docker tag jippi/hashi-ui:$(COMMIT) jippi/hashi-ui:$(TAG)
	docker push jippi/hashi-ui:$(TAG)
