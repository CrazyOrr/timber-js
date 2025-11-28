/**
 * Timber is a logging facade for JavaScript, inspired by Timber for Android.
 *
 * @remarks
 * Install instances of {@link Tree} via {@link Timber.plant | Timber.plant()} to handle the logging calls issued by {@link Timber.debug | Timber.debug()}, {@link Timber.error | Timber.error()}, etc.
 *
 * @packageDocumentation
 */

/**
 * Log levels
 *
 * @public
 */
export enum Level {
  /**
   * Debug level log.
   */
  Debug = "debug",

  /**
   * Info level log.
   */
  Info = "info",

  /**
   * Warn level log.
   */
  Warn = "warn",

  /**
   * Error level log.
   */
  Error = "error",
}

/**
 * A facade for handling logging calls.
 *
 * @public
 */
export abstract class Tree {
  private tag?: string;

  /**
   * Log a debug message.
   *
   * @param message - The message to log.
   * @param optionalParams - Additional parameters to log.
   */
  debug(message?: unknown, ...optionalParams: unknown[]): void {
    this.prepareLog(Level.Debug, message, ...optionalParams);
  }

  /**
   * Log an info message.
   *
   * @param message - The message to log.
   * @param optionalParams - Additional parameters to log.
   */
  info(message?: unknown, ...optionalParams: unknown[]): void {
    this.prepareLog(Level.Info, message, ...optionalParams);
  }

  /**
   * Log a warning message.
   *
   * @param message - The message to log.
   * @param optionalParams - Additional parameters to log.
   */
  warn(message?: unknown, ...optionalParams: unknown[]): void {
    this.prepareLog(Level.Warn, message, ...optionalParams);
  }

  /**
   * Log an error message.
   *
   * @param message - The message to log.
   * @param optionalParams - Additional parameters to log.
   */
  error(message?: unknown, ...optionalParams: unknown[]): void {
    this.prepareLog(Level.Error, message, ...optionalParams);
  }

  /**
   * Set a one-time tag for use on the next logging call.
   *
   * @param tag - The tag for logging, providing additional context.
   */
  public setTag(tag: string): void {
    this.tag = tag;
  }

  /**
   * Get the tag for the next logging call.
   *
   * @returns The tag for the next logging call, or undefined if no tag is set.
   */
  protected getTag(): string | undefined {
    const tag = this.tag;
    return tag;
  }

  /**
   * Return whether a message with given `level` and `tag` should be logged.
   *
   * @param level - Log's {@link Level | level}.
   * @param tag - Log's tag.
   * @returns Whether the message should be logged.
   *
   * @virtual
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected isLoggable(level: Level, tag?: string) {
    return true;
  }

  /**
   * Log a message with the given `level`, `tag`, `message`, and `optional parameters`.
   *
   * @param level - Log's {@link Level | level}.
   * @param tag - Log's tag.
   * @param message - Log's message.
   * @param optionalParams - Log's optional parameters.
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
 * A {@link Tree} for dispatching logs, as {@link Timber.treeOfSouls}.
 */
class DispatcherTree extends Tree {
  constructor(private forest: Tree[]) {
    super();
  }

  protected log(
    level: Level,
    tag?: string,
    message?: unknown,
    ...optionalParams: unknown[]
  ): void {
    this.forest.forEach((tree) => {
      tree[level](message, ...optionalParams);
    });
  }
}

/**
 * A {@link Tree} for debugging. All logs go to `console`.
 *
 * @public
 */
export class DebugTree extends Tree {
  /**
   * {@inheritDoc Tree.log}
   *
   * @override
   */
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

/**
 * A static class for logging via planted {@link Tree | trees}.
 *
 * @public
 */
export class Timber {
  private static forest: Tree[] = [];
  /**
   * A {@link Tree} that delegates to all planted trees in the {@link Timber.forest}.
   */
  private static treeOfSouls = new DispatcherTree(Timber.forest);

  private constructor() {
    throw new Error("No instances.");
  }

  /**
   * Log a debug message.
   *
   * @param message - The message to log.
   * @param optionalParams - Additional parameters to log.
   */
  static debug(message?: unknown, ...optionalParams: unknown[]): void {
    Timber.log(Level.Debug, message, ...optionalParams);
  }

  /**
   * Log an info message.
   *
   * @param message - The message to log.
   * @param optionalParams - Additional parameters to log.
   */
  static info(message?: unknown, ...optionalParams: unknown[]): void {
    Timber.log(Level.Info, message, ...optionalParams);
  }

  /**
   * Log a warning message.
   *
   * @param message - The message to log.
   * @param optionalParams - Additional parameters to log.
   */
  static warn(message?: unknown, ...optionalParams: unknown[]): void {
    Timber.log(Level.Warn, message, ...optionalParams);
  }

  /**
   * Log an error message.
   *
   * @param message - The message to log.
   * @param optionalParams - Additional parameters to log.
   */
  static error(message?: unknown, ...optionalParams: unknown[]): void {
    Timber.log(Level.Error, message, ...optionalParams);
  }

  /**
   * Set a one-time tag for use on the next logging call.
   *
   * @param tag - The tag for logging.
   */
  static tag(tag: string): Tree {
    Timber.forest.forEach((tree) => {
      tree.setTag(tag);
    });
    return Timber.treeOfSouls;
  }

  /**
   * Add new logging {@link Tree | trees}.
   *
   * @param trees - Logging {@link Tree | tree} implementations.
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
   * Remove planted {@link Tree | trees}.
   *
   * @param trees - Logging {@link Tree | tree} implementations.
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
   * Remove all planted {@link Tree | trees}.
   */
  static uprootAll(): void {
    Timber.forest.splice(0, Timber.treeCount());
  }

  /**
   * Return the number of planted {@link Tree | trees}.
   *
   * @returns The number of planted {@link Tree | trees}.
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
