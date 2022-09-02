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
import type { PromotionEntityAuthor } from './PromotionEntityAuthor';
import {
    PromotionEntityAuthorFromJSON,
    PromotionEntityAuthorFromJSONTyped,
    PromotionEntityAuthorToJSON,
} from './PromotionEntityAuthor';
import type { PromotionEntityStatus } from './PromotionEntityStatus';
import {
    PromotionEntityStatusFromJSON,
    PromotionEntityStatusFromJSONTyped,
    PromotionEntityStatusToJSON,
} from './PromotionEntityStatus';

/**
 * 
 * @export
 * @interface PromotionEntity
 */
export interface PromotionEntity {
    /**
     * 
     * @type {string}
     * @memberof PromotionEntity
     */
    apiDefinition?: string;
    /**
     * 
     * @type {string}
     * @memberof PromotionEntity
     */
    apiId?: string;
    /**
     * 
     * @type {PromotionEntityAuthor}
     * @memberof PromotionEntity
     */
    author?: PromotionEntityAuthor;
    /**
     * 
     * @type {Date}
     * @memberof PromotionEntity
     */
    createdAt?: Date;
    /**
     * 
     * @type {string}
     * @memberof PromotionEntity
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof PromotionEntity
     */
    sourceEnvCockpitId?: string;
    /**
     * 
     * @type {string}
     * @memberof PromotionEntity
     */
    sourceEnvName?: string;
    /**
     * 
     * @type {PromotionEntityStatus}
     * @memberof PromotionEntity
     */
    status?: PromotionEntityStatus;
    /**
     * 
     * @type {string}
     * @memberof PromotionEntity
     */
    targetApiId?: string;
    /**
     * 
     * @type {string}
     * @memberof PromotionEntity
     */
    targetEnvCockpitId?: string;
    /**
     * 
     * @type {string}
     * @memberof PromotionEntity
     */
    targetEnvName?: string;
    /**
     * 
     * @type {Date}
     * @memberof PromotionEntity
     */
    updatedAt?: Date;
}

/**
 * Check if a given object implements the PromotionEntity interface.
 */
export function instanceOfPromotionEntity(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function PromotionEntityFromJSON(json: any): PromotionEntity {
    return PromotionEntityFromJSONTyped(json, false);
}

export function PromotionEntityFromJSONTyped(json: any, ignoreDiscriminator: boolean): PromotionEntity {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'apiDefinition': !exists(json, 'apiDefinition') ? undefined : json['apiDefinition'],
        'apiId': !exists(json, 'apiId') ? undefined : json['apiId'],
        'author': !exists(json, 'author') ? undefined : PromotionEntityAuthorFromJSON(json['author']),
        'createdAt': !exists(json, 'createdAt') ? undefined : (new Date(json['createdAt'])),
        'id': !exists(json, 'id') ? undefined : json['id'],
        'sourceEnvCockpitId': !exists(json, 'sourceEnvCockpitId') ? undefined : json['sourceEnvCockpitId'],
        'sourceEnvName': !exists(json, 'sourceEnvName') ? undefined : json['sourceEnvName'],
        'status': !exists(json, 'status') ? undefined : PromotionEntityStatusFromJSON(json['status']),
        'targetApiId': !exists(json, 'targetApiId') ? undefined : json['targetApiId'],
        'targetEnvCockpitId': !exists(json, 'targetEnvCockpitId') ? undefined : json['targetEnvCockpitId'],
        'targetEnvName': !exists(json, 'targetEnvName') ? undefined : json['targetEnvName'],
        'updatedAt': !exists(json, 'updatedAt') ? undefined : (new Date(json['updatedAt'])),
    };
}

export function PromotionEntityToJSON(value?: PromotionEntity | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'apiDefinition': value.apiDefinition,
        'apiId': value.apiId,
        'author': PromotionEntityAuthorToJSON(value.author),
        'createdAt': value.createdAt === undefined ? undefined : (value.createdAt.toISOString()),
        'id': value.id,
        'sourceEnvCockpitId': value.sourceEnvCockpitId,
        'sourceEnvName': value.sourceEnvName,
        'status': PromotionEntityStatusToJSON(value.status),
        'targetApiId': value.targetApiId,
        'targetEnvCockpitId': value.targetEnvCockpitId,
        'targetEnvName': value.targetEnvName,
        'updatedAt': value.updatedAt === undefined ? undefined : (value.updatedAt.toISOString()),
    };
}
