// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { ToDomainName } from "./domain";
import { FromString } from "../../mathswe-ts/string";
import { Either } from "fp-ts/Either";
import * as E from "fp-ts/Either";

export type ThirdParty = "GitHubCom";

export const thirdPartyToDomainName: ToDomainName<ThirdParty> = {
    toDomainName(domain: ThirdParty): string {
        return {
            "GitHubCom": "github.com",
        }[domain];
    },
};

export const thirdPartyFromString: FromString<ThirdParty> = {
    fromString(string: string): Either<string, ThirdParty> {
        const stringToThirdParty: Record<string, ThirdParty> = {
            "github.com": "GitHubCom",
        };
        const parse = E.fromNullable("Invalid ThirdParty string.");

        return parse(stringToThirdParty[string]);
    },
};
