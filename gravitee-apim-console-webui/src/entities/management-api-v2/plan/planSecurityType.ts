/*
 * Copyright (C) 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// TODO remove this when the SUBSCRIPTION security type is renamed on the backend side
export type PushSecurityType = 'PUSH' | 'SUBSCRIPTION';

/**
 * Plan security type.
 */
export type PlanSecurityType = 'KEY_LESS' | 'API_KEY' | 'OAUTH2' | 'JWT' | PushSecurityType;