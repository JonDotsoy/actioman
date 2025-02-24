CONTAINER_TEST_HASH := $(shell cat compose.yml | shasum -a 256 | awk '{print $$1}')
TEST_ARG :=

build: lib/esm

.PHONY: clean
clean:
	rm -rf lib/esm

lib/esm:
	bunx tsc --project tsconfig.esm.json --outDir lib/esm

/tmp/.process.${CONTAINER_TEST_HASH}.actioman-test.json:
	docker compose up test -d --build
	docker compose ps test --format json | jq > $@

.PHONY: clean@docker
clean@docker:
	rm -rf /tmp/.process.${CONTAINER_TEST_HASH}.actioman-test.json

.PHONY: test@docker
test@docker: /tmp/.process.${CONTAINER_TEST_HASH}.actioman-test.json
	$(eval CONTAINER_TEST_ID=$(shell cat /tmp/.process.${CONTAINER_TEST_HASH}.actioman-test.json | jq '.Name' -r))
	docker exec ${CONTAINER_TEST_ID} bash -i -c "bun i"
	docker exec ${CONTAINER_TEST_ID} bash -i -c "bun test ${TEST_ARG}"
