// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { GitPlatform, gitPlatformFromUrl } from "./git-platform";
import * as toml from "@iarna/toml";
import * as O from "fp-ts/Option";
import { none, Option, some } from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { Either, left, right } from "fp-ts/Either";
import { matchPlain } from "../mathswe-ts/enum";
import { requireRight } from "../mathswe-ts/require";

export type BuildSystem = { tag: "Npm" } | { tag: "Cargo" };

export const npm: BuildSystem = { tag: "Npm" };

export const cargo: BuildSystem = { tag: "Cargo" };

export const buildFile = (system: BuildSystem): string => pipe(
    system,
    matchPlain({
        Npm: "package.json",
        Cargo: "Cargo.toml",
    }),
);

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

export async function inferVersion(
    repoUrl: string,
): Promise<Either<string, string>> {
    const gitPlatform = gitPlatformFromUrl(repoUrl);
    let result;

    if (E.isRight(gitPlatform)) {
        result = await inferVersionFrom(gitPlatform.right, repoUrl);
    }
    else {
        result = gitPlatform;
    }

    return result;
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
            E.flatMap(data =>
                Array.isArray(data)
                ? right(data)
                : left("Fail to read project files. Ensure to provide the"
                       + " correct repository URL"),
            ),
        );
    }
    catch (error) {
        result = left(`Failed to fetch files: ${ (error as Error).message }`);
    }

    return result;
}

async function inferVersionFrom(
    gitPlatform: GitPlatform,
    repoUrl: string,
): Promise<Either<string, string>> {
    const systemResult = await readBuildSystem(gitPlatform, repoUrl);

    const systemFound = pipe(
        systemResult,
        E.flatMap(
            O.match(
                () => left(`Fail to find a build system on ${ repoUrl }`),
                system => right(system),
            ),
        ),
    );

    let result;

    if (E.isRight(systemFound)) {
        const system = pipe(systemFound, requireRight);

        result = await readProjectVersion(gitPlatform, repoUrl, system);
    }
    else {
        result = systemFound;
    }

    return result;
}

async function readProjectVersion(
    gitPlatform: GitPlatform,
    repoUrl: string,
    system: BuildSystem,
): Promise<Either<string, string>> {
    return pipe(
        gitPlatform,
        matchPlain({
            GitHub: readProjectVersionOnGitHub(repoUrl, system),
        }),
    );
}

async function readProjectVersionOnGitHub(
    repoUrl: string,
    system: BuildSystem,
): Promise<Either<string, string>> {
    const filename = buildFile(system);
    const fileResult = await readFileOnGitHub(repoUrl, "main", filename);

    return pipe(
        fileResult,
        E.flatMap(fileContent => readVersionFromBuildFile(system, fileContent)),
    );
}

async function readFileOnGitHub(
    repoUrl: string,
    branch: string,
    filePath: string,
): Promise<Either<string, string>> {
    const apiUrl = repoUrl
        .replace("https://github.com/", "https://raw.githubusercontent.com/")
        .concat(`/${ branch }/${ filePath }`);

    const init = {
        headers: {
            Accept: "application/vnd.github.raw+json",
        },
    };

    let result;

    try {
        const response = await fetch(apiUrl, init);
        const okResult
            = response.ok
              ? right(response)
              : left(`Fail to fetch ${apiUrl}. GitHub User Content error: ${ response.statusText }`);

        const text = E.isRight(okResult) ? await response.text() : "";

        result = pipe(
            okResult,
            E.map(_ => text),
        );
    }
    catch (error) {
        result = left(`Failed to fetch file ${ filePath }: ${ (error as Error).message }`);
    }

    return result;
}

function readVersionFromBuildFile(
    system: BuildSystem,
    fileContent: string,
): Either<string, string> {
    return pipe(
        system,
        matchPlain({
            Npm: readVersionFromPackageJson(fileContent),
            Cargo: readVersionFromCargoToml(fileContent),
        }),
    );
}

function readVersionFromPackageJson(
    packageJson: string,
): Either<string, string> {
    let packageResult: Either<string, Record<string, string | undefined>>;

    try {
        const parse = JSON.parse(packageJson);
        packageResult = right(parse);
    }
    catch (error) {
        packageResult = left(`Fail to parse package.json: ${ error }`);
    }

    return pipe(
        packageResult,
        E.map(data => data["version"]),
        E.flatMap(E.fromNullable("Version field not found in package.json")),
    );
}

function readVersionFromCargoToml(
    cargoToml: string,
): Either<string, string> {
    let cargoResult: Either<string, Record<string, any>>;

    try {
        const parsed = toml.parse(cargoToml);
        cargoResult = right(parsed);
    }
    catch (error) {
        cargoResult = left(`Failed to parse Cargo.toml: ${ error }`);
    }

    return pipe(
        cargoResult,
        E.map(data => data["package"]?.["version"]),
        E.flatMap(E.fromNullable("Version field not found in Cargo.toml")),
    );
}
