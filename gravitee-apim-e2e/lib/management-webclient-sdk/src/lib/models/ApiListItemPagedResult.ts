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
    ApiListItem,
    ApiListItemFromJSON,
    ApiListItemFromJSONTyped,
    ApiListItemToJSON,
    Page,
    PageFromJSON,
    PageFromJSONTyped,
    PageToJSON,
} from './';

/**
 * 
 * @export
 * @interface ApiListItemPagedResult
 */
export interface ApiListItemPagedResult {
    /**
     * 
     * @type {Array<ApiListItem>}
     * @memberof ApiListItemPagedResult
     */
    data?: Array<ApiListItem>;
    /**
     * 
     * @type {{ [key: string]: { [key: string]: any; }; }}
     * @memberof ApiListItemPagedResult
     */
    metadata?: { [key: string]: { [key: string]: any; }; };
    /**
     * 
     * @type {Page}
     * @memberof ApiListItemPagedResult
     */
    page?: Page;
}

export function ApiListItemPagedResultFromJSON(json: any): ApiListItemPagedResult {
    return ApiListItemPagedResultFromJSONTyped(json, false);
}

export function ApiListItemPagedResultFromJSONTyped(json: any, ignoreDiscriminator: boolean): ApiListItemPagedResult {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'data': !exists(json, 'data') ? undefined : ((json['data'] as Array<any>).map(ApiListItemFromJSON)),
        'metadata': !exists(json, 'metadata') ? undefined : json['metadata'],
        'page': !exists(json, 'page') ? undefined : PageFromJSON(json['page']),
    };
}

export function ApiListItemPagedResultToJSON(value?: ApiListItemPagedResult | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'data': value.data === undefined ? undefined : ((value.data as Array<any>).map(ApiListItemToJSON)),
        'metadata': value.metadata,
        'page': PageToJSON(value.page),
    };
}

