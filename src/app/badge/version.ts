// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import {
    GitPlatform,
    gitPlatformFromString,
} from "../../git-platform/git-platform";
import * as O from "fp-ts/Option";
import { Option } from "fp-ts/Option";
import { error, IRequest } from "itty-router";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { Either } from "fp-ts/Either";
import { sequenceT } from "fp-ts/Apply";
import { map } from "fp-ts/es6/Array";
import { inferVersion } from "../../git-platform/project";
import {
    newVersionBadge,
    newVersionFromString,
    notFoundBadge,
} from "./badge-template";
import { domainErrorToIttyError, Kv, RawKv } from "./badge";

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

    const wrapResponse = (badge: string) => new Response(
        badge,
        {
            headers: {
                "Content-Type": "image/svg+xml",
            },
        },
    );

    const versionBadge = pipe(
        version,
        E.flatMap(newVersionFromString),
        E.map(newVersionBadge),
        E.map(wrapResponse),
    );

    let result = error();

    if (E.isRight(versionBadge)) {
        result = versionBadge.right;
    }
    else if (E.isLeft(versionBadge)) {
        result = domainErrorToIttyError(versionBadge);

        if (result.status === 404) {
            result = wrapResponse(notFoundBadge);
        }
    }

    return result;
}
