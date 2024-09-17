// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services
import { describe, expect, it } from "vitest";
import { left, right } from "fp-ts/Either";
import {
    gitHub,
    gitPlatformFromString,
    gitPlatformToUrl,
    repoToUrl,
} from "./git-platform";

describe("GitPlatform", () => {
    describe("implements FromString for GitProvider", () => {
        it("constructs GitHub GitProvider from string", () => {
            expect(gitPlatformFromString.fromString("github"))
                .toEqual(right(gitHub));
        });

        it("should return an error for invalid provider", () => {
            expect(gitPlatformFromString.fromString("bitbucket"))
                .toEqual(left("Invalid Git Platform."));
        });
    });

    describe("gitProviderToUrl", () => {
        it("should return the correct URL for GitHub", () => {
            expect(gitPlatformToUrl(gitHub)).toBe("https://github.com");
        });
    });

    describe("repoToUrl", () => {
        it("should construct the correct repository URL for GitHub", () => {
            const user = "user";
            const repo = "repo";
            const expectedUrl = `https://github.com/${ user }/${ repo }`;

            expect(repoToUrl(gitHub, user, repo)).toBe(expectedUrl);
        });
    });
});
