const { Timber, DebugTree } = require("../lib");

Timber.plant(new DebugTree());

Timber.debug("debug");
Timber.info("info");
Timber.warn("warn");
Timber.error("error");

Timber.tag("tag1").debug("debug");
Timber.tag("tag2").info("info");
Timber.tag("tag3").warn("warn");
Timber.tag("tag4").error("error");
