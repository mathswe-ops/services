// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { SumType } from "./adt";

/**
 * Defines the map type where keys are variant IDs and values are the
 * corresponding results evaluated eagerly.
 *
 * It helps remove `() => R` boilerplate if the sum type matching doesn't
 * need any destructuring or variant fields to compute the result.
 *
 * Do not use when you need to access the variant fields in the match branches.
 */
export type EnumMap<T extends SumType, R> = {
    [K in T["tag"]]: R;
};

/**
 * It matches a sum type with plain variant values **eagerly**.
 *
 * It helps remove `() => R` boilerplate if the sum type *matching doesn't
 * need any destructuring or variant fields* to compute the result.
 *
 * Do not use when you need to access the variant fields in the match
 * branches. Use `adt.match` instead.
 */
export function matchPlain<V extends SumType, R>(map: EnumMap<V, R>): (value: V) => R {
    return (value: V) => map[value.tag as keyof EnumMap<V, R>];
}
