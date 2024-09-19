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

export const newProjectBadge = (project: string, icon64: string) => {
    const padding = 18;
    const length = project.length;
    const textLength = (length / 7) * 56;
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

export const newVersionBadge = (version: Version): string => {
    const padding = 18;
    const length = version.length;
    const textLength = (length / 7) * 42;
    const versionRectWidth = textLength + padding * 2;
    const textX = 60 + padding;
    const totalWidth = 60 + versionRectWidth;

    return versionBadgeTemplate
        .replaceAll("{{version}}", version)
        .replaceAll("{{textLength}}", textLength.toString())
        .replaceAll("{{totalWidth}}", totalWidth.toString())
        .replaceAll("{{textX}}", textX.toString())
        .replaceAll("{{versionRectWidth}}", versionRectWidth.toString());
};
