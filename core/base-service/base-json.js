/**
 * @module
 */

import BaseService from './base.js'
import { parseJson } from './json.js'

/**
 * Services which query a JSON endpoint should extend BaseJsonService
 *
 * @abstract
 */
class BaseJsonService extends BaseService {
  /**
   * Parse data from JSON endpoint
   *
   * @param {string} buffer JSON response from upstream API
   * @returns {object} Parsed response
   */
  _parseJson(buffer) {
    return parseJson(buffer)
  }

  /**
   * Request data from an upstream API serving JSON,
   * parse it and validate against a schema
   *
   * @param {object} attrs Refer to individual attrs
   * @param {Joi} attrs.schema Joi schema to validate the response against
   * @param {string} attrs.url URL to request
   * @param {object} [attrs.options={}] Options to pass to got. See
   *    [documentation](https://github.com/sindresorhus/got/blob/main/documentation/2-options.md)
   * @param {object} [attrs.httpErrors={}] Key-value map of status codes
   *    and custom error messages e.g: `{ 404: 'package not found' }`.
   *    This can be used to extend or override the
   *    [default](https://github.com/badges/shields/blob/master/core/base-service/check-error-response.js#L5)
   * @param {object} [attrs.systemErrors={}] Key-value map of got network exception codes
   *    and an object of params to pass when we construct an Inaccessible exception object
   *    e.g: `{ ECONNRESET: { prettyMessage: 'connection reset' } }`.
   *    See {@link https://github.com/sindresorhus/got/blob/main/documentation/7-retry.md#errorcodes got error codes}
   *    for allowed keys
   *    and {@link module:core/base-service/errors~RuntimeErrorProps} for allowed values
   * @returns {object} Parsed response
   * @see https://github.com/sindresorhus/got/blob/main/documentation/2-options.md
   */
  async _requestJson({
    schema,
    url,
    options = {},
    httpErrors = {},
    systemErrors = {},
  }) {
    const mergedOptions = {
      ...{ headers: { Accept: 'application/json' } },
      ...options,
    }
    const { buffer } = await this._request({
      url,
      options: mergedOptions,
      httpErrors,
      systemErrors,
    })
    const json = this._parseJson(buffer)
    return this.constructor._validate(json, schema)
  }
}

export default BaseJsonService
