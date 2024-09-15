// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { LazyArg } from "fp-ts/function";

export type SumType = { tag: string };

/**
 * Defines the lazy map type where keys are variant IDs and values are the
 * corresponding results.
 */
export type SumTypeMap<T extends SumType, R> = {
    [K in T["tag"]]: LazyArg<R>;
};

export function match<V extends SumType, R>(map: SumTypeMap<V, R>): (value: V) => R {
    return (value: V) => map[value.tag as keyof SumTypeMap<V, R>]();
}

export function withMatchVariant<R>(value: SumType): <V>(fn: (variant: V) => R) => LazyArg<R> {
    return <V>(fn: (variant: V) => R) => () => fn(value as V);
}
