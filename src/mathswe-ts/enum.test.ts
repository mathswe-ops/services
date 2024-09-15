// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { describe, expect, it } from "vitest";
import { pipe } from "fp-ts/function";
import { matchPlain } from "./enum";

describe("PlainEnum", () => {
    type Color = { tag: "Red" } | { tag: "Green" } | { tag: "Blue" };

    const red: Color = { tag: "Red" };
    const green: Color = { tag: "Green" };
    const blue: Color = { tag: "Blue" };

    it("should match enum variants manually", () => {
        const label = (color: Color) => matchPlain({
            Red: "red-variant",
            Green: "green-variant",
            Blue: "blue-variant",
        })(color);

        expect(label(red)).toBe("red-variant");
        expect(label(green)).toBe("green-variant");
        expect(label(blue)).toBe("blue-variant");
    });

    it("should pipe match enum variants with type safe exhaustive map", () => {
        const label = (color: Color) => pipe(
            color,
            matchPlain({
                Red: "red-variant",
                Green: "green-variant",
                Blue: "blue-variant",
            }),
        );

        expect(label(red)).toBe("red-variant");
        expect(label(green)).toBe("green-variant");
        expect(label(blue)).toBe("blue-variant");
    });
});

describe("SumType with Plain Variant Matching", () => {
    type Shape = { tag: "Point" } | { tag: "Circle", radius: number };

    const point: Shape = { tag: "Point" };
    const circle: Shape = { tag: "Circle", radius: 1 };

    it("should pipe match plain sum type variants", () => {
        const label = (shape: Shape) => pipe(
            shape,
            matchPlain({
                Point: "point-variant",
                Circle: "circle-variant",
            }),
        );

        expect(label(point)).toBe("point-variant");
        expect(label(circle)).toBe("circle-variant");
    });
});
