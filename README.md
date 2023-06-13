# Visual Dynamics

[![GitHub](https://img.shields.io/github/license/LABIOQUIM/visualdynamics)](https://github.com/LABIOQUIM/visualdynamics/blob/main/LICENSE)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.7585469.svg)](https://doi.org/10.5281/zenodo.7585469)

Visual Dynamics is a web application made platform for molecular simulations. It aims to automatize the generation and execution of a molecular simulation with capabilities to generate and run dynamics of Protein and Protein + Ligand (prepared in ACPYPE or PRODRG).

## Translations
Visual Dynamics is publicly translated on [Crowdin](https://crowdin.com). You can help too, just click [here](https://crowdin.com/proofread/visualdynamics/all/en-enus?filter=basic&value=0).  
If you want to bring Visual Dynamics to more languages, just open an issue and we'll find the best way to do this.

## Built with
- Front-end
  - Next.js: Reactjs framework
  - TailwindCSS: Styling
  - TanStack React Query: Data fetching
  - NextAuth: User authentication
  - Prisma: Database ORM
- Back-end
  - Flask: Python framework
  - Flask RESTful: RESTful integration for Flask
  - Celery: Asynchronous job runner
  - Redis: Message queue for Celery

## License
The Visual Dynamics source code is available under the [MIT License](./LICENSE). Some of the dependencies are licensed differently, so watch out for them.