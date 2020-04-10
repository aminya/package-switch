export declare function activate(): void;
export declare function deactivate(): void;
export declare const config: {
    SaveRestore: {
        title: string;
        description: string;
        type: string;
        default: boolean;
    };
    SaveData: {
        title: string;
        description: string;
        type: string;
        default: never[];
    };
    DeferInitialization: {
        title: string;
        description: string;
        type: string;
        default: number;
    };
    InvertSaveData: {
        title: string;
        description: string;
        type: string;
        default: boolean;
    };
    DisableLanguagePackages: {
        title: string;
        description: string;
        type: string;
        default: boolean;
    };
};
