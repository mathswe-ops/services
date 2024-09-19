// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { describe, expect, it } from "vitest";
import {
    thirdPartyFromString,
    thirdPartyPathAccess,
    thirdPartyToDomainName,
} from "./third-party";
import { isLeft, isRight, left, right } from "fp-ts/Either";
import { Access, partialAccess } from "./domain";
import { some } from "fp-ts/Option";

describe("thirdPartyToDomainName", () => {
    it("should return the correct domain name for GitHubCom", () => {
        const result = thirdPartyToDomainName.toDomainName("GitHubCom");

        expect(result).toBe("github.com");
    });
});

describe("FromString", () => {
    it(
        "should return Right(GitHubCom) when the input is \"github.com\"",
        () => {
            const result = thirdPartyFromString.fromString("github.com");

            expect(isRight(result)).toBe(true);
            expect(result).toEqual(right("GitHubCom"));
        },
    );

    it(
        "should return Left with an error message when the input is invalid",
        () => {
            const result = thirdPartyFromString.fromString("invalid.com");

            expect(isLeft(result)).toBe(true);
            expect(result).toEqual(left("Invalid ThirdParty string."));
        },
    );

    it(
        "should return Left with an error message when the input is an empty string",
        () => {
            const result = thirdPartyFromString.fromString("");

            expect(isLeft(result)).toBe(true);
            expect(result).toEqual(left("Invalid ThirdParty string."));
        },
    );

    it(
        "should return Left with an error message when the input is an unknown domain",
        () => {
            const result = thirdPartyFromString.fromString("bitbucket.org");

            expect(isLeft(result)).toBe(true);
            expect(result).toEqual(left("Invalid ThirdParty string."));
        },
    );
});

describe("PathAccess for ThirdParty", () => {
    it("should return partial access for GitHubCom", () => {
        const result = thirdPartyPathAccess.pathAccess("GitHubCom");

        const expectedAccess: Access = some(partialAccess([
            "tobiasbriones",
            "mathswe",
            "mathswe-ops",
            "mathsoftware",
            "repsymo",
            "texsydo",
        ]));

        expect(result).toEqual(expectedAccess);
    });
});
