build: lib/esm

.PHONY: clean
clean: clean~lib/esm

.PHONY: clean_tests
clean_tests: clean~lib/esm clean~${TMPDIR}__prepare-workspace/

.PHONY: clean~lib/esm
clean~lib/esm:
	rm -rf lib/esm

lib/esm:
	bunx tsc --project tsconfig.esm.json --outDir lib/esm

.PHONY: clean~${TMPDIR}__prepare-workspace/
clean~${TMPDIR}__prepare-workspace/:
	rm -rf ${TMPDIR}__prepare-workspace/
