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
    ThemeComponentDefinition,
    ThemeComponentDefinitionFromJSON,
    ThemeComponentDefinitionFromJSONTyped,
    ThemeComponentDefinitionToJSON,
} from './';

/**
 * 
 * @export
 * @interface ThemeDefinition
 */
export interface ThemeDefinition {
    /**
     * 
     * @type {Array<ThemeComponentDefinition>}
     * @memberof ThemeDefinition
     */
    data?: Array<ThemeComponentDefinition>;
}

export function ThemeDefinitionFromJSON(json: any): ThemeDefinition {
    return ThemeDefinitionFromJSONTyped(json, false);
}

export function ThemeDefinitionFromJSONTyped(json: any, ignoreDiscriminator: boolean): ThemeDefinition {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'data': !exists(json, 'data') ? undefined : ((json['data'] as Array<any>).map(ThemeComponentDefinitionFromJSON)),
    };
}

export function ThemeDefinitionToJSON(value?: ThemeDefinition | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'data': value.data === undefined ? undefined : ((value.data as Array<any>).map(ThemeComponentDefinitionToJSON)),
    };
}

