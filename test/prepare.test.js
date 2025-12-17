import test from "ava";
import { EventEmitter } from "node:events";

/* eslint camelcase: ["error", {properties: "never"}] */

const prepareModulePromise = import("../lib/prepare.js");

function createSpawnStub(sequence = []) {
  const calls = [];
  const stub = (command, args = [], options = {}) => {
    const emitter = new EventEmitter();
    const response = sequence[calls.length] || {};
    calls.push({ command, args, options });
    setImmediate(() => {
      if (response.error) {
        emitter.emit("error", response.error);
      } else {
        emitter.emit("exit", response.code ?? 0);
      }
    });
    return emitter;
  };
  stub.calls = calls;
  return stub;
}

async function withPrepare(t, sequence, assertions, options = {}) {
  const {
    default: prepare,
    __setSpawnImplementation,
    __resetSpawnImplementation,
    DEBIAN_MARKER,
  } = await prepareModulePromise;
  const spawnStub = createSpawnStub(sequence);
  __setSpawnImplementation(spawnStub);
  const context = { logger: t.context.logger };
  try {
    const constants = { debianMarker: DEBIAN_MARKER };
    await assertions({ prepare, spawnStub, context, pluginConfig: options.pluginConfig || {}, constants });
  } finally {
    __resetSpawnImplementation();
  }
}

function assertInstallFlow(t, calls, constants, expectedCommand, expectedArgs) {
  t.deepEqual(
    calls.map((c) => c.command),
    ["test", expectedCommand]
  );
  t.deepEqual(calls[0].args, ["-f", constants.debianMarker]);
  t.deepEqual(calls[1].args, expectedArgs);
}

test.beforeEach((t) => {
  // Mock logger
  t.context.logger = new (class {
    log(msg) {
      if (process.env.DEBUG && /^semantic-release:(\*|whmcs)$/.test(process.env.DEBUG)) {
        console.log(msg);
      }
    }

    error(msg, details) {
      console.error(msg + " " + details);
    }
  })();
});

test.serial("Prepare skips OS deps when configured", async (t) => {
  await withPrepare(t, [], async ({ prepare, spawnStub, context }) => {
    await prepare({ skipOsDeps: true }, context);
    t.is(spawnStub.calls.length, 0);
  });
});

test.serial("Prepare skips installation on non-Debian systems", async (t) => {
  await withPrepare(t, [{ code: 1 }], async ({ prepare, spawnStub, context }) => {
    await prepare({}, context);
    t.is(spawnStub.calls.length, 1);
    t.is(spawnStub.calls[0].command, "test");
  });
});

test.serial("Prepare continues when installer fails", async (t) => {
  await withPrepare(t, [{ code: 0 }, { code: 0 }, { code: 1 }], async ({ prepare, spawnStub, context }) => {
    await prepare({}, context);
    t.is(spawnStub.calls.length, 3);
    t.is(spawnStub.calls[0].command, "test");
    t.is(spawnStub.calls[1].command, "sudo");
    t.deepEqual(spawnStub.calls[1].args, ["apt-get", "update"]);
    t.is(spawnStub.calls[2].command, "sudo");
    t.deepEqual(spawnStub.calls[2].args, ["apt-get", "install", "-y", "google-chrome-stable"]);
  });
});

test.serial("Prepare installs dependencies on Debian systems", async (t) => {
  await withPrepare(t, [{ code: 0 }, { code: 0 }, { code: 0 }], async ({ prepare, spawnStub, context }) => {
    await prepare({}, context);
    t.is(spawnStub.calls.length, 3);
    t.is(spawnStub.calls[0].command, "test");
    t.is(spawnStub.calls[1].command, "sudo");
    t.deepEqual(spawnStub.calls[1].args, ["apt-get", "update"]);
    t.is(spawnStub.calls[2].command, "sudo");
    t.deepEqual(spawnStub.calls[2].args, ["apt-get", "install", "-y", "google-chrome-stable"]);
  });
});
