// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { Either } from "fp-ts/Either";

export interface FromString<T> {
    fromString(string: string): Either<string, T>;
}
