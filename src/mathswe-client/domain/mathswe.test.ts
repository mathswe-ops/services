// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { describe, expect, it } from "vitest";
import {
    MathSwe,
    mathsweFromString,
    mathswePathAccess,
    mathsweToDomainName,
} from "./mathswe";
import { isLeft, isRight, left, right } from "fp-ts/Either";
import { Access, fullAccess } from "./domain";
import { some } from "fp-ts/Option";

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

describe("FromString", () => {
    it(
        "should return Right(MathSweCom) when the input is \"mathswe.com\"",
        () => {
            const result = mathsweFromString.fromString("mathswe.com");

            expect(isRight(result)).toBe(true);
            expect(result).toEqual(right("MathSweCom"));
        },
    );

    it(
        "should return Right(MathSoftware) when the input is \"math.software\"",
        () => {
            const result = mathsweFromString.fromString("math.software");

            expect(isRight(result)).toBe(true);
            expect(result).toEqual(right("MathSoftware"));
        },
    );

    it(
        "should return Right(MathSoftwareEngineer) when the input is \"mathsoftware.engineer\"",
        () => {
            const result = mathsweFromString.fromString("mathsoftware.engineer");

            expect(isRight(result)).toBe(true);
            expect(result).toEqual(right("MathSoftwareEngineer"));
        },
    );

    it(
        "should return Left with an error message when the input is an invalid domain",
        () => {
            const result = mathsweFromString.fromString("invalid.com");

            expect(isLeft(result)).toBe(true);
            expect(result).toEqual(left("Invalid MathSwe string."));
        },
    );
});

describe("PathAccess for MathSwe", () => {
    it("should return fullAccess for any MathSwe domain", () => {
        const domains: MathSwe[] = [
            "MathSweCom",
            "MathSoftware",
            "MathSoftwareEngineer",
        ];

        domains.forEach(domain => {
            const result = mathswePathAccess.pathAccess(domain);

            const expectedAccess: Access = some(fullAccess);

            expect(result).toEqual(expectedAccess);
        });
    });
});
