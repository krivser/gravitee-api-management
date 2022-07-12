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

import { exists, mapValues } from '../runtime';
import {
    MetadataFormat,
    MetadataFormatFromJSON,
    MetadataFormatFromJSONTyped,
    MetadataFormatToJSON,
} from './';

/**
 * 
 * @export
 * @interface NewApplicationMetadataEntity
 */
export interface NewApplicationMetadataEntity {
    /**
     * 
     * @type {string}
     * @memberof NewApplicationMetadataEntity
     */
    applicationId?: string;
    /**
     * 
     * @type {string}
     * @memberof NewApplicationMetadataEntity
     */
    defaultValue?: string;
    /**
     * 
     * @type {MetadataFormat}
     * @memberof NewApplicationMetadataEntity
     */
    format?: MetadataFormat;
    /**
     * 
     * @type {boolean}
     * @memberof NewApplicationMetadataEntity
     */
    hidden?: boolean;
    /**
     * 
     * @type {string}
     * @memberof NewApplicationMetadataEntity
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof NewApplicationMetadataEntity
     */
    value?: string;
}

export function NewApplicationMetadataEntityFromJSON(json: any): NewApplicationMetadataEntity {
    return NewApplicationMetadataEntityFromJSONTyped(json, false);
}

export function NewApplicationMetadataEntityFromJSONTyped(json: any, ignoreDiscriminator: boolean): NewApplicationMetadataEntity {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'applicationId': !exists(json, 'applicationId') ? undefined : json['applicationId'],
        'defaultValue': !exists(json, 'defaultValue') ? undefined : json['defaultValue'],
        'format': !exists(json, 'format') ? undefined : MetadataFormatFromJSON(json['format']),
        'hidden': !exists(json, 'hidden') ? undefined : json['hidden'],
        'name': json['name'],
        'value': !exists(json, 'value') ? undefined : json['value'],
    };
}

export function NewApplicationMetadataEntityToJSON(value?: NewApplicationMetadataEntity | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'applicationId': value.applicationId,
        'defaultValue': value.defaultValue,
        'format': MetadataFormatToJSON(value.format),
        'hidden': value.hidden,
        'name': value.name,
        'value': value.value,
    };
}

