// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { describe, expect, it } from "vitest";
import { match, matchVariant } from "./adt";
import { pipe } from "fp-ts/function";

describe("SumTypeMap", () => {
    type Shape = { type: "Point" } | { type: "Circle", radius: number };

    const point: Shape = { type: "Point" };
    const circle: Shape = { type: "Circle", radius: 1 };

    it("should match sum type variants with type safe exhaustive map", () => {
        const label = (shape: Shape) => match(
            { "Point": "point-variant", "Circle": "circle-variant" },
        )(shape);

        expect(label(point)).toBe("point-variant");
        expect(label(circle)).toBe("circle-variant");
    });

    it("should pipe match with type safe exhaustive map", () => {
        const label = (shape: Shape) => pipe(
            shape,
            match(
                { "Point": "point-variant", "Circle": "circle-variant" },
            ),
        );

        expect(label(point)).toBe("point-variant");
        expect(label(circle)).toBe("circle-variant");
    });

    it("computes the area via matching and destructure", () => {
        type Circle = { radius: number };

        const circleArea
            = ({ radius }: Circle) => Math.PI * Math.pow(radius, 2);

        const area = (shape: Shape): number => {
            const shapeVariant = matchVariant<number>(shape);

            return pipe(
                shape,
                match(
                    {
                        "Point": 0,
                        "Circle": shapeVariant(circleArea),
                    }),
            );
        };

        expect(area(point)).toBe(0);
        expect(area(circle)).toBe(Math.PI);
    });
});
