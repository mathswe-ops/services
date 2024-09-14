// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

export type MathSwe
    = "MathSweCom"
    | "MathSoftware"
    | "MathSoftwareEngineer";

export const mathsweToDomainName = (mathswe: MathSwe): string => ({
    "MathSweCom": "mathswe.com",
    "MathSoftware": "mathsoftware.com",
    "MathSoftwareEngineer": "mathsoftwareengineer.com",
}[mathswe]);
