// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import type { UnstableDevWorker } from "wrangler";
import { unstable_dev } from "wrangler";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("Worker", () => {
    let worker: UnstableDevWorker;

    beforeAll(async () => {
        worker = await unstable_dev("src/index.ts", {
            experimental: { disableExperimentalWarning: true },
        });
    });

    afterAll(async () => {
        await worker.stop();
    });

    it("should return 200 response", async () => {
        const resp = await worker.fetch();

        expect(resp.status).toBe(200);
    });

    it("should return the text Hello World!", async () => {
        const resp = await worker.fetch();
        const text = await resp.text();

        expect(text).toBe("Hello World!");
    });
});
