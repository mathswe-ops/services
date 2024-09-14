// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { Option } from "fp-ts/Option";

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

export interface PathAccess<T> {
    pathAccess(domain: T): Access;
}
