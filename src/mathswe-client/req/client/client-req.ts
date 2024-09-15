// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { Either } from "fp-ts/Either";
import { newOriginFromString, Origin } from "../origin/origin";

export const getOrigin = (req: Request): Either<string, Origin> => pipe(
    req.headers.get("Origin"),
    E.fromNullable("Request header `Origin` is null."),
    E.flatMap(newOriginFromString),
);
