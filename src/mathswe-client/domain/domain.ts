// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { Option } from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { LazyArg, pipe } from "fp-ts/function";

export interface ToDomainName<T> {
    toDomainName(domain: T): string;
}

export type Allowed
    = { tag: "FullAccess" }
    | { tag: "PartialAccess", values: string[] }

export const fullAccess: Allowed = { tag: "FullAccess" };

export const partialAccess = (values: string[]): Allowed => ({
    tag: "PartialAccess",
    values,
});

export type Access = Option<Allowed>;

export const accessToEither
    = <L>(left: LazyArg<L>) =>
    (access: Access) => pipe(access, E.fromOption(left));

export interface PathAccess<T> {
    pathAccess(domain: T): Access;
}
