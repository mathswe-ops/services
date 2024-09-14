// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { ToDomainName } from "./domain";

export type ThirdParty = "GitHubCom";

export const thirdPartyToDomainName: ToDomainName<ThirdParty> = {
    toDomainName(domain: ThirdParty): string {
        return {
            "GitHubCom": "github.com",
        }[domain];
    },
};
