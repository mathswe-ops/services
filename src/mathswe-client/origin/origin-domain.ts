// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import {
    MathSwe,
    mathsweFromString,
    mathsweToDomainName,
} from "../domain/mathswe";
import { match, withMatchVariant } from "../../mathswe-ts/adt";
import { pipe } from "fp-ts/function";
import {
    ThirdParty,
    thirdPartyFromString,
    thirdPartyToDomainName,
} from "../domain/third-party";
import { ToDomainName } from "../domain/domain";
import { FromString } from "../../mathswe-ts/string";
import * as E from "fp-ts/Either";
import { Either } from "fp-ts/Either";
import { identity } from "fp-ts";

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

export const originDomainFromString: FromString<OriginDomain> = {
    fromString(string: string): Either<string, OriginDomain> {
        const mathsweResult = pipe(
            string,
            mathsweFromString.fromString,
            E.map(mathSweDomain),
        );

        const thirdPartyResult = pipe(
            string,
            thirdPartyFromString.fromString,
            E.map(thirdPartyDomain),
        );

        return pipe(
            mathsweResult,
            E.fold(_ => thirdPartyResult, mathswe => E.right(mathswe)),
            E.mapLeft(_ => "Unaccepted origin domain.")
        );
    },
};
