// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import * as E from "fp-ts/Either";
import { Either, Left } from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { Option } from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { error, IRequest } from "itty-router";
import { map } from "fp-ts/es6/Array";
import { sequenceT } from "fp-ts/Apply";
import {
    GitPlatform,
    gitPlatformFromString,
} from "../../git-platform/git-platform";
import { inferVersion } from "../../git-platform/project";
import { newVersionBadge, newVersionFromString } from "./badge-template";

type Kv = [string, string];

type RawKv = [string, string | undefined];

type VersionBadgeParams = {
    gitPlatform: GitPlatform,
    user: string,
    repo: string,
    root: Option<string>
}

export async function handleVersionBadge(req: IRequest): Promise<Response> {
    const paramNames = ["gitProvider", "user", "repo"];
    const { params, query } = req;
    const root: Option<string> = pipe(
        query["path"],
        O.fromNullable,
        O.flatMap(value =>
            Array.isArray(value)
            ? O.fromNullable(value[0])
            : O.some(value),
        ),
    );

    const paramToKeyValue = (param: string): RawKv => [param, params[param]];

    const kvToEither = ([key, rawValue]: RawKv): Either<string, Kv> => pipe(
        rawValue,
        E.fromNullable(`Missing route param: ${ key }`),
        E.map(value => [key, value]),
    );

    const flattenKvEither
        = ([git, user, repo]: Either<string, Kv>[]): Either<string, Kv[]> =>
        sequenceT(E.Apply)(git, user, repo);

    const kvToValue = ([_, value]: Kv): string => value;

    const toParams
        = ([git, user, repo]: string[]): Either<string, VersionBadgeParams> => pipe(
        git,
        gitPlatformFromString.fromString,
        E.map(gitProvider => ({ gitPlatform: gitProvider, user, repo, root })),
    );

    const kvsToParams = (kvs: Kv[]): Either<string, VersionBadgeParams> => pipe(
        kvs,
        map(kvToValue),
        toParams,
    );

    const badgeParams: Either<Response, VersionBadgeParams> = pipe(
        paramNames,
        map(paramToKeyValue),
        map(kvToEither),
        flattenKvEither,
        E.mapLeft(msg => error(400, msg)),
        E.flatMap(kvs => pipe(
            kvs,
            kvsToParams,
            E.mapLeft(msg => error(400, msg)),
        )),
    );

    let result: Response;

    if (E.isRight(badgeParams)) {
        result = await respondVersionBadge(badgeParams.right);
    }
    else {
        result = badgeParams.left;
    }

    return result;
}

async function respondVersionBadge(
    { gitPlatform, user, repo, root }: VersionBadgeParams,
): Promise<Response> {
    const version = await inferVersion(gitPlatform, user, repo, root);

    const versionBadge = pipe(
        version,
        E.flatMap(newVersionFromString),
        E.map(newVersionBadge),
        E.map(badge => new Response(
            badge,
            {
                headers: {
                    "Content-Type": "image/svg+xml",
                },
            },
        )),
    );

    let result = error();

    if (E.isRight(versionBadge)) {
        result = versionBadge.right;
    }
    else if (E.isLeft(versionBadge)) {
        result = domainErrorToIttyError(versionBadge);
    }

    return result;
}

function domainErrorToIttyError(left: Left<string>): Response {
    const msg = left.left;
    const possibleReasons = [
        { reason: "Fail to find a build system", code: 404 },
        { reason: "GitHub API error", code: 502 },
        { reason: "Fail to read project files", code: 500 },
        { reason: "Failed to fetch files", code: 502 },
        { reason: "GitHub User Content error", code: 500 },
        { reason: "Version field not found", code: 400 },
        { reason: "Failed to parse", code: 400 },
    ];

    const matchedReason = possibleReasons
        .find(({ reason }) => msg.includes(reason));

    const code = matchedReason ? matchedReason.code : 500;

    return error(code, msg);
}
