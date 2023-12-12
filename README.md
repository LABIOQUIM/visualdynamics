# Visual Dynamics

[![GitHub](https://img.shields.io/github/license/LABIOQUIM/visualdynamics)](https://github.com/LABIOQUIM/visualdynamics/blob/main/LICENSE)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.7585469.svg)](https://doi.org/10.5281/zenodo.7585469)

Visual Dynamics is a web application made platform for molecular simulations. It aims to automatize the generation and execution of a molecular simulation with capabilities to generate and run dynamics of Protein and Protein + Ligand (prepared in ACPYPE or PRODRG).

## Self-hosting
If you want to self-host Visual Dynamics just stick to the steps below (this only works on Linux):
1. Make sure to have [nodejs](https://nodejs.org/en), [yarn](https://yarnpkg.com/), [docker](https://www.docker.com/) , [docker compose](https://docs.docker.com/compose/install/linux/#install-the-plugin-manually) and the docker plugin [nfsvol](https://github.com/cirocosta/nfsvol).
1. Copy the file `.env.example` to `.env` and fill it. The ones you need to change are: `VISUALDYNAMICS_URL` (for this tutorial we'll assume this is set to `visualdynamics.localhost`), `DB_USER`, `DB_PASS` and `DB_DATABASE`, `NEXTAUTH_SECRET`, `SMTP_USER`, `SMTP_HOST`, `SMTP_PASS` and `SMTP_PORT`
1. Run `docker compose -f docker-compose.prod.yml up -d --build`
1. Enter the folder `client` and run `yarn install`.
1. Run `DATABASE_URL=postgres://DB_USER:DB_PASS@localhost:5432/DB_DATABASE yarn prisma migrate deploy`. Note the `DB_` fields that must be the ones you set on `.env`
1. Run `DATABASE_URL=postgres://DB_USER:DB_PASS@localhost:5432/DB_DATABASE yarn prisma db seed`. Note the `DB_` fields that must be the ones you set on `.env`
1. Now you can open a browser and access [`visualdynamics.localhost`](http://visualdynamics.localhost).

> Note: This tutorial will make Visual Dynamics available on only ONE machine.

> Note: If you plan to run Visual Dynamics to your whole institution, please coordinate with your IT Sector to address the intricacies of your institution infrastructure.

## License
The Visual Dynamics source code is available under the [MIT License](./LICENSE). Some of the dependencies are licensed differently, so watch out for them.
