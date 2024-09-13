// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

export type SumType = { type: string };

/**
 * Defines the map type where keys are variant IDs and values are the
 * corresponding results.
 */
export type SumTypeMap<T extends SumType, R> = {
    [K in T["type"]]: R;
};

export function match<V extends SumType, R>(value: V, map: SumTypeMap<V, R>): R {
    return map[value.type as keyof SumTypeMap<V, R>];
}
