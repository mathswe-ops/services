// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { describe, expect, it } from "vitest";
import {
    mathSweDomain,
    OriginDomain, thirdPartyDomain,
    toDomainName,
} from "./origin";

describe("toDomainName", () => {
    it("should return the correct domain name for MathSweCom", () => {
        const domain: OriginDomain = mathSweDomain("MathSweCom");
        const result = toDomainName.toDomainName(domain);

        expect(result).toBe("mathswe.com");
    });

    it("should return the correct domain name for MathSoftware", () => {
        const domain: OriginDomain = mathSweDomain("MathSoftware");
        const result = toDomainName.toDomainName(domain);

        expect(result).toBe("math.software");
    });

    it("should return the correct domain name for MathSoftwareEngineer", () => {
        const domain: OriginDomain = mathSweDomain("MathSoftwareEngineer");
        const result = toDomainName.toDomainName(domain);

        expect(result).toBe("mathsoftware.engineer");
    });

    it("should return the correct domain name for GitHubCom", () => {
        const domain: OriginDomain = thirdPartyDomain("GitHubCom");
        const result = toDomainName.toDomainName(domain);

        expect(result).toBe("github.com");
    });
});
