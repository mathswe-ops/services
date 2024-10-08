// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { GitPlatform, repoToUrl } from "./git-platform";
import * as O from "fp-ts/Option";
import { none, Option, some } from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { Either, left, right } from "fp-ts/Either";
import { matchPlain } from "../mathswe-ts/enum";
import * as toml from "toml";

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

export async function inferVersion(
    gitPlatform: GitPlatform,
    user: string,
    repo: string,
    path: Option<string>,
): Promise<Either<string, string>> {
    const repoUrl = repoToUrl(gitPlatform, user, repo);

    return pipe(
        path,
        O.match(
            () => inferVersionFromRepo(gitPlatform, repoUrl),
            root => inferVersionFromBuildSystem(gitPlatform, repoUrl, root),
        ),
    );
}

async function inferVersionFromRepo(
    gitPlatform: GitPlatform,
    repoUrl: string,
): Promise<Either<string, string>> {
    return pipe(
        gitPlatform,
        matchPlain({
            GitHub: inferVersionFromGitHubRepo(repoUrl),
        }),
    );
}

async function inferVersionFromBuildSystem(
    gitPlatform: GitPlatform,
    repoUrl: string,
    path: string,
): Promise<Either<string, string>> {
    const systemResult = await readBuildSystem(gitPlatform, repoUrl, path);

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
        const system = systemFound.right;

        result = await readProjectVersion(
            gitPlatform,
            repoUrl,
            some(path),
            system,
        );
    }
    else {
        result = systemFound;
    }

    return result;
}

export function readBuildSystem(
    gitPlatform: GitPlatform,
    repoUrl: string,
    path: string,
): Promise<Either<string, Option<BuildSystem>>> {
    return pipe(
        gitPlatform,
        matchPlain({
            GitHub: readBuildSystemOnGitHub(repoUrl, path),
        }),
    );
}

export type GitHubTag = {
    name: string,
}

async function inferVersionFromGitHubRepo(
    repoUrl: string,
): Promise<Either<string, string>> {
    const tagsResult = await fetchGitHubApi<GitHubTag>(repoUrl, "tags");

    return pipe(
        tagsResult,
        E.flatMap(tags =>
            tags.length === 0
            ? left("Repository has no tags.")
            : right(tags[0]),
        ),
        E.map(({ name }) => name),
        E.map(name => name.startsWith("v") ? name.substring(1) : name),
    );
}

export type GitHubRepoContent = {
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
    repoUrl: string,
    path: string,
): Promise<Either<string, Option<BuildSystem>>> {
    const result = await fetchFileListOnGitHub(repoUrl, path);

    return pipe(
        result,
        E.map(detectBuildSystemOnGitHub),
    );
}

async function fetchFileListOnGitHub(
    repoUrl: string,
    path: string,
): Promise<Either<string, GitHubRepoContent[]>> {
    return fetchGitHubApi(repoUrl, `contents/${ path }`);
}

async function fetchGitHubApi<T>(
    repoUrl: string,
    route: string,
): Promise<Either<string, T[]>> {
    const apiUrl = repoUrl
        .replace("https://github.com/", "https://api.github.com/repos/")
        .concat(`/${ route }`);

    const init = {
        headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": "mathswe-ops-services",
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
              ? await response.json() as T[]
              : [];

        result = pipe(
            okResult,
            E.map(_ => json),
            E.flatMap(data =>
                Array.isArray(data)
                ? right(data)
                : left("Fail to read project resources. Ensure to provide the"
                       + " correct repository URL"),
            ),
        );
    }
    catch (error) {
        result = left(`Failed to fetch resources: ${ (error as Error).message }`);
    }

    return result;
}

async function readProjectVersion(
    gitPlatform: GitPlatform,
    repoUrl: string,
    path: Option<string>,
    system: BuildSystem,
): Promise<Either<string, string>> {
    return pipe(
        gitPlatform,
        matchPlain({
            GitHub: readProjectVersionOnGitHub(repoUrl, path, system),
        }),
    );
}

async function readProjectVersionOnGitHub(
    repoUrl: string,
    path: Option<string>,
    system: BuildSystem,
): Promise<Either<string, string>> {
    const buildFileName = buildFile(system);
    const filePath = pipe(
        path,
        O.map(root =>
            root.endsWith("/")
            ? `${ root }${ buildFileName }`
            : `${ root }/${ buildFileName }`,
        ),
        O.getOrElse(() => buildFileName),
    );
    const fileResult = await readFileOnGitHub(repoUrl, "main", filePath);

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
