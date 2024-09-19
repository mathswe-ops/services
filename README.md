<!-- Copyright (c) 2024 Tobias Briones. All rights reserved. -->
<!-- SPDX-License-Identifier: BSD-3-Clause -->
<!-- This file is part of https://github.com/mathswe-ops/services -->

# MathSwe Ops Services

[![Project](https://mathswe-ops-services.tobiasbriones-dev.workers.dev/badge/project/mathswe-ops-services)](https://ops.math.software#services)
&nbsp;
[![GitHub Repository](https://img.shields.io/static/v1?label=GITHUB&message=REPOSITORY&labelColor=555&color=0277bd&style=for-the-badge&logo=GITHUB)](https://github.com/mathswe-ops/services)

[![GitHub Project License](https://img.shields.io/github/license/mathswe-ops/services.svg?style=flat-square)](https://github.com/mathswe-ops/services/blob/main/LICENSE)

[![GitHub Release](https://mathswe-ops-services.tobiasbriones-dev.workers.dev/badge/version/github/mathswe-ops/services?)](https://github.com/mathswe-ops/services/releases/latest)

MathSwe Ops with all the general purpose web Services to develop and deploy
mathematical software.

## Getting Started

Run development mode with `npm run start` or `npm run dev`.

Run tests with `npm run test`.

To deploy, login to the Wrangler CLI via `wrangler login`, and run `npm run 
deploy`.

## API

The application is currently running at
[mathswe-ops-services.tobiasbriones-dev.workers.dev](https://mathswe-ops-services.tobiasbriones-dev.workers.dev).

| Method | Endpoint                                  | Description                  | Parameters                                                                                                                                                                      |
|--------|-------------------------------------------|------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| GET    | `/`                                       | Welcome message              | None                                                                                                                                                                            |
| GET    | `/badge/version/:gitPlatform/:user/:repo` | Badge for repository version | `:gitPlatform` - Only GitHub supported<br>`:user` - Repository user or Org<br>`:repo` - Repository name<br> `?path` - Project's root subdirectory (e.g., a microservice or MVP) |
| GET    | `/badge/project/:project`                 | Main badge for a project     | `:project` - MathSwe project name<br>`?mvp` - Flag for MVP versions                                                                                                             |

`Version Badge Types`

```ts
type VersionBadgeParams = {
    gitPlatform: GitPlatform,
    user: string,
    repo: string,
    root: Option<string>
}
```

`Project Badge Types`

```ts
type Project
    = { tag: "Msw" }
    | { tag: "MathSoftware" }
    | { tag: "Repsymo" }
    | { tag: "Texsydo" }
    | { tag: "MathSweOps" }
    | { tag: "MathSweSystemOps" }
    | { tag: "MathSweOpsServices" }
    | { tag: "MathSwe" }
```

Recall the URL param is lowercase, e.g. `MathSoftware => math-software`.

## Contact

Tobias Briones: [GitHub](https://github.com/tobiasbriones)
[LinkedIn](https://linkedin.com/in/tobiasbriones)

## About

**MathSwe Ops Services**

MathSwe Ops with all the general purpose web Services to develop and deploy
mathematical software.

Copyright © 2024 Tobias Briones. All rights reserved.

### License

This project is licensed under the
[BSD-3-Clause License](LICENSE).
