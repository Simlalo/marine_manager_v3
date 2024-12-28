interface ImportMeta {
    url: string;
    resolve(specifier: string, parent?: string): Promise<string>;
    metaUrl: string;
    createRequire(url: string): (specifier: string) => Promise<unknown>;
    assert(condition: any, message?: string): asserts condition;
    env: {
        [key: string]: string | undefined; // Adjust types as necessary
    };
}
