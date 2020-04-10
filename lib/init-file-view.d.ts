import { View } from "atom-space-pen-views";
export declare class InitFileView extends View {
    static content(): void;
    initialize({ uri, file }: {
        uri: any;
        file: any;
    }): void;
    destroy(): void;
    getURI(): any;
    getTitle(): string;
    getIconName(): string;
    updateContent(): void;
    addPackage({ name, action }: {
        name: any;
        action: any;
    }): void;
    save(): void;
}
