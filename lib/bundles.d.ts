export declare class Bundles {
    filename: null;
    data: {};
    single_bundles: {};
    project_bundles: {};
    writing: boolean;
    constructor(arg?: any);
    destroy(): void;
    reload(event?: any, filename?: any): void;
    getFileName(): void;
    onFileChange(callback: any): void;
    getData(): void;
    getPackages(): void;
    setData(emit?: boolean): void;
    notify(message?: any): void;
    touchFile(): void;
    addBundle(name: any, packages: any): void;
    replaceBundle(oldname: any, name: any, packages: any): void;
    removeBundle(bundle: any): void;
    getBundle(bundle: any): any;
    getBundles(singles?: boolean): any[];
}
