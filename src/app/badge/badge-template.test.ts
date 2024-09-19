// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { describe, expect, it } from "vitest";
import { left, right } from "fp-ts/Either";
import { newVersionFromString } from "./badge-template";

describe("newVersionFromString", () => {
    it("should return a Version for a valid version string", () => {
        const result = newVersionFromString("1.0.0");
        expect(result).toEqual(right("1.0.0"));
    });

    it("should return an error for an invalid version string", () => {
        const result = newVersionFromString("1.0");
        expect(result).toEqual(left("Invalid version 1.0."));
    });

    it(
        "should return a Version for a valid version string with pre-release tag",
        () => {
            const result = newVersionFromString("1.0.0-beta+exp.sha.5114f85");
            expect(result).toEqual(right("1.0.0-beta+exp.sha.5114f85"));
        },
    );

    it(
        "should return an error for a version string with invalid format",
        () => {
            const result = newVersionFromString("1.0.0.0");
            expect(result).toEqual(left("Invalid version 1.0.0.0."));
        },
    );
});
