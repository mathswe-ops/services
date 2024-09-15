// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { Either } from "fp-ts/Either";
import { identity, pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";

export function requireRight<L, R>(result: Either<L, R>) {
    return pipe(
        result,
        E.fold(
            error => {
                throw new Error(JSON.stringify(error));
            },
            identity,
        ),
    );
}
