// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import {
    newOriginPathFromDomain,
    OriginDomain,
    originDomainFromUrl,
    OriginPath,
} from "./origin-domain";
import { pipe } from "fp-ts/function";
import { newUrlFromString, pathToString, SecureUrl } from "../http";
import * as E from "fp-ts/Either";
import { Either } from "fp-ts/Either";

export type Origin = {
    domain: OriginDomain,
    path: OriginPath,
    url: SecureUrl,
}

export const newOriginFromUrl = (url: SecureUrl): Either<string, Origin> => {
    const originPath = (domain: OriginDomain): Either<string, OriginPath> => pipe(
        url.path,
        pathToString.toString,
        newOriginPathFromDomain(domain),
    );

    const fromDomain
        = (domain: OriginDomain): Either<string, Origin> => pipe(
        domain,
        originPath,
        E.map(path => ({ domain, path, url })),
    );

    return pipe(
        url,
        originDomainFromUrl,
        E.flatMap(fromDomain),
    );
};

export const newOriginFromString = (origin: string): Either<string, Origin> => pipe(
    origin,
    newUrlFromString,
    E.flatMap(newOriginFromUrl),
);
