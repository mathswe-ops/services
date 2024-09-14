// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { ToDomainName } from "./domain";

export type MathSwe
    = "MathSweCom"
    | "MathSoftware"
    | "MathSoftwareEngineer";

export const mathsweToDomainName: ToDomainName<MathSwe> = {
    toDomainName(domain: MathSwe): string {
        return {
            "MathSweCom": "mathswe.com",
            "MathSoftware": "math.software",
            "MathSoftwareEngineer": "mathsoftware.engineer",
        }[domain];
    },
};
