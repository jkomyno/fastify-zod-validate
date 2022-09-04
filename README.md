# fastify-zod-validate

![CI](https://github.com/jkomyno/fastify-zod-validate/workflows/ci/badge.svg?branch=main)
[![NPM version](https://img.shields.io/npm/v/fastify-zod-validate.svg?style=flat)](https://www.npmjs.com/package/fastify-zod-validate)

A type-safe validation plugin for [Fastify](https://github.com/fastify/fastify) `4.x` and [Zod](https://github.com/colinhacks/zod), arguably the best TypeScript-first validation library.

## Install

```
npm i -S fastify-zod-validate
```

## Features

- Opt-in schema validation for each Fastify route via `fastify.withTypeProvider()`
- Customize schema validation error when registering the plugin

## Assumptions

- Fastify `4.x` and Zod `3.x` are already installed in your project

## Usage

The`fastify-zod-validate` plugin decorates the `fastify` instance with a `withTypeProvider` function, which can be used to compile and validate the `fastify` schemas (comprising HTTP body, path parameters, query parameters, headers and more) using the `zod` library.
You can import the plugin using a default import:

```typescript
import fastifyZodValidate from 'fastify-zod-validate'
```

- Define your schemas using `zod`:

```typescript
import { z } from 'zod'

export const UserBody = z.object({
  username: z.string().min(5).max(10),
  balance: z.number().min(1000),
}).strict()
export type UserBody = z.infer<typeof UserBody>

export const UserPathParams = z.object({
  userID: z.string().min(4).max(4),
}).strict()
export type UserPathParams = z.infer<typeof UserPathParams>
```

- Define your `fastify` router with type-safe schema validation built-in:

```typescript
import { FastifyPluginCallback } from 'fastify'

export const zodValidateRouter: FastifyPluginCallback = (fastify, options, next) => {
  fastify.withTypeProvider().route({
    method: 'POST',
    url: '/user/:userID',
    schema: {
      body: UserBody,
      params: UserPathParams,
    },
    handler: async (request, reply) => {
      // no casting or @ts-ignore required
      const { body, params } = request
      const { userID } = params
  
      await reply.status(200).send({
        data: {
          message: `OK user with ID ${userID}`,
          body,
          query,
        },
      })
    }
  })

  next()
}
```

- Register the plugin and setup your `fastify` server:

```typescript
import fastifyZodValidate from 'fastify-zod-validate'
import Fastify, { FastifyInstance, FastifyPluginCallback } from 'fastify'

export async function setupServer() {
  const server = Fastify()

  // register the plugin
  server.register(fastifyZodValidate, {
    // optional custom validation error handler
    handleValidatorError: (error, data) => {
      const validationError = new Error('Unprocessable Entity - Custom Zod Validation Error')

      // @ts-ignore
      validationError.statusCode = 422
      return { error: validationError }
    },
  })

  // register the router
  server.register(zodValidateRouter, { prefix: 'route' })

  await server.ready()
  return server
}
```

We encourage you to take a look at the [`__tests__`](./__tests__) folder for a more complete example.

---------------------------------------------------------

## 🚀 Build and Test package

This package is built using **TypeScript**, so the source needs to be converted in JavaScript before being usable by the users.
This can be achieved by using TypeScript directly:

```sh
npm run build
```

We run tests via Jest:

```sh
npm run test
```

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/jkomyno/fastify-zod-validate/issues).
The code is short and tested, so you should feel quite comfortable working on it.
If you have any doubt or suggestion, please open an issue.

## ⚠️ Issues

Chances are the problem you have bumped into have already been discussed and solved in the past.
Please take a look at the issues (both the closed ones and the comments to the open ones) before opening a new issue.

## 🦄 Show your support

Give a ⭐️ if this project helped or inspired you! In the future, I might consider offering premium support to Github Sponsors.

## 👤 Authors

- **Alberto Schiabel**
  * Github: [@jkomyno](https://github.com/jkomyno)
  * Twitter: [@jkomyno](https://twitter.com/jkomyno)

## 📝 License

Built with ❤️ by [Alberto Schiabel](https://github.com/jkomyno).<br />
This project is [MIT](https://github.com/jkomyno/fastify-zod-validate/blob/main/LICENSE) licensed.
