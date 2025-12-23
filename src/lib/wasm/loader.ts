/**
 * Generic WASM module loader utility
 * Provides type-safe loading for Emscripten-compiled WASM modules
 */

export interface EmscriptenModule {
  ccall: (
    ident: string,
    returnType: string | null,
    argTypes: string[],
    args: (number | string)[]
  ) => number | void;
  cwrap: (
    ident: string,
    returnType: string | null,
    argTypes: string[]
  ) => (...args: (number | string)[]) => number | void;
  onRuntimeInitialized?: () => void;
  locateFile?: (path: string) => string;
  print?: (text: string) => void;
  printErr?: (text: string) => void;
}

export interface WasmLoaderOptions {
  /** Base path where .js and .wasm files are located */
  basePath: string;
  /** Name of the module (without extension) */
  moduleName: string;
  /** Called when module is ready */
  onReady?: (module: EmscriptenModule) => void;
  /** Called on error */
  onError?: (error: Error) => void;
  /** Enable console logging from WASM */
  enableLogging?: boolean;
}

/**
 * Loads a WASM module compiled with Emscripten
 */
export function loadWasmModule(options: WasmLoaderOptions): Promise<EmscriptenModule> {
  const { basePath, moduleName, onReady, onError, enableLogging = false } = options;

  return new Promise((resolve, reject) => {
    // Set up Module configuration before loading script
    const moduleConfig: EmscriptenModule = {
      ccall: () => { throw new Error('Module not initialized'); },
      cwrap: () => { throw new Error('Module not initialized'); },
      locateFile: (path: string) => `${basePath}/${path}`,
      onRuntimeInitialized: function(this: EmscriptenModule) {
        if (onReady) onReady(this);
        resolve(this);
      },
      print: enableLogging ? (text: string) => console.log(`[${moduleName}]`, text) : undefined,
      printErr: enableLogging ? (text: string) => console.error(`[${moduleName}]`, text) : undefined,
    };

    // Expose on window for Emscripten to find
    (window as unknown as Record<string, unknown>).Module = moduleConfig;

    // Load the JS glue code
    const script = document.createElement('script');
    script.src = `${basePath}/${moduleName}.js`;
    script.onerror = () => {
      const err = new Error(`Failed to load WASM module: ${moduleName}`);
      if (onError) onError(err);
      reject(err);
    };
    document.body.appendChild(script);
  });
}
