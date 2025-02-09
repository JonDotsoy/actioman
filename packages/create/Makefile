.PHONY: compile
compile: clean lib/esm

.PHONY: clean
clean: clean//lib/esm

.PHONY: clean//lib/esm
clean//lib/esm:
	rm -rf lib/esm

lib/esm:
	bunx tsc --project tsconfig.esm.json --outDir lib/esm
