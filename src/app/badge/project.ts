// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { IRequest, StatusError } from "itty-router";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { Either } from "fp-ts/Either";
import { newProjectBadge } from "./badge-template";
import { matchPlain } from "../../mathswe-ts/enum";
import { FromString, ToString } from "../../mathswe-ts/string";
import {
    mathsweBadgeIcon64,
    mathsweOpsBadgeIcon64,
    mathsweSystemOpsIcon64,
    mswBadgeIcon64,
    repsymoBadgeIcon64,
    texsydoBadgeIcon64,
} from "./badge.data";

export type Project
    = { tag: "Msw" }
    | { tag: "MathSoftware" }
    | { tag: "Repsymo" }
    | { tag: "Texsydo" }
    | { tag: "MathSweOps" }
    | { tag: "MathSweSystemOps" }
    | { tag: "MathSweOpsServices" }
    | { tag: "MathSwe" }

export const msw: Project = { tag: "Msw" };

export const mathSoftware: Project = { tag: "MathSoftware" };

export const repsymo: Project = { tag: "Repsymo" };

export const texsydo: Project = { tag: "Texsydo" };

export const mathsweOps: Project = { tag: "MathSweOps" };

export const mathsweSystemOps: Project = { tag: "MathSweSystemOps" };

export const mathsweOpsServices: Project = { tag: "MathSweOpsServices" };

export const mathswe: Project = { tag: "MathSwe" };

export const projectToString: ToString<Project> = {
    toString(value: Project): string {
        return pipe(
            value,
            matchPlain({
                Msw: "MSW",
                MathSoftware: "Math.Software",
                Repsymo: "Repsymo",
                Texsydo: "Texsydo",
                MathSweOps: "MathSwe Ops",
                MathSweSystemOps: "MathSwe System Ops",
                MathSweOpsServices: "MathSwe Ops Services",
                MathSwe: "MathSwe",
            }),
        );
    },
};

export const projectFromString: FromString<Project> = {
    fromString(string: string): Either<string, Project> {
        const stringToProject: Record<string, Project> = {
            "msw": msw,
            "math-software": mathSoftware,
            "repsymo": repsymo,
            "texsydo": texsydo,
            "mathswe-ops": mathsweOps,
            "mathswe-system-ops": mathsweSystemOps,
            "mathswe-ops-services": mathsweOpsServices,
            "mathswe": mathswe,
        };

        return pipe(
            stringToProject[string],
            E.fromNullable("Invalid project."),
        );
    },
};

export async function handleProjectBadge(req: IRequest): Promise<Response> {
    const { params, query } = req;

    if (params["project"] === undefined) {
        throw new StatusError(400, "Missing route param: project");
    }

    const projectRaw = params["project"];
    const projectResult = pipe(
        projectRaw,
        projectFromString.fromString,
    );

    if (E.isLeft(projectResult)) {
        const msg = projectResult.left;
        throw new StatusError(400, msg);
    }

    const project = projectResult.right;
    const mvp = query["mvp"] !== undefined;

    return respondVersionBadge(project, mvp);
}

async function respondVersionBadge(
    project: Project,
    mvp: boolean,
): Promise<Response> {
    const projectName = projectToString.toString(project);
    const name = mvp ? `MVP: ${ projectName }` : projectName;
    const badge: string = pipe(
        project,
        matchPlain({
            Msw: newProjectBadge(name, mswBadgeIcon64),
            MathSoftware: newProjectBadge(name, mswBadgeIcon64),
            Repsymo: newProjectBadge(name, repsymoBadgeIcon64),
            Texsydo: newProjectBadge(name, texsydoBadgeIcon64),
            MathSweOps: newProjectBadge(name, mathsweOpsBadgeIcon64),
            MathSwe: newProjectBadge(name, mathsweBadgeIcon64),
            MathSweSystemOps: newProjectBadge(name, mathsweSystemOpsIcon64),
            MathSweOpsServices: newProjectBadge(name, mathsweOpsBadgeIcon64),
        }),
    );

    const wrapResponse = (badge: string) => new Response(
        badge,
        {
            headers: {
                "Content-Type": "image/svg+xml",
            },
        },
    );

    return wrapResponse(badge);
}
