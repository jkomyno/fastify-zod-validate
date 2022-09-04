import fp from 'fastify-plugin'
import { FastifyPluginCallback, FastifySchemaCompiler, FastifyTypeProvider } from 'fastify'
import { z, ZodAny, ZodTypeAny } from 'zod'
import type { FastifySerializerCompiler } from 'fastify/types/schema'

export interface ZodValidateTypeProvider extends FastifyTypeProvider {
  output: this['input'] extends ZodTypeAny ? z.infer<this['input']> : never
}

declare module 'fastify' {
  interface FastifyInstance<RawServer, RawRequest, RawReply, Logger> {
    withTypeProvider(): FastifyInstance<RawServer, RawRequest, RawReply, Logger, ZodValidateTypeProvider>
  }
}

export type FastifyZodValidateOptions = {
  handleValidatorError?: (error: z.ZodError<any>, data: any) => any
  handleSerializerError?: <E extends Error>(error: z.ZodError<any>, data: any) => E
}

const fastifyZodValidate: FastifyPluginCallback<FastifyZodValidateOptions> = (fastify, inputOptions, next) => {
  const defaultOptions = {
    /**
     * default error handlers
     */
    handleValidatorError: (error: z.ZodError<any>) => ({ error }),
    handleSerializerError: (error: z.ZodError<any>) => new Error('Response is incompatible with the schema'),
  }

  const options = { ...defaultOptions, ...inputOptions }

  /**
   * Handle validation with custom error handler.
   */
  const validatorCompiler: FastifySchemaCompiler<ZodAny> =
    ({ schema }) =>
    (data) => {
      const validatedValue = schema.safeParse(data)

      if (validatedValue.success) {
        return { value: validatedValue.data }
      }

      return options.handleValidatorError(validatedValue.error, data)
    }

  /**
   * Handle serialization with custom error handler.
   */
  const serializerCompiler: FastifySerializerCompiler<ZodAny> =
    ({ schema }) =>
    (data): string => {
      const result = schema.safeParse(data)

      if (result.success) {
        // TODO: evaluate whether it's possible to use `fast-json-stringify` directly
        return JSON.stringify(result.data)
      }

      throw options.handleSerializerError(result.error, data)
    }

  fastify.setValidatorCompiler(validatorCompiler)
  fastify.setSerializerCompiler(serializerCompiler)

  next()
}

export default fp(fastifyZodValidate, {
  fastify: '4.x',
  name: 'fastify-zod-validate',
})
