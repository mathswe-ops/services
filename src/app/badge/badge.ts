// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { Left } from "fp-ts/Either";
import { error } from "itty-router";

export type Kv = [string, string];

export type RawKv = [string, string | undefined];

export function domainErrorToIttyError(left: Left<string>): Response {
    const msg = left.left;
    const possibleReasons = [
        { reason: "Not Found", code: 404 },
        { reason: "Repository has no tags", code: 404 },
        { reason: "Fail to find a build system", code: 404 },
        { reason: "GitHub API error", code: 502 },
        { reason: "Fail to read project files", code: 500 },
        { reason: "Failed to fetch files", code: 502 },
        { reason: "GitHub User Content error", code: 500 },
        { reason: "Version field not found", code: 400 },
        { reason: "Failed to parse", code: 400 },
    ];

    const matchedReason = possibleReasons
        .find(({ reason }) => msg.includes(reason));

    const code = matchedReason ? matchedReason.code : 500;

    return error(code, msg);
}
