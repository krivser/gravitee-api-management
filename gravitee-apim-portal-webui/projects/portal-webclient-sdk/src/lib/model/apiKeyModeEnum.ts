/**
 * Gravitee.io Portal Rest API
 * API dedicated to the devportal part of Gravitee
 *
 * Contact: contact@graviteesource.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * The API Key mode to use for this application.   - The `SHARED` API Key mode allows consumer to use the same API Key across all the subscriptions   - The `EXCLUSIVE` API Key mode will result to a new API Key being generated for each subscription   - The `UNSPECIFIED` API Key mode is a marker value informing that no choice as been made yet regarding     the API Key mode to use for the application.
 */
export type ApiKeyModeEnum = 'SHARED' | 'EXCLUSIVE' | 'UNSPECIFIED';

export const ApiKeyModeEnum = {
  SHARED: 'SHARED' as ApiKeyModeEnum,
  EXCLUSIVE: 'EXCLUSIVE' as ApiKeyModeEnum,
  UNSPECIFIED: 'UNSPECIFIED' as ApiKeyModeEnum,
};
