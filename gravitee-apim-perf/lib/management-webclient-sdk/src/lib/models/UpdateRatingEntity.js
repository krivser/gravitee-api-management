/* tslint:disable */
/* eslint-disable */
/**
 * Gravitee.io - Management API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { exists } from '../runtime';
export function UpdateRatingEntityFromJSON(json) {
    return UpdateRatingEntityFromJSONTyped(json, false);
}
export function UpdateRatingEntityFromJSONTyped(json, ignoreDiscriminator) {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        'api': !exists(json, 'api') ? undefined : json['api'],
        'comment': !exists(json, 'comment') ? undefined : json['comment'],
        'id': !exists(json, 'id') ? undefined : json['id'],
        'rate': !exists(json, 'rate') ? undefined : json['rate'],
        'title': !exists(json, 'title') ? undefined : json['title'],
    };
}
export function UpdateRatingEntityToJSON(value) {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        'api': value.api,
        'comment': value.comment,
        'id': value.id,
        'rate': value.rate,
        'title': value.title,
    };
}