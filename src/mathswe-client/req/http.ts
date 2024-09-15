// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { Either, left, right } from "fp-ts/Either";
import { ToString } from "../../mathswe-ts/string";
import * as Path from "node:path";

export type Hostname = {
    domainName: string,
    subdomain: string,
}

const validHostnameRegex = /^[a-z0-9.]+$/;

const isValidHostname = (hostname: string): Either<string, string> =>
    validHostnameRegex.test(hostname)
    ? right(hostname)
    : left("Invalid hostname format.");

export const newHostnameFromString = (hostname: string): Either<string, Hostname> => pipe(
    hostname,
    isValidHostname,
    E.map(validHost => validHost.split(".")),
    E.flatMap(parts =>
        parts.length < 2
        ? left("Hostname must have at least two parts (SLD and TLD).")
        : right({
            domainName: parts.slice(-2).join("."),
            subdomain: parts.slice(0, -2).join("."),
        }),
    )
);

export type Path = string[];

export const newPathFromString = (path: string): Either<string, Path> => pipe(
    path.split('/').filter(Boolean),
    right
);

export const pathToString: ToString<Path> = {
    toString(value: Path): string {
        return value.join("/");
    },
};

export type SecureUrl = {
    hostname: Hostname,
    path: Path,
}

export const newUrlFromString = (url: string): Either<string, SecureUrl> => {
    type UrlWithoutProtocol = string;

    const stripProtocol = (url: string): Either<string, UrlWithoutProtocol> =>
        url.startsWith("https://")
        ? right(url.slice(8))
        : left("URL does not have the HTTPS protocol.");

    const splitHostWithPath = (url: UrlWithoutProtocol): Either<string, [string, string]> =>
        pipe(
            url.split("/"),
            parts => right(
                parts.length > 1
                ? [parts[0], parts.slice(1).join("/")]
                : [parts[0], ""],
            ),
        );

    const mapRawHost = ([rawHost, rawPath]: [string, string]): Either<string, [Hostname, string]> => pipe(
        rawHost,
        newHostnameFromString,
        E.map(host => [host, rawPath]),
    );

    const mapRawPath = ([host, rawPath]: [Hostname, string]): Either<string, [Hostname, Path]> => pipe(
        rawPath,
        newPathFromString,
        E.map(path => [host, path]),
    );

    return pipe(
        url,
        stripProtocol,
        E.flatMap(splitHostWithPath),
        E.flatMap(mapRawHost),
        E.flatMap(mapRawPath),
        E.map(([hostname, path]) => ({ hostname, path }))
    );
};
