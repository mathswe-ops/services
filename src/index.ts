// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { AutoRouter, cors } from "itty-router";

export interface Env {
}

const { preflight, corsify } = cors({
    allowMethods: ["GET"],
});

const router = AutoRouter({
    before: [preflight],
    finally: [corsify],
});

router
    .get("/", () => (new Response("Hello World!")));

export default router;
