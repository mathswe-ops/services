// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { describe, expect, it } from "vitest";
import { match } from "./adt";

describe("SumTypeMap", () => {
    it("should match sum type variants with type safe exhaustive map", () => {
        type Shape = { type: "Point" } | { type: "Circle", radius: number };

        const point: Shape = { type: "Point" };
        const circle: Shape = { type: "Circle", radius: 1 };
        const label = (shape: Shape) => match(
            shape,
            { "Point": "point-variant", "Circle": "circle-variant" },
        );

        expect(label(point)).toBe("point-variant");
        expect(label(circle)).toBe("circle-variant");
    });
});
