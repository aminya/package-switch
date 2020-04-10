import { View } from "space-pen";
export declare class NameView extends View {
    nameEditor: null;
    static content(): void;
    constructor();
    destroy(): void;
    cancel(event?: any): void;
    back(event?: any): void;
    accept(event?: any): void;
    validInput(): boolean;
    clearErrors(): void;
    clearPackages(): void;
    showPackages(div: any, packages: any): void;
    show(bundles: any, oldname: any, items: any, { confirmCallback, backCallback }: {
        confirmCallback: any;
        backCallback: any;
    }): void;
}
