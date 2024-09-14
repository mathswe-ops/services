// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { describe, expect, it } from "vitest";
import { mathsweToDomainName } from "./mathswe";

describe("mathsweToDomainName", () => {
    it("should return the correct domain name for MathSweCom", () => {
        const result = mathsweToDomainName.toDomainName("MathSweCom");

        expect(result).toBe("mathswe.com");
    });

    it("should return the correct domain name for MathSoftware", () => {
        const result = mathsweToDomainName.toDomainName("MathSoftware");

        expect(result).toBe("math.software");
    });

    it("should return the correct domain name for MathSoftwareEngineer", () => {
        const result = mathsweToDomainName.toDomainName("MathSoftwareEngineer");

        expect(result).toBe("mathsoftware.engineer");
    });
});
