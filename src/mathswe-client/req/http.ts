// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { Either, left, right } from "fp-ts/Either";

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
