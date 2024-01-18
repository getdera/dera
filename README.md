# Dera - Data Encoding and Representation Analysis

## Dera
[Dera](https://getdera.com) is a tool to manage chunks and embeddings so that users can iterate rapidly on different chunking strategies. Through this, it aims to help users build better Retrieval-Augmented Generation (RAG) apps.

### Problem
A good RAG system depends on good retrievals, and good retrievals depend on good chunking strategies that result in quality embeddings. There is no good tool for testing out different chunking strategies:
  - Vector databases are too sophisticated (and expensive) for iterating during development phase. They are good for production usage when you have settled on your chunks.
  - The alternatives are either
    - Write chunks and embeddings into local files. At runtime, read them into memory and use a library to do similarity matching. It is hard to track the different versions, evaluate results, and you don't get the benefits of using a proper database with vector support.
    - Setup your own database (e.g. Postgres with PgVector), but you still have to manage your schemas, and there is no easy way to evaluate results as a team.

### How it works
Dera provides a web application for users to define embedding schemas. Each embedding schema is a Postgres table. Once a schema has been created, users can upload text and embeddings to the schema, or match embeddings through the `REST` APIs.

Each match query and its results are stored and can be reviewed in the web application.

Dera is not a strategy provider or tries to suggest any - you decide the chunking strategy and generate your embeddings. Dera handles the rest.

### Components (& self-hosting)
Dera is split into 2 components - frontend and the backend. Refer to the READMEs in each component's folder for more details, including instructions on self-hosting.
- [Dera FE](/dera-fe/) is the codebase for the frontend.
- [Dera BE](/dera-be/) is the codebase for the backend.

#### Embedding schema database
Dera is built on [Neon](https://neon.tech/) - a serverless Postgres offering that allows database branching. We think the technology is amazing and by building on Neon, we can:
1. provide the most cost-efficient product for our users.
2. build the many cool features in our roadmap for the future.

### Community & Support
- [Github Issues](https://github.com/getdera/dera/issues). Please file any bugs or feature requests here.
