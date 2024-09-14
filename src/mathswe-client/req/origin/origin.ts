// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { OriginDomain, originDomainFromUrl } from "./origin-domain";
import { pipe } from "fp-ts/function";
import { newUrlFromString, SecureUrl } from "../http";
import * as E from "fp-ts/Either";
import { Either } from "fp-ts/Either";

export type Origin = {
    domain: OriginDomain,
    url: SecureUrl,
}

export const newOriginFromUrl = (url: SecureUrl): Either<string, Origin> => pipe(
    url,
    originDomainFromUrl,
    E.map(domain => ({
        domain,
        url,
    })),
);

export const newOriginFromString = (origin: string): Either<string, Origin> => pipe(
    origin,
    newUrlFromString,
    E.flatMap(newOriginFromUrl),
);
