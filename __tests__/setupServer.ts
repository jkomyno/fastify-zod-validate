import Fastify, { FastifyInstance, FastifyPluginCallback } from 'fastify'
import { z } from 'zod'
import fastifyZodValidate, { ZodValidateTypeProvider } from '../src'
import { UserBody, UserPathParams, UserQueryParams } from './entity'
import { testConfig } from './testConfig'

export const noProviderRouter: FastifyPluginCallback = (fastify, options, next) => {
  fastify.post('/user/:userID', async (request, reply) => {
    const { body, query, params } = request
    const { userID } = params as { userID: string }

    await reply.status(200).send({
      data: {
        message: `OK user with ID ${userID}`,
        body,
        query,
      },
    })
  })

  next()
}

export const zodValidateImplicitProviderRouter: FastifyPluginCallback = (fastify, options, next) => {
  fastify.withTypeProvider().route({
    method: 'POST',
    url: '/user/:userID',
    schema: {
      body: UserBody,
      params: UserPathParams,
      querystring: UserQueryParams,
    },
    handler: async (request, reply) => {
      const { body, query, params } = request
      const { userID } = params

      await reply.status(200).send({
        data: {
          message: `OK user with ID ${userID}`,
          body,
          query,
        },
      })
    },
  })

  next()
}

export const zodValidateExplicitProviderRouter: FastifyPluginCallback = (fastify, options, next) => {
  fastify.withTypeProvider<ZodValidateTypeProvider>().route({
    method: 'POST',
    url: '/user/:userID',
    schema: {
      body: UserBody,
      params: UserPathParams,
      querystring: UserQueryParams,
    },
    handler: async (request, reply) => {
      const { body, query, params } = request
      const { userID } = params

      await reply.status(200).send({
        data: {
          message: `OK user with ID ${userID}`,
          body,
          query,
        },
      })
    },
  })

  next()
}

export type SetupServer = {
  setupRouters: (server: ReturnType<typeof Fastify>) => void
  handleValidatorError?: <E extends Error>(error: z.ZodError<any>, data: any) => { error: E | Error }
}

export async function setupServer(setupParams: SetupServer) {
  const server = Fastify()
  const { setupRouters, ...rest } = setupParams

  server.register(fastifyZodValidate, rest)
  setupRouters(server)

  await server.ready()
  return server
}

export async function startServer(fastify: FastifyInstance): Promise<string> {
  const port = await fastify.listen({ host: testConfig.APP_HOST, port: testConfig.APP_PORT })
  return port
}
