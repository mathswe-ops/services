// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { Access, fullAccess, PathAccess, ToDomainName } from "./domain";
import { FromString } from "../../mathswe-ts/string";
import * as E from "fp-ts/Either";
import { Either } from "fp-ts/Either";
import { some } from "fp-ts/Option";

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

export const mathsweFromString: FromString<MathSwe> = {
    fromString(string: string): Either<string, MathSwe> {
        const stringToMathSwe: Record<string, MathSwe> = {
            "mathswe.com": "MathSweCom",
            "math.software": "MathSoftware",
            "mathsoftware.engineer": "MathSoftwareEngineer",
        };
        const parse = E.fromNullable("Invalid MathSwe string.");

        return parse(stringToMathSwe[string]);
    },
};

export const mathswePathAccess: PathAccess<MathSwe> = {
    pathAccess(_: MathSwe): Access {
        return some(fullAccess);
    },
};
