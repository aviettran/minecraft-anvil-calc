declare module "*.json" {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value: any;
    export default value;
}

declare module 'workerize-loader!*' {
    const worker: () => {
        terminate: () => void,
        combineItemsExecute: (items: Array<import("./models").ItemData>, settings: import("./models").Settings) => Promise<import("./utils/item").AnvilResults | import("./utils/item").CombineItemsError>
    };
    export = worker
}
