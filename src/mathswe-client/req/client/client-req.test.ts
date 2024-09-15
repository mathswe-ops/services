// Copyright (c) 2024 Tobias Briones. All rights reserved.
// SPDX-License-Identifier: BSD-3-Clause
// This file is part of https://github.com/mathswe-ops/services

import { describe, expect, it } from "vitest";
import { left, right } from "fp-ts/Either";
import { getOrigin } from "./client-req";
import { pipe } from "fp-ts/function";
import { newOriginFromString } from "../origin/origin";
import { requireRight } from "../../../mathswe-ts/require";

describe("getOrigin", () => {
    it(
        "should return Right(Origin) when a valid Origin header is provided",
        () => {
            const mockRequest = {
                headers: {
                    get: (key: string) =>
                        key === "Origin"
                        ? "https://mathswe.com"
                        : null,
                },
            } as Request;

            const result = getOrigin(mockRequest);
            const expectedOrigin = pipe(
                "https://mathswe.com",
                newOriginFromString,
                requireRight,
            );

            expect(result).toEqual(right(expectedOrigin));
        },
    );

    it(
        "should return Left with an error message when the Origin header is invalid",
        () => {
            const mockRequest = {
                headers: {
                    get: (key: string) =>
                        key === "Origin"
                        ? "invalid-url"
                        : null,
                },
            } as Request;

            const result = getOrigin(mockRequest);

            expect(result)
                .toEqual(left("URL does not have the HTTPS protocol."));
        },
    );

    it(
        "should return Left with an error message when the Origin header is missing",
        () => {
            const mockRequest = {
                headers: {
                    get: () => null,
                },
            } as unknown as Request;

            const result = getOrigin(mockRequest);

            expect(result).toEqual(left("Request header `Origin` is null."));
        },
    );
});
