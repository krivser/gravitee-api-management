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


import * as runtime from '../runtime';
import type {
  NotificationTemplateEntity,
} from '../models';
import {
    NotificationTemplateEntityFromJSON,
    NotificationTemplateEntityToJSON,
} from '../models';

export interface CreateNotificationTemplateRequest {
    orgId: string;
    notificationTemplateEntity?: NotificationTemplateEntity;
}

export interface GetNotificationTemplateRequest {
    notificationTemplateId: string;
    orgId: string;
}

export interface GetNotificationTemplatesRequest {
    scope?: string;
    hook?: string;
    orgId: string;
}

export interface UpdateNotificationTemplateRequest {
    notificationTemplateId: string;
    orgId: string;
    notificationTemplateEntity?: NotificationTemplateEntity;
}

/**
 * 
 */
export class NotificationsApi extends runtime.BaseAPI {

    /**
     * User must have the NOTIFICATION_TEMPLATES[CREATE] permission to use this service
     * Create a notification template
     */
    async createNotificationTemplateRaw(requestParameters: CreateNotificationTemplateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<NotificationTemplateEntity>> {
        if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
            throw new runtime.RequiredError('orgId','Required parameter requestParameters.orgId was null or undefined when calling createNotificationTemplate.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && (this.configuration.username !== undefined || this.configuration.password !== undefined)) {
            headerParameters["Authorization"] = "Basic " + btoa(this.configuration.username + ":" + this.configuration.password);
        }
        const response = await this.request({
            path: `/organizations/{orgId}/configuration/notification-templates`.replace(`{${"orgId"}}`, encodeURIComponent(String(requestParameters.orgId))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: NotificationTemplateEntityToJSON(requestParameters.notificationTemplateEntity),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => NotificationTemplateEntityFromJSON(jsonValue));
    }

    /**
     * User must have the NOTIFICATION_TEMPLATES[CREATE] permission to use this service
     * Create a notification template
     */
    async createNotificationTemplate(requestParameters: CreateNotificationTemplateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<NotificationTemplateEntity> {
        const response = await this.createNotificationTemplateRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * User must have the NOTIFICATION_TEMPLATES[READ] permission to use this service
     * Get a specific notification template.
     */
    async getNotificationTemplateRaw(requestParameters: GetNotificationTemplateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<NotificationTemplateEntity>> {
        if (requestParameters.notificationTemplateId === null || requestParameters.notificationTemplateId === undefined) {
            throw new runtime.RequiredError('notificationTemplateId','Required parameter requestParameters.notificationTemplateId was null or undefined when calling getNotificationTemplate.');
        }

        if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
            throw new runtime.RequiredError('orgId','Required parameter requestParameters.orgId was null or undefined when calling getNotificationTemplate.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && (this.configuration.username !== undefined || this.configuration.password !== undefined)) {
            headerParameters["Authorization"] = "Basic " + btoa(this.configuration.username + ":" + this.configuration.password);
        }
        const response = await this.request({
            path: `/organizations/{orgId}/configuration/notification-templates/{notificationTemplateId}`.replace(`{${"notificationTemplateId"}}`, encodeURIComponent(String(requestParameters.notificationTemplateId))).replace(`{${"orgId"}}`, encodeURIComponent(String(requestParameters.orgId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => NotificationTemplateEntityFromJSON(jsonValue));
    }

    /**
     * User must have the NOTIFICATION_TEMPLATES[READ] permission to use this service
     * Get a specific notification template.
     */
    async getNotificationTemplate(requestParameters: GetNotificationTemplateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<NotificationTemplateEntity> {
        const response = await this.getNotificationTemplateRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * User must have the NOTIFICATION_TEMPLATES[READ] permission to use this service
     * List all notification templates.
     */
    async getNotificationTemplatesRaw(requestParameters: GetNotificationTemplatesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<NotificationTemplateEntity>>> {
        if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
            throw new runtime.RequiredError('orgId','Required parameter requestParameters.orgId was null or undefined when calling getNotificationTemplates.');
        }

        const queryParameters: any = {};

        if (requestParameters.scope !== undefined) {
            queryParameters['scope'] = requestParameters.scope;
        }

        if (requestParameters.hook !== undefined) {
            queryParameters['hook'] = requestParameters.hook;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && (this.configuration.username !== undefined || this.configuration.password !== undefined)) {
            headerParameters["Authorization"] = "Basic " + btoa(this.configuration.username + ":" + this.configuration.password);
        }
        const response = await this.request({
            path: `/organizations/{orgId}/configuration/notification-templates`.replace(`{${"orgId"}}`, encodeURIComponent(String(requestParameters.orgId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(NotificationTemplateEntityFromJSON));
    }

    /**
     * User must have the NOTIFICATION_TEMPLATES[READ] permission to use this service
     * List all notification templates.
     */
    async getNotificationTemplates(requestParameters: GetNotificationTemplatesRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<NotificationTemplateEntity>> {
        const response = await this.getNotificationTemplatesRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * User must have the NOTIFICATION_TEMPLATES[UPDATE] permission to use this service
     * Update an existing notification template
     */
    async updateNotificationTemplateRaw(requestParameters: UpdateNotificationTemplateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<NotificationTemplateEntity>> {
        if (requestParameters.notificationTemplateId === null || requestParameters.notificationTemplateId === undefined) {
            throw new runtime.RequiredError('notificationTemplateId','Required parameter requestParameters.notificationTemplateId was null or undefined when calling updateNotificationTemplate.');
        }

        if (requestParameters.orgId === null || requestParameters.orgId === undefined) {
            throw new runtime.RequiredError('orgId','Required parameter requestParameters.orgId was null or undefined when calling updateNotificationTemplate.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && (this.configuration.username !== undefined || this.configuration.password !== undefined)) {
            headerParameters["Authorization"] = "Basic " + btoa(this.configuration.username + ":" + this.configuration.password);
        }
        const response = await this.request({
            path: `/organizations/{orgId}/configuration/notification-templates/{notificationTemplateId}`.replace(`{${"notificationTemplateId"}}`, encodeURIComponent(String(requestParameters.notificationTemplateId))).replace(`{${"orgId"}}`, encodeURIComponent(String(requestParameters.orgId))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: NotificationTemplateEntityToJSON(requestParameters.notificationTemplateEntity),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => NotificationTemplateEntityFromJSON(jsonValue));
    }

    /**
     * User must have the NOTIFICATION_TEMPLATES[UPDATE] permission to use this service
     * Update an existing notification template
     */
    async updateNotificationTemplate(requestParameters: UpdateNotificationTemplateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<NotificationTemplateEntity> {
        const response = await this.updateNotificationTemplateRaw(requestParameters, initOverrides);
        return await response.value();
    }

}