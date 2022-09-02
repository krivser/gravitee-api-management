/* tslint:disable */
/* eslint-disable */
/**
 * Gravitee.io - Management API
 * Some news resources are in alpha version. This implies that they are likely to be modified or even removed in future versions. They are marked with the 🧪 symbol
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import type { RequestHeaders } from './RequestHeaders';
import {
    RequestHeadersFromJSON,
    RequestHeadersFromJSONTyped,
    RequestHeadersToJSON,
} from './RequestHeaders';

/**
 * 
 * @export
 * @interface Response
 */
export interface Response {
    /**
     * 
     * @type {string}
     * @memberof Response
     */
    body?: string;
    /**
     * 
     * @type {RequestHeaders}
     * @memberof Response
     */
    headers?: RequestHeaders;
    /**
     * 
     * @type {number}
     * @memberof Response
     */
    status?: number;
}

/**
 * Check if a given object implements the Response interface.
 */
export function instanceOfResponse(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function ResponseFromJSON(json: any): Response {
    return ResponseFromJSONTyped(json, false);
}

export function ResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): Response {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'body': !exists(json, 'body') ? undefined : json['body'],
        'headers': !exists(json, 'headers') ? undefined : RequestHeadersFromJSON(json['headers']),
        'status': !exists(json, 'status') ? undefined : json['status'],
    };
}

export function ResponseToJSON(value?: Response | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'body': value.body,
        'headers': RequestHeadersToJSON(value.headers),
        'status': value.status,
    };
}
