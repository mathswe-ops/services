// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

export type SumType = { tag: string };

/**
 * Defines the map type where keys are variant IDs and values are the
 * corresponding results.
 */
export type SumTypeMap<T extends SumType, R> = {
    [K in T["tag"]]: R;
};

export type MatchValue<V extends SumType, R> = SumTypeMap<V, R>[keyof SumTypeMap<V, R>];

export function match<V extends SumType, R>(map: SumTypeMap<V, R>): (value: V) => MatchValue<V, R> {
    return (value: V) => map[value.tag as keyof SumTypeMap<V, R>];
}

export function withMatchVariant<R>(value: SumType): <V>(fn: (variant: V) => R) => R {
    return <V>(fn: (variant: V) => R) => fn(value as V);
}
