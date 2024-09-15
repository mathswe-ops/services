// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { describe, expect, it } from "vitest";
import { match, withMatchVariant } from "./adt";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";

describe("Lazy Plain SumType", () => {
    type Shape = { tag: "Point" } | { tag: "Circle", radius: number };

    const point: Shape = { tag: "Point" };
    const circle: Shape = { tag: "Circle", radius: 1 };

    it("should pipe lazy match with type safe exhaustive map", () => {
        const label = (shape: Shape) => pipe(
            shape,
            match({
                Point: () => "point-variant",
                Circle: () => "circle-variant",
            }),
        );

        expect(label(point)).toBe("point-variant");
        expect(label(circle)).toBe("circle-variant");
    });
});

describe("Lazy Rich SumType", () => {
    type Shape = { tag: "Point" } | { tag: "Circle", radius: number };

    const point: Shape = { tag: "Point" };
    const circle: Shape = { tag: "Circle", radius: 1 };

    it("computes the area via matching and destructure", () => {
        type Circle = { radius: number };

        const circleArea
            = ({ radius }: Circle) => Math.PI * Math.pow(radius, 2);

        const area = (shape: Shape): number => {
            const withShapeVariant = withMatchVariant<number>(shape);

            return pipe(
                shape,
                match({
                    Point: () => 0,
                    Circle: withShapeVariant(circleArea),
                }),
            );
        };

        expect(area(point)).toBe(0);
        expect(area(circle)).toBe(Math.PI);
    });

    it("computes only the required branch", () => {
        type Circle = { radius: number };

        let executionTimes = 0;

        const circleArea = ({ radius }: Circle) => {
            executionTimes++;

            return Math.PI * Math.pow(radius, 2);
        };

        const pointArea = () => {
            executionTimes++;

            return 0;
        };

        const area = (shape: Shape): number => {
            const withShapeVariant = withMatchVariant<number>(shape);

            return pipe(
                shape,
                match({
                    Point: withShapeVariant(pointArea),
                    Circle: withShapeVariant(circleArea),
                }),
            );
        };

        expect(executionTimes).toBe(0);

        expect(area(point)).toBe(0);
        expect(executionTimes).toBe(1);

        expect(area(circle)).toBe(Math.PI);
        expect(executionTimes).toBe(2);
    });

    it("computes the area lazily", () => {
        // Lazy matching is crucial to avoid executing unsafe code eagerly.
        // e.g., eager runs code for non-matching branches automatically.

        // With the initial eager match implementation, it fails with
        // `TypeError: Cannot read properties of undefined (reading 'find')`
        // because it calls the `PartialAccess` branch automatically (with no
        // arguments).

        type Allowed
            = { tag: "FullAccess" }
            | { tag: "PartialAccess", paths: string[] };

        type PartialAccess = { paths: string[] };

        const findBasePath = (path: string) => (allowedPaths: string[]) =>
            allowedPaths.find(allowedPath => path.startsWith(allowedPath));

        // `{ paths }: PartialAccess` param type defines the argument of the
        // `PartialAccess` variant unlike `FullAccess` that has no fields.

        const belongsToPartialAccess
            = (path: string) => ({ paths }: PartialAccess): boolean => pipe(
            paths,
            findBasePath(path),
            O.fromNullable,
            O.isSome,
        );

        const isPathAllowed = (path: string, allowed: Allowed): boolean => {
            const withAllowedVariant = withMatchVariant<boolean>(allowed);

            return pipe(
                allowed,
                match({
                    FullAccess: () => true,
                    PartialAccess:
                        withAllowedVariant(belongsToPartialAccess(path)),
                }),
            );
        };

        const adminPath = "users/admin";
        const fullAccess: Allowed = { tag: "FullAccess" };
        const partialAccess: Allowed = {
            tag: "PartialAccess",
            paths: ["public", "users/guest"],
        };

        const isFullAccessAllowed = isPathAllowed(adminPath, fullAccess);
        const isPartialAccessAllowed = isPathAllowed(adminPath, partialAccess);

        expect(isFullAccessAllowed).toBe(true);
        expect(isPartialAccessAllowed).toBe(false);
    });
});
