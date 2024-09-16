// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { identity, pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { Either } from "fp-ts/Either";
import { newOriginFromString, Origin } from "../origin/origin";
import { toDomainName } from "../origin/origin-domain";

export const getOrigin = (req: Request): Either<string, Origin> => pipe(
    req.headers.get("Origin"),
    E.fromNullable("Request header `Origin` is null."),
    E.flatMap(newOriginFromString),
);

export const getCorsOrigin
    = (requestingOrigin: string | null): string | undefined => pipe(
    requestingOrigin,
    E.fromNullable(""),
    E.flatMap(newOriginFromString),
    E.map(({ domain }) => `https://${ toDomainName.toDomainName(domain) }`),
    E.fold(_ => undefined, identity),
);
