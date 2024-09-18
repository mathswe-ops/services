// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import * as E from "fp-ts/Either";
import { Either } from "fp-ts/Either";
import { identity, pipe } from "fp-ts/function";
import { projectBadgeTemplate, versionBadgeTemplate } from "./badge.data";

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

    return versionBadgeTemplate
        .replaceAll("{{version}}", version)
        .replaceAll("{{textLength}}", textLength.toString())
        .replaceAll("{{totalWidth}}", totalWidth.toString())
        .replaceAll("{{textX}}", textX.toString())
        .replaceAll("{{versionRectWidth}}", versionRectWidth.toString());
};

export const newProjectBadge = (project: string, icon64: string) => {
    const padding = 18;
    const length = project.length;
    const textLength = (length / 7) * 55;
    const projectRectWidth = textLength + padding * 2;
    const textX = 96 + padding;
    const totalWidth = 96 + projectRectWidth;

    return projectBadgeTemplate
        .replaceAll("{{project}}", project)
        .replaceAll("{{icon64}}", icon64)
        .replaceAll("{{textLength}}", textLength.toString())
        .replaceAll("{{totalWidth}}", totalWidth.toString())
        .replaceAll("{{textX}}", textX.toString())
        .replaceAll("{{projectRectWidth}}", projectRectWidth.toString());
};

export const notFoundBadge = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="115"
     height="20"
     role="img"
     aria-label="not found">
    <title>not found</title>
    <g shape-rendering="crispEdges">
        <rect width="48" height="20" fill="#555"/>
        <rect x="48" width="69" height="20" fill="#D32F2F"/>
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
        <text x="805"
              y="140"
              transform="scale(.1)"
              fill="#fff"
              textLength="504">
          not found
        </text>
    </g>
</svg>
`;

