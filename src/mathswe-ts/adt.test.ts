// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { describe, expect, it } from "vitest";
import { match } from "./adt";
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
});
