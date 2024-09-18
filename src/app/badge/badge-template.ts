// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import * as E from "fp-ts/Either";
import { Either } from "fp-ts/Either";
import { identity, pipe } from "fp-ts/function";

const badgeData = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="{{totalWidth}}"
     height="20"
     role="img"
     aria-label="release v{{version}}">
    <title>release v{{version}}</title>
    <g shape-rendering="crispEdges">
        <rect width="48" height="20" fill="#555"/>
        <rect x="48" width="{{versionRectWidth}}" height="20" fill="#007ec6"/>
    </g>
    <g fill="#fff"
       text-anchor="middle"
       font-family="Poppins Medium,sans-serif"
       text-rendering="geometricPrecision"
       font-size="110">
        <text x="255"
              y="140"
              transform="scale(.1)"
              fill="#fff"
              textLength="390">
          release
        </text>
        <text x="{{textX}}"
              y="140"
              transform="scale(.1)"
              fill="#fff"
              textLength="{{textLength}}">
          v{{version}}
        </text>
    </g>
</svg>
`;

export type Version = string;

export const newVersionFromString = (string: string): Either<string, Version> => {
    const versionRegex = /^\d+\.\d+\.\d+(-\S*)?(\+\S*)?$/;

    return pipe(
        versionRegex.test(string),
        E.fromPredicate(identity, () => `Invalid version ${ string }.`),
        E.map(_ => string),
    );
};

export const newVersionBadge = (version: Version): string => {
    const letterWidth = 56;
    const length = version.length;
    const textLength = letterWidth * length;
    const textX = 255 + textLength + (4*letterWidth);
    const versionRectWidth = 8 * length + 24;
    const totalWidth = 48 + versionRectWidth;

    return badgeData
        .replaceAll("{{version}}", version)
        .replaceAll("{{textLength}}", textLength.toString())
        .replaceAll("{{totalWidth}}", totalWidth.toString())
        .replaceAll("{{textX}}", textX.toString())
        .replaceAll("{{versionRectWidth}}", versionRectWidth.toString());
};
