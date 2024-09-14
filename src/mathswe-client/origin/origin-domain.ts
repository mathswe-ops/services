// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { MathSwe, mathsweToDomainName } from "../domain/mathswe";
import { match, withMatchVariant } from "../../mathswe-ts/adt";
import { pipe } from "fp-ts/function";
import { ThirdParty, thirdPartyToDomainName } from "../domain/third-party";
import { ToDomainName } from "../domain/domain";

export type OriginDomain
    = { tag: "MathSweDomain", mathswe: MathSwe }
    | { tag: "ThirdPartyDomain", thirdParty: ThirdParty };

export const mathSweDomain
    = (mathswe: MathSwe): OriginDomain => ({
    tag: "MathSweDomain",
    mathswe,
});

export const thirdPartyDomain
    = (thirdParty: ThirdParty): OriginDomain => ({
    tag: "ThirdPartyDomain",
    thirdParty,
});

export const toDomainName: ToDomainName<OriginDomain> = {
    toDomainName(domain: OriginDomain): string {
        const withDomainVariant = withMatchVariant<string>(domain);

        const mathsweDomainName = ({ mathswe }: { mathswe: MathSwe }) =>
            mathsweToDomainName.toDomainName(mathswe);

        const thirdPartyDomainName
            = ({ thirdParty }: { thirdParty: ThirdParty }) =>
            thirdPartyToDomainName.toDomainName(thirdParty);

        return pipe(
            domain,
            match({
                "MathSweDomain": withDomainVariant(mathsweDomainName),
                "ThirdPartyDomain": withDomainVariant(thirdPartyDomainName),
            }),
        );
    },
};
