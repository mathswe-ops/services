// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { describe, expect, it } from "vitest";
import { match, withMatchVariant } from "./adt";
import { pipe } from "fp-ts/function";

describe("SumTypeMap", () => {
    type Shape = { tag: "Point" } | { tag: "Circle", radius: number };

    const point: Shape = { tag: "Point" };
    const circle: Shape = { tag: "Circle", radius: 1 };

    it("should match sum type variants with type safe exhaustive map", () => {
        const label = (shape: Shape) => match({
            Point: "point-variant",
            Circle: "circle-variant",
        })(shape);

        expect(label(point)).toBe("point-variant");
        expect(label(circle)).toBe("circle-variant");
    });

    it("should pipe match with type safe exhaustive map", () => {
        const label = (shape: Shape) => pipe(
            shape,
            match({
                Point: "point-variant",
                Circle: "circle-variant",
            }),
        );

        expect(label(point)).toBe("point-variant");
        expect(label(circle)).toBe("circle-variant");
    });

    it("computes the area via matching and destructure", () => {
        type Circle = { radius: number };

        const circleArea
            = ({ radius }: Circle) => Math.PI * Math.pow(radius, 2);

        const area = (shape: Shape): number => {
            const withShapeVariant = withMatchVariant<number>(shape);

            return pipe(
                shape,
                match({
                    Point: 0,
                    Circle: withShapeVariant(circleArea),
                }),
            );
        };

        expect(area(point)).toBe(0);
        expect(area(circle)).toBe(Math.PI);
    });
});
