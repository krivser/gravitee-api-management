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
import { MetadataFormatFromJSON, MetadataFormatToJSON, } from './';
export function MetadataEntityFromJSON(json) {
    return MetadataEntityFromJSONTyped(json, false);
}
export function MetadataEntityFromJSONTyped(json, ignoreDiscriminator) {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        'format': !exists(json, 'format') ? undefined : MetadataFormatFromJSON(json['format']),
        'key': !exists(json, 'key') ? undefined : json['key'],
        'name': json['name'],
        'value': !exists(json, 'value') ? undefined : json['value'],
    };
}
export function MetadataEntityToJSON(value) {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        'format': MetadataFormatToJSON(value.format),
        'key': value.key,
        'name': value.name,
        'value': value.value,
    };
}