# Makefile for Premature Optimization Triangle WASM module
# Requires: emscripten (emcc)

SRC = optimization_triangle.cpp
OUT_DIR = ../../../../public/snippets/premature-optimization
OUT_JS = $(OUT_DIR)/optimization_triangle.js
OUT_WASM = $(OUT_DIR)/optimization_triangle.wasm

EMCC_FLAGS = -O3 \
	-s WASM=1 \
	-s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s MODULARIZE=0 \
	-s EXPORT_ES6=0

.PHONY: all clean ensure-dir

all: ensure-dir $(OUT_JS)

ensure-dir:
	@mkdir -p $(OUT_DIR)

$(OUT_JS): $(SRC)
	emcc $(SRC) -o $(OUT_JS) $(EMCC_FLAGS)
	@echo "Built WASM module to $(OUT_DIR)"

clean:
	rm -f $(OUT_JS) $(OUT_WASM)

# Dev target for quick iteration
dev: all
	@echo "WASM module ready at $(OUT_DIR)"
