build: lib/esm

.PHONY: clean
clean:
	rm -rf lib/esm

lib/esm:
	bunx tsc --project tsconfig.esm.json --outDir lib/esm
