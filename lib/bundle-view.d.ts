import { SelectListView } from "atom-space-pen-views";
export declare class BundleView extends SelectListView {
    initialize(): any;
    viewForItem({ name, action }: {
        name: any;
        action: any;
    }): any;
    confirmed(): any;
    cancel(): any;
    show(bundle: null | undefined, cb: any): any;
    populateList(view?: null): any;
    getFilterKey(): string;
    isDisabled(): boolean;
    isNeutral(): boolean;
    isEnabled(): boolean;
    setNeutral(): any;
    setEnabled(): any;
    setDisabled(): any;
}
