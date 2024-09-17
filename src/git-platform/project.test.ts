// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { cargo, GitHubRepoContent, npm, readBuildSystem } from "./project";
import { describe, expect, it, vi } from "vitest";
import { left, right } from "fp-ts/Either";
import { gitHub } from "./git-platform";
import { none, some } from "fp-ts/Option";

const mockFetchResponse = (contents: GitHubRepoContent[]) => {
    global.fetch = vi.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve(contents),
        }),
    ) as unknown as typeof fetch;
};

describe("readBuildSystem", () => {
    it(
        "should return Npm if package.json and package-lock.json exist",
        async () => {
            mockFetchResponse([
                { name: "package.json" },
                { name: "package-lock.json" },
            ]);

            const result = await readBuildSystem(
                gitHub,
                "https://github.com/some/js-repo",
                some(""),
            );

            expect(result).toEqual(right(some(npm)));
        },
    );

    it("should return Cargo if Cargo.toml and Cargo.lock exist", async () => {
        mockFetchResponse([
            { name: "Cargo.toml" },
            { name: "Cargo.lock" },
        ]);

        const result = await readBuildSystem(
            gitHub,
            "https://github.com/some/rust-repo",
            some(""),
        );

        expect(result).toEqual(right(some(cargo)));
    });

    it("should return Cargo if project is nested", async () => {
        mockFetchResponse([
            { name: "Cargo.toml" },
            { name: "Cargo.lock" },
        ]);

        const result = await readBuildSystem(
            gitHub,
            "https://github.com/some/rust-repo/microservice",
            some(""),
        );

        expect(result).toEqual(right(some(cargo)));
    });

    it("should return None if no build system is detected", async () => {
        mockFetchResponse([
            { name: "README.md" },
        ]);

        const result = await readBuildSystem(
            gitHub,
            "https://github.com/some/empty-repo",
            some(""),
        );

        expect(result).toEqual(right(none));
    });

    it("should return an error if fetch fails", async () => {
        global.fetch = vi.fn(() => Promise.reject(new Error("Fetch failed"))) as unknown as typeof fetch;

        const result = await readBuildSystem(
            gitHub,
            "https://github.com/error/repo",
            some(""),
        );

        expect(result).toEqual(left("Failed to fetch files: Fetch failed"));
    });
});
