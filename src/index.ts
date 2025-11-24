/**
 * Log levels
 */
export enum Level {
  Debug = "debug",
  Info = "info",
  Warn = "warn",
  Error = "error",
}

/**
 * A facade for handling logging calls. Install instances via {@link plant Timber.plant()}.
 */
export abstract class Tree {
  private tag?: string;

  debug(message?: unknown, ...optionalParams: unknown[]): void {
    this.prepareLog(Level.Debug, message, ...optionalParams);
  }

  info(message?: unknown, ...optionalParams: unknown[]): void {
    this.prepareLog(Level.Info, message, ...optionalParams);
  }

  warn(message?: unknown, ...optionalParams: unknown[]): void {
    this.prepareLog(Level.Warn, message, ...optionalParams);
  }

  error(message?: unknown, ...optionalParams: unknown[]): void {
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
  protected getTag(): string | undefined {
    const tag = this.tag;
    return tag;
  }

  /**
   * Return whether a message at {@code level} or {@code tag} should be logged.
   * @param level
   * @param tag
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  protected abstract log(
    level: Level,
    tag?: string,
    message?: unknown,
    ...optionalParams: unknown[]
  ): void;

  private prepareLog(
    level: Level,
    message?: unknown,
    ...optionalParams: unknown[]
  ): void {
    const tag = this.getTag();
    // tag is just for one time
    delete this.tag;
    if (!this.isLoggable(level, tag)) {
      return;
    }
    this.log(level, tag, message, ...optionalParams);
  }
}

/**
 * A {@link Tree} for dispatching logs, as {@link treeOfSouls}.
 */
class DispatcherTree extends Tree {
  constructor(private forest: Tree[]) {
    super();
  }

  debug(message?: unknown, ...optionalParams: unknown[]): void {
    this.dispatchLog(Level.Debug, message, ...optionalParams);
  }

  info(message?: unknown, ...optionalParams: unknown[]): void {
    this.dispatchLog(Level.Info, message, ...optionalParams);
  }

  warn(message?: unknown, ...optionalParams: unknown[]): void {
    this.dispatchLog(Level.Warn, message, ...optionalParams);
  }

  error(message?: unknown, ...optionalParams: unknown[]): void {
    this.dispatchLog(Level.Error, message, ...optionalParams);
  }

  protected log(
    /* eslint-disable @typescript-eslint/no-unused-vars */
    level: Level,
    tag?: string,
    message?: unknown,
    ...optionalParams: unknown[]
    /* eslint-enable  @typescript-eslint/no-unused-vars */
  ): void {
    throw new Error("Missing override for log method.");
  }

  private dispatchLog(
    method: Level,
    message?: unknown,
    ...optionalParams: unknown[]
  ): void {
    this.forest.forEach((tree) => {
      tree[method](message, ...optionalParams);
    });
  }
}

/**
 * A {@link Tree Tree} for debug builds. All logs go to console.
 */
export class DebugTree extends Tree {
  protected log(
    level: Level,
    tag?: string,
    message?: unknown,
    ...optionalParams: unknown[]
  ): void {
    let method: keyof Tree;
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

export class Timber {
  private static forest: Tree[] = [];
  /**
   * A {@link Tree} that delegates to all planted trees in the {@link forest}.
   */
  private static treeOfSouls = new DispatcherTree(Timber.forest);

  private constructor() {
    throw new Error("No instances.");
  }

  static debug(message?: unknown, ...optionalParams: unknown[]): void {
    Timber.log(Level.Debug, message, ...optionalParams);
  }

  static info(message?: unknown, ...optionalParams: unknown[]): void {
    Timber.log(Level.Info, message, ...optionalParams);
  }

  static warn(message?: unknown, ...optionalParams: unknown[]): void {
    Timber.log(Level.Warn, message, ...optionalParams);
  }

  static error(message?: unknown, ...optionalParams: unknown[]): void {
    Timber.log(Level.Error, message, ...optionalParams);
  }

  /**
   * Set a one-time tag for use on the next logging call.
   * @param tag The tag for logging.
   */
  static tag(tag: string): Tree {
    Timber.forest.forEach((tree) => {
      tree.setTag(tag);
    });
    return Timber.treeOfSouls;
  }

  /**
   * Adds new logging {@link Tree trees}.
   * @param trees Logging {@link Tree tree} implementations.
   */
  static plant(...trees: Tree[]): void {
    trees.forEach((tree) => {
      if (tree === undefined || tree === null) {
        throw new Error("trees contains undefined or null");
      }
      if (tree === Timber.treeOfSouls) {
        throw new Error("Cannot plant Timber into itself.");
      }
      Timber.forest.push(tree);
    });
  }

  /**
   * Remove planted {@link Tree trees}.
   * @param trees Logging {@link Tree tree} implementations.
   */
  static uproot(...trees: Tree[]): void {
    trees.forEach((tree) => {
      const index = Timber.forest.indexOf(tree);
      if (index === -1) {
        throw new Error("Cannot uproot tree which is not planted.");
      } else {
        Timber.forest.splice(index, 1);
      }
    });
  }

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

  private static log(
    method: Level,
    message?: unknown,
    ...optionalParams: unknown[]
  ): void {
    Timber.treeOfSouls[method](message, ...optionalParams);
  }
}
