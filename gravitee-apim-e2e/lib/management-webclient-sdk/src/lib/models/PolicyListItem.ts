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
    PolicyType,
    PolicyTypeFromJSON,
    PolicyTypeFromJSONTyped,
    PolicyTypeToJSON,
} from './';

/**
 * 
 * @export
 * @interface PolicyListItem
 */
export interface PolicyListItem {
    /**
     * 
     * @type {string}
     * @memberof PolicyListItem
     */
    category?: string;
    /**
     * 
     * @type {string}
     * @memberof PolicyListItem
     */
    description?: string;
    /**
     * 
     * @type {string}
     * @memberof PolicyListItem
     */
    documentation?: string;
    /**
     * 
     * @type {string}
     * @memberof PolicyListItem
     */
    icon?: string;
    /**
     * 
     * @type {string}
     * @memberof PolicyListItem
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof PolicyListItem
     */
    name?: string;
    /**
     * 
     * @type {boolean}
     * @memberof PolicyListItem
     */
    onRequest?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof PolicyListItem
     */
    onResponse?: boolean;
    /**
     * 
     * @type {string}
     * @memberof PolicyListItem
     */
    schema?: string;
    /**
     * 
     * @type {PolicyType}
     * @memberof PolicyListItem
     */
    type?: PolicyType;
    /**
     * 
     * @type {string}
     * @memberof PolicyListItem
     */
    version?: string;
}

export function PolicyListItemFromJSON(json: any): PolicyListItem {
    return PolicyListItemFromJSONTyped(json, false);
}

export function PolicyListItemFromJSONTyped(json: any, ignoreDiscriminator: boolean): PolicyListItem {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'category': !exists(json, 'category') ? undefined : json['category'],
        'description': !exists(json, 'description') ? undefined : json['description'],
        'documentation': !exists(json, 'documentation') ? undefined : json['documentation'],
        'icon': !exists(json, 'icon') ? undefined : json['icon'],
        'id': !exists(json, 'id') ? undefined : json['id'],
        'name': !exists(json, 'name') ? undefined : json['name'],
        'onRequest': !exists(json, 'onRequest') ? undefined : json['onRequest'],
        'onResponse': !exists(json, 'onResponse') ? undefined : json['onResponse'],
        'schema': !exists(json, 'schema') ? undefined : json['schema'],
        'type': !exists(json, 'type') ? undefined : PolicyTypeFromJSON(json['type']),
        'version': !exists(json, 'version') ? undefined : json['version'],
    };
}

export function PolicyListItemToJSON(value?: PolicyListItem | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'category': value.category,
        'description': value.description,
        'documentation': value.documentation,
        'icon': value.icon,
        'id': value.id,
        'name': value.name,
        'onRequest': value.onRequest,
        'onResponse': value.onResponse,
        'schema': value.schema,
        'type': PolicyTypeToJSON(value.type),
        'version': value.version,
    };
}

