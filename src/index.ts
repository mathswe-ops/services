// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { AutoRouter, cors } from "itty-router";
import { getCorsOrigin } from "./mathswe-client/req/client/client-req";
import { handleVersionBadge } from "./app/badge/version";
import { handleProjectBadge } from "./app/badge/project";

export interface Env {
}

const { preflight, corsify } = cors({
    origin: getCorsOrigin,
    allowMethods: ["GET"],
});

const router = AutoRouter({
    before: [preflight],
    finally: [corsify],
});

router
    .get("/", () => (new Response("MathSwe Ops Services")))
    .get("/badge/version/:gitPlatform/:user/:repo", handleVersionBadge)
    .get("/badge/project/:project", handleProjectBadge);

export default router;
