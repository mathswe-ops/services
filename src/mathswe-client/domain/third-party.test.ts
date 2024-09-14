// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { describe, expect, it } from "vitest";
import { thirdPartyToDomainName } from "./third-party";

describe("thirdPartyToDomainName", () => {
    it("should return the correct domain name for GitHubCom", () => {
        const result = thirdPartyToDomainName.toDomainName("GitHubCom");

        expect(result).toBe("github.com");
    });
});
