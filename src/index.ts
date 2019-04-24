/**
 * Log levels
 */
export enum Level {
    Debug,
    Info,
    Warn,
    Error,
}

/**
 * A facade for handling logging calls. Install instances via {@link plant Timber.plant()}.
 */
export abstract class Tree {
    private tag: string;

    debug(message?: any, ...optionalParams: any[]): void {
        this.prepareLog(Level.Debug, message, ...optionalParams);
    }

    info(message?: any, ...optionalParams: any[]): void {
        this.prepareLog(Level.Info, message, ...optionalParams);
    }

    warn(message?: any, ...optionalParams: any[]): void {
        this.prepareLog(Level.Warn, message, ...optionalParams);
    }

    error(message?: any, ...optionalParams: any[]): void {
        this.prepareLog(Level.Error, message, ...optionalParams);
    }

    /**
     * Set a one-time tag for use on the next logging call.
     * @param tag The tag for logging.
     */
    public setTag(tag: string): void {
        this.tag = tag;
    }

    /**
     * Retrieve the tag then clear it for one-time use
     */
    protected getTag(): string {
        let tag = this.tag;
        // tag is just for one time
        this.tag = null;
        return tag;
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Return whether a message at {@code level} or {@code tag} should be logged.
     * @param level
     * @param tag
     */
    protected isLoggable(level: Level, tag?: string) {
        return true;
    }

    /**
     * Write a log message to its destination. Called for all level-specific methods by default.
     * @param level Log's {@link Level level}.
     * @param tag Log's tag.
     * @param message Log's message.
     * @param optionalParams Log's optionalParams.
     */
    protected abstract log(level: Level, tag?: string, message?: any, ...optionalParams: any[]): void;

    private prepareLog(level, message?: any, ...optionalParams: any[]): void {
        let tag = this.getTag();
        if (!this.isLoggable(level, tag)) {
            return;
        }
        this.log(level, tag, message, ...optionalParams);
    }
}

/**
 * A {@link Tree Tree} for dispatching logs, as {@link treeOfSouls}.
 */
class DispatcherTree extends Tree {

    constructor(private forest: Tree[]) {
        super();
    }

    debug(message?: any, ...optionalParams: any[]): void {
        this.dispatchLog("debug", message, ...optionalParams);
    }

    info(message?: any, ...optionalParams: any[]): void {
        this.dispatchLog("info", message, ...optionalParams);
    }

    warn(message?: any, ...optionalParams: any[]): void {
        this.dispatchLog("warn", message, ...optionalParams);
    }

    error(message?: any, ...optionalParams: any[]): void {
        this.dispatchLog("error", message, ...optionalParams);
    }

    protected log(level: Level, tag?: string, message?: any, ...optionalParams: any[]): void {
        throw new Error("Missing override for log method.");
    }

    private dispatchLog(method: string, message?: any, ...optionalParams: any[]): void {
        this.forest.forEach(tree => {
            tree[method](message, ...optionalParams);
        });
    }
}

// noinspection JSUnusedGlobalSymbols
/**
 * A {@link Tree Tree} for debug builds. All logs go to console.
 */
export class DebugTree extends Tree {
    protected log(level: Level, tag?: string, message?: any, ...optionalParams: any[]): void {
        let method;
        switch (level) {
            case Level.Info:
                method = "info";
                break;
            case Level.Warn:
                method = "warn";
                break;
            case Level.Error:
                method = "error";
                break;
            case Level.Debug:
            default:
                method = "debug";
                break;
        }
        if (tag) {
            console[method](`[${tag}]`, message, ...optionalParams);
        } else {
            console[method](message, ...optionalParams);
        }
    }
}

// noinspection JSUnusedGlobalSymbols
export class Timber {
    private static forest: Tree[] = [];
    /**
     * A {@link Tree} that delegates to all planted trees in the {@link forest}.
     */
    private static treeOfSouls = new DispatcherTree(Timber.forest);

    // noinspection JSUnusedLocalSymbols
    private constructor() {
        throw new Error("No instances.");
    }

    static debug(message?: any, ...optionalParams: any[]): void {
        Timber.log("debug", message, ...optionalParams);
    }

    static info(message?: any, ...optionalParams: any[]): void {
        Timber.log("info", message, ...optionalParams);
    }

    static warn(message?: any, ...optionalParams: any[]): void {
        Timber.log("warn", message, ...optionalParams);
    }

    static error(message?: any, ...optionalParams: any[]): void {
        Timber.log("error", message, ...optionalParams);
    }

    /**
     * Set a one-time tag for use on the next logging call.
     * @param tag The tag for logging.
     */
    static tag(tag: string): Tree {
        Timber.forest.forEach(tree => {
            tree.setTag(tag);
        });
        return Timber.treeOfSouls;
    }

    /**
     * Adds new logging {@link Tree trees}.
     * @param trees Logging {@link Tree tree} implementations.
     */
    static plant(...trees: Tree[]): void {
        trees.forEach(tree => {
            if (tree === undefined || tree === null) {
                throw new Error("trees contains undefined or null");
            }
            if (tree === Timber.treeOfSouls) {
                throw new Error("Cannot plant Timber into itself.");
            }
            Timber.forest.push(tree);
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Remove planted {@link Tree trees}.
     * @param trees Logging {@link Tree tree} implementations.
     */
    static uproot(...trees: Tree[]): void {
        trees.forEach(tree => {
            let index = Timber.forest.indexOf(tree);
            if (index === -1) {
                throw new Error("Cannot uproot tree which is not planted.");
            } else {
                Timber.forest.splice(index, 1);
            }
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Remove all planted {@link Tree trees}.
     */
    static uprootAll(): void {
        Timber.forest.splice(0, Timber.treeCount());
    }

    /**
     * Returns the number of planted {@link Tree trees}.
     */
    static treeCount(): number {
        return Timber.forest.length;
    }

    private static log(method: string, message?: any, ...optionalParams: any[]): void {
        Timber.treeOfSouls[method](message, ...optionalParams);
    }
}
