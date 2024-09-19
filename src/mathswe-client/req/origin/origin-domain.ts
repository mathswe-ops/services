// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import {
    MathSwe,
    mathsweFromString,
    mathswePathAccess,
    mathsweToDomainName,
} from "../../domain/mathswe";
import { match, withMatchVariant } from "../../../mathswe-ts/adt";
import { identity, pipe } from "fp-ts/function";
import {
    ThirdParty,
    thirdPartyFromString,
    thirdPartyPathAccess,
    thirdPartyToDomainName,
} from "../../domain/third-party";
import {
    Access,
    accessToEither,
    Allowed,
    ToDomainName,
} from "../../domain/domain";
import { FromString } from "../../../mathswe-ts/string";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { Either } from "fp-ts/Either";
import { Hostname, newPathFromString, Path, SecureUrl } from "../http";

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

export const originDomainFromHostname
    = ({ domainName }: Hostname): Either<string, OriginDomain> =>
    originDomainFromString.fromString(domainName);

export const originDomainFromUrl
    = ({ hostname }: SecureUrl): Either<string, OriginDomain> =>
    originDomainFromHostname(hostname);

export type OriginPath = Path;

export const newOriginPathFromDomain = (domain: OriginDomain) => {
    const pathHasAccess = (path: string) => (allowed: Allowed): boolean => {
        const withAllowedVariant = withMatchVariant<boolean>(allowed);

        const findAllowedPath = (allowedPaths: string[]) =>
            allowedPaths.find(allowedPath => path.startsWith(allowedPath));

        type PartialAccess = { values: string[] };

        const belongsToPartialAccess = ({ values }: PartialAccess): boolean => pipe(
            values,
            findAllowedPath,
            O.fromNullable,
            O.isSome,
        );

        return pipe(
            allowed,
            match({
                FullAccess: () => true,
                PartialAccess: withAllowedVariant(belongsToPartialAccess),
            }),
        );
    };

    const wrapEither
        = (path: string) => (hasAccess: boolean): Either<string, string> => pipe(
        hasAccess,
        E.fromPredicate(
            identity,
            _ => `Path ${ path } of domain ${ domain } is restricted.`,
        ),
        E.map(_ => path),
    );

    const mathsweAccess = ({ mathswe }: { mathswe: MathSwe }) =>
        mathswePathAccess.pathAccess(mathswe);

    const thirdPartyAccess = ({ thirdParty }: { thirdParty: ThirdParty }) =>
        thirdPartyPathAccess.pathAccess(thirdParty);

    const withDomainVariant = withMatchVariant<Access>(domain);

    const domainAccess: Access = pipe(
        domain,
        match({
            MathSweDomain: withDomainVariant(mathsweAccess),
            ThirdPartyDomain: withDomainVariant(thirdPartyAccess),
        }),
    );

    return (path: string): Either<string, OriginPath> => pipe(
        domainAccess,
        accessToEither(() => `Access disallowed to paths of domain ${ domain }`),
        E.map(pathHasAccess(path)),
        E.flatMap(wrapEither(path)),
        E.flatMap(newPathFromString),
    );
};
