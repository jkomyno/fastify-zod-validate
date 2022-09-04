import { FastifyInstance } from 'fastify'
import {
  noProviderRouter,
  setupServer,
  startServer,
  zodValidateExplicitProviderRouter,
  zodValidateImplicitProviderRouter,
} from '../setupServer'
import { testConfig } from '../testConfig'

describe('fastify-zod-validate', () => {
  const variants = [
    {
      name: 'explicit-provider',
      router: zodValidateExplicitProviderRouter,
    },
    {
      name: 'implicit-provider',
      router: zodValidateImplicitProviderRouter,
    },
  ]

  variants.forEach(({ name, router }) => {
    describe(`${name}`, () => {
      let fastify: FastifyInstance

      beforeEach(async () => {
        fastify = await setupServer({
          setupRouters: (server) => {
            server.register(router, { prefix: name })
          },
          handleValidatorError: (error, data) => {
            const validationError = new Error('Unprocessable Entity - Custom Zod Validation Error')

            // @ts-ignore
            validationError.statusCode = 422
            return { error: validationError }
          },
        })
        const host = await startServer(fastify)
        expect(host.slice(-5)).toEqual(`:${testConfig.APP_PORT}`)
      })

      afterEach(async () => {
        await fastify.close()
      })

      test('[custom validation error handler] returns validation error', async () => {
        const res = await fastify.inject({
          url: `/${name}/user/1234?force=true`,
          method: 'POST',
          payload: {
            username: 'invalid, and checked',
            balance: -1,
          },
        })

        expect(res.statusCode).toEqual(422)
        const json = res.json()
        expect(json).toMatchObject({
          error: 'Unprocessable Entity',
          message: 'Unprocessable Entity - Custom Zod Validation Error',
          statusCode: 422,
        })
      })
    })

    describe(`${name}`, () => {
      let fastify: FastifyInstance

      beforeEach(async () => {
        fastify = await setupServer({
          setupRouters: (server) => {
            server.register(router, { prefix: name })
          },
        })
        const host = await startServer(fastify)
        expect(host.slice(-5)).toEqual(`:${testConfig.APP_PORT}`)
      })

      afterEach(async () => {
        await fastify.close()
      })

      test('[default] returns validation error', async () => {
        const res = await fastify.inject({
          url: `/${name}/user/1234?force=true`,
          method: 'POST',
          payload: {
            username: 'invalid, and checked',
            balance: -1,
          },
          headers: {
            Expires: 'invalid',
          },
        })

        expect(res.statusCode).toEqual(400)
        const json = res.json()
        expect(json).toMatchObject({
          error: 'Bad Request',
          statusCode: 400,
        })
        const message = JSON.parse(json.message)

        expect(message).toHaveLength(2)
        expect(message[0]).toMatchObject({
          code: 'too_big',
          path: ['username'],
        })
        expect(message[1]).toMatchObject({
          code: 'too_small',
          path: ['balance'],
        })
      })

      test('[default] returns unsupported media type error', async () => {
        const res = await fastify.inject({
          url: `/${name}/user/1234?force=true`,
          method: 'POST',

          // @ts-ignore
          payload: `{
            username: 'valid',
            balance: 1500,
          }`,
        })

        expect(res.statusCode).toEqual(415)
        const json = res.json()
        expect(json).toMatchObject({
          code: 'FST_ERR_CTP_INVALID_MEDIA_TYPE',
          error: 'Unsupported Media Type',
          message: 'Unsupported Media Type: undefined',
          statusCode: 415,
        })
      })

      test('validates and converts compliant inputs according to the zod spec', async () => {
        const res = await fastify.inject({
          url: `/${name}/user/1234?force=true`,
          method: 'POST',
          payload: {
            username: 'jkomyno',
            balance: 5000,
          },
        })

        expect(res.statusCode).toEqual(200)
        expect(res.json()).toEqual({
          data: {
            body: {
              username: 'jkomyno',
              balance: 5000,
            },
            message: 'OK user with ID 1234',
            query: {
              force: true,
            },
          },
        })
      })
    })
  })

  describe('no-provider', () => {
    let fastify: FastifyInstance

    beforeEach(async () => {
      fastify = await setupServer({
        setupRouters: (server) => {
          server.register(noProviderRouter, { prefix: 'no-provider' })
        },
      })
      const host = await startServer(fastify)
      expect(host.slice(-5)).toEqual(`:${testConfig.APP_PORT}`)
    })

    afterEach(async () => {
      await fastify.close()
    })

    test('validation is still optional', async () => {
      const res = await fastify.inject({
        url: '/no-provider/user/1234?force=true',
        method: 'POST',
        payload: {
          username: 'invalid, but not checked',
          balance: -1,
        },
      })

      expect(res.statusCode).toEqual(200)
      expect(res.json()).toEqual({
        data: {
          body: {
            balance: -1,
            username: 'invalid, but not checked',
          },
          message: 'OK user with ID 1234',
          query: {
            force: 'true',
          },
        },
      })
    })
  })
})
