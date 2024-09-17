// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { FromString } from "../mathswe-ts/string";
import * as E from "fp-ts/Either";
import { Either, left } from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { matchPlain } from "../mathswe-ts/enum";

export type GitPlatform = { tag: "GitHub" }

export const gitHub: GitPlatform = { tag: "GitHub" };

export const gitPlatformFromString: FromString<GitPlatform> = {
    fromString(string: string): Either<string, GitPlatform> {
        const stringToGit: Record<string, GitPlatform> = {
            "github": gitHub,
        };

        return pipe(
            stringToGit[string],
            E.fromNullable("Invalid Git Platform."),
        );
    },
};

export const gitPlatformToUrl = (gitProvider: GitPlatform): string => pipe(
    gitProvider,
    matchPlain({
        GitHub: "github.com",
    }),
    domainName => `https://${ domainName }`,
);

export const gitPlatformFromUrl = (urlRaw: string): Either<string, GitPlatform> => {
    const baseUrlToGitPlatform: Record<string, GitPlatform | undefined> = {
        "https://github.com": gitHub,
    };

    let result: Either<string, GitPlatform>;

    try {
        const url = new URL(urlRaw);
        const baseUrl = `${ url.protocol }//${ url.host }`;

        result = pipe(
            baseUrlToGitPlatform[baseUrl],
            E.fromNullable("GitPlatform not found."),
        );
    }
    catch (error) {
        result = left(`Invalid URL: ${ error }`);
    }

    return result;
};

export const repoToUrl
    = (provider: GitPlatform, user: string, repo: string): string => pipe(
    provider,
    gitPlatformToUrl,
    providerBaseUrl => `${ providerBaseUrl }/${ user }/${ repo }`,
);
