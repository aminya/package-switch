import { SelectListView } from "atom-space-pen-views";
export declare class BundlesView extends SelectListView {
    initialize(): any;
    viewForItem({ name, actions }: {
        name: any;
        actions: any;
    }): any;
    confirmed(bundle: any): any;
    cancelled(): any;
    show(bundles: any, cb: any, opposite?: boolean): any;
    getFilterKey(): string;
}
