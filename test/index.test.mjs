import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";

import { Timber, DebugTree, Tree, Level } from "../lib/index.js";

describe("Timber", () => {
  afterEach(() => {
    Timber.uprootAll();
  });

  test("plant() should add one tree", () => {
    assert.equal(Timber.treeCount(), 0);

    Timber.plant(new Tree());

    assert.equal(Timber.treeCount(), 1);
  });

  test("uproot() should remove one tree", () => {
    const tree = new Tree();
    Timber.plant(tree);
    assert.equal(Timber.treeCount(), 1);

    Timber.uproot(tree);

    assert.equal(Timber.treeCount(), 0);
  });

  test("uproot() should remove multiple trees", () => {
    const tree1 = new Tree();
    const tree2 = new Tree();
    Timber.plant(tree1);
    Timber.plant(tree2);
    assert.equal(Timber.treeCount(), 2);

    Timber.uproot(tree1, tree2);

    assert.equal(Timber.treeCount(), 0);
  });

  test("uprootAll() should remove all trees", () => {
    const trees = [new Tree(), new Tree(), new Tree()];
    trees.forEach((tree) => Timber.plant(tree));
    assert.equal(Timber.treeCount(), trees.length);

    Timber.uprootAll();

    assert.equal(Timber.treeCount(), 0);
  });

  test("tag() should call setTag() on all trees", (t) => {
    const trees = [new Tree(), new Tree()];
    const mockSetTags = trees.map((tree) => t.mock.method(tree, "setTag"));
    trees.forEach((tree) => Timber.plant(tree));
    const tag = "tag";

    Timber.tag(tag);

    mockSetTags.forEach((mockSetTag) => {
      assert.equal(mockSetTag.mock.callCount(), 1);
      const call = mockSetTag.mock.calls[0];
      assert.deepEqual(call.arguments, [tag]);
    });
  });

  test(
    "[level]() should call [level]() on all trees",
    { concurrency: true },
    (t) => {
      class CustomTree extends Tree {
        log() {}
      }
      [Level.Debug, Level.Info, Level.Warn, Level.Error].forEach((level) => {
        t.test(level, () => {
          const trees = [new CustomTree(), new CustomTree()];
          const mockLevels = trees.map((tree) => t.mock.method(tree, level));
          trees.forEach((tree) => Timber.plant(tree));
          const message = "whatever";

          Timber[level](message);

          mockLevels.forEach((mockLevel) => {
            assert.equal(mockLevel.mock.callCount(), 1);
            const call = mockLevel.mock.calls[0];
            assert.deepEqual(call.arguments, [message]);
          });
        });
      });
    },
  );
});

describe("Tree", () => {
  class CustomTree extends Tree {
    log() {}
  }
  let tree;

  beforeEach(() => {
    tree = new CustomTree();
  });

  test("debug() should call prepareLog", (t) => {
    const mockPrepareLog = t.mock.method(tree, "prepareLog");
    const message = "whatever";

    tree.debug(message);

    assert.equal(mockPrepareLog.mock.callCount(), 1);
    const call = mockPrepareLog.mock.calls[0];
    assert.deepEqual(call.arguments, [Level.Debug, message]);
  });

  test("info() should call prepareLog", (t) => {
    const mockPrepareLog = t.mock.method(tree, "prepareLog");
    const message = "whatever";

    tree.info(message);

    assert.equal(mockPrepareLog.mock.callCount(), 1);
    const call = mockPrepareLog.mock.calls[0];
    assert.deepEqual(call.arguments, [Level.Info, message]);
  });

  test("warn() should call prepareLog", (t) => {
    const mockPrepareLog = t.mock.method(tree, "prepareLog");
    const message = "whatever";

    tree.warn(message);

    assert.equal(mockPrepareLog.mock.callCount(), 1);
    const call = mockPrepareLog.mock.calls[0];
    assert.deepEqual(call.arguments, [Level.Warn, message]);
  });

  test("error() should call prepareLog", (t) => {
    const mockPrepareLog = t.mock.method(tree, "prepareLog");
    const message = "whatever";

    tree.error(message);

    assert.equal(mockPrepareLog.mock.callCount(), 1);
    const call = mockPrepareLog.mock.calls[0];
    assert.deepEqual(call.arguments, [Level.Error, message]);
  });

  test("getTag() should retrieve value set by setTag()", () => {
    assert.equal(tree.getTag(), undefined);
    const tag = "tag";
    tree.setTag(tag);

    assert.equal(tree.getTag(), tag);
  });

  test("isLoggable() should return true by default", () => {
    assert.equal(tree.isLoggable(), true);
  });

  test("prepareLog() should call getTag() then clear tag", (t) => {
    const tag = "tag";
    tree.setTag(tag);
    const mockGetTag = t.mock.method(tree, "getTag");

    tree.prepareLog();

    assert.equal(mockGetTag.mock.callCount(), 1);
    assert.equal(tree.getTag(), undefined);
  });

  test("prepareLog() should call isLoggable()", (t) => {
    const tag = "tag",
      level = Level.Debug;
    const mockIsLoggable = t.mock.method(tree, "isLoggable");
    tree.setTag(tag);

    tree.prepareLog(level);

    assert.equal(mockIsLoggable.mock.callCount(), 1);
    const call = mockIsLoggable.mock.calls[0];
    assert.deepEqual(call.arguments, [level, tag]);
  });

  test("prepareLog() should call log() if isLoggable() returns true", (t) => {
    const level = Level.Debug,
      message = "whatever";
    const mockIsLoggable = t.mock.method(tree, "isLoggable");
    mockIsLoggable.mock.mockImplementation(() => true);
    const mockLog = t.mock.method(tree, "log");

    tree.prepareLog(level, message);

    assert.equal(mockLog.mock.callCount(), 1);
    const call = mockLog.mock.calls[0];
    assert.deepEqual(call.arguments, [level, undefined, message]);
  });

  test("prepareLog() should NOT call log() if isLoggable() returns false", (t) => {
    const mockIsLoggable = t.mock.method(tree, "isLoggable");
    mockIsLoggable.mock.mockImplementation(() => false);
    const mockLog = t.mock.method(tree, "log");

    tree.prepareLog();

    assert.equal(mockLog.mock.callCount(), 0);
  });
});

describe("DebugTree", () => {
  let tree;

  beforeEach(() => {
    tree = new DebugTree();
  });

  test("log(tag) should call console with tag", { concurrency: true }, (t) => {
    [Level.Debug, Level.Info, Level.Warn, Level.Error].forEach((level) => {
      t.test(level, () => {
        const tag = "tag",
          message = "whatever";
        const mockConsole = t.mock.method(console, level);
        mockConsole.mock.mockImplementation(() => {});

        tree.log(level, tag, message);

        assert.equal(mockConsole.mock.callCount(), 1);
        const call = mockConsole.mock.calls[0];
        assert.deepEqual(call.arguments, [`[${tag}]`, message]);
      });
    });
  });

  test("log() should call console without tag", { concurrency: true }, (t) => {
    [Level.Debug, Level.Info, Level.Warn, Level.Error].forEach((level) => {
      t.test(level, () => {
        const message = "whatever";
        const mockConsole = t.mock.method(console, level);
        mockConsole.mock.mockImplementation(() => {});

        tree.log(level, undefined, message);

        assert.equal(mockConsole.mock.callCount(), 1);
        const call = mockConsole.mock.calls[0];
        assert.deepEqual(call.arguments, [message]);
      });
    });
  });
});
