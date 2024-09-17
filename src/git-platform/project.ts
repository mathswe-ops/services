// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { GitPlatform } from "./git-platform";
import { none, Option, some } from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { Either, left, right } from "fp-ts/Either";
import { matchPlain } from "../mathswe-ts/enum";

export type BuildSystem = { tag: "Npm" } | { tag: "Cargo" };

export const npm: BuildSystem = { tag: "Npm" };

export const cargo: BuildSystem = { tag: "Cargo" };

export function readBuildSystem(
    gitPlatform: GitPlatform,
    url: string,
): Promise<Either<string, Option<BuildSystem>>> {
    return pipe(
        gitPlatform,
        matchPlain({
            GitHub: readBuildSystemOnGitHub(url),
        }),
    );
}

type GitHubRepoContent = {
    name: string,
}

function detectBuildSystemOnGitHub(
    repoContents: GitHubRepoContent[],
): Option<BuildSystem> {
    const isNpm = (filenames: string[]) =>
        filenames.includes("package.json") &&
        filenames.includes("package-lock.json");

    const isCargo = (filenames: string[]) =>
        filenames.includes("Cargo.toml") &&
        filenames.includes("Cargo.lock");

    const filenames = repoContents.map(({ name }) => name);

    let system;

    if (isNpm(filenames)) {
        system = some(npm);
    }
    else if (isCargo(filenames)) {
        system = some(cargo);
    }
    else {
        system = none;
    }

    return system;
}

async function readBuildSystemOnGitHub(
    url: string,
): Promise<Either<string, Option<BuildSystem>>> {
    const result = await fetchFileListOnGitHub(url);

    return pipe(
        result,
        E.map(detectBuildSystemOnGitHub),
    );
}

async function fetchFileListOnGitHub(
    repoUrl: string,
): Promise<Either<string, GitHubRepoContent[]>> {
    const apiUrl = repoUrl
        .replace("https://github.com/", "https://api.github.com/repos/")
        .concat("/contents/");

    const init = {
        headers: {
            Accept: "application/vnd.github+json",
        },
    };

    let result;

    try {
        const response = await fetch(apiUrl, init);
        const okResult
            = response.ok
              ? right(response)
              : left(`GitHub API error: ${ response.statusText }`);

        const json
            = E.isRight(okResult)
              ? await response.json() as GitHubRepoContent[]
              : [];

        result = pipe(
            okResult,
            E.map(_ => json),
        );
    }
    catch (error) {
        result = left(`Failed to fetch files: ${ (error as Error).message }`);
    }

    return result;
}
