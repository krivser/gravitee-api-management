/**
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
package io.gravitee.rest.api.service.cockpit.services;

import static org.junit.Assert.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.gravitee.rest.api.model.v4.api.ApiEntity;
import io.gravitee.rest.api.model.v4.plan.PlanEntity;
import io.gravitee.rest.api.service.v4.ApiService;
import io.gravitee.rest.api.service.v4.ApiStateService;
import io.gravitee.rest.api.service.v4.PlanService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

/**
 * @author Ashraful Hasan (ashraful.hasan at graviteesource.com)
 * @author GraviteeSource Team
 */
@RunWith(MockitoJUnitRunner.class)
public class V4ApiServiceTest {

    @Mock
    private ApiService apiServiceV4;

    @Mock
    private PlanService planServiceV4;

    @Mock
    private ApiStateService apiStateService;

    private V4ApiService service;

    @Before
    public void setUp() throws Exception {
        service = new V4ApiService(apiServiceV4, planServiceV4, apiStateService);
    }

    @Test
    public void should_create_publish_api() throws JsonProcessingException {
        final String userId = "any-user-id";
        final ApiEntity apiEntity = new ApiEntity();
        apiEntity.setId("any-id");
        final ApiEntity startedApi = new ApiEntity();
        startedApi.setId("any-started-id");
        when(apiServiceV4.create(any(), any(), any())).thenReturn(apiEntity);
        when(planServiceV4.create(any(), any())).thenReturn(new PlanEntity());
        when(planServiceV4.publish(any(), any())).thenReturn(new PlanEntity());
        when(apiStateService.start(any(), any(), any())).thenReturn(startedApi);
        when(apiStateService.deploy(any(), any(), any(), any())).thenReturn(startedApi);
        when(apiServiceV4.update(any(), any(), any(), any())).thenReturn(startedApi);

        ApiEntity result = service.createPublishApi(userId, validApiDefinition());
        assertNotNull(result);
        verify(apiServiceV4, times(1)).create(any(), any(), any());
        verify(apiServiceV4, times(1)).update(any(), any(), any(), any());
        verify(planServiceV4, times(1)).create(any(), any());
        verify(planServiceV4, times(1)).publish(any(), any());
        verify(apiStateService, times(1)).start(any(), any(), any());
        verify(apiStateService, times(1)).deploy(any(), any(), any(), any());
    }

    @Test(expected = JsonProcessingException.class)
    public void should_throw_exception() throws JsonProcessingException {
        final String userId = "any-user-id";
        service.createPublishApi(userId, "{invalid-json}");
    }

    private String validApiDefinition() {
        return (
            "{\n" +
            "    \"name\": \"From Cockpit - HTTP - GET\",\n" +
            "    \"apiVersion\": \"1.0\",\n" +
            "    \"definitionVersion\": \"V4\",\n" +
            "    \"type\": \"PROXY\",\n" +
            "    \"description\": \"From Cockpit - HTTP\",\n" +
            "    \"listeners\": [\n" +
            "        {\n" +
            "            \"type\": \"HTTP\",\n" +
            "            \"paths\": [\n" +
            "                {\n" +
            "                    \"path\": \"/cnn/http-proxy\"\n" +
            "                }\n" +
            "            ],\n" +
            "            \"entrypoints\": [\n" +
            "                {\n" +
            "                    \"type\": \"http-proxy\"\n" +
            "                }\n" +
            "            ]\n" +
            "        }\n" +
            "    ],\n" +
            "    \"endpointGroups\": [\n" +
            "        {\n" +
            "            \"name\": \"default-group\",\n" +
            "            \"type\": \"http-proxy\",\n" +
            "            \"endpoints\": [\n" +
            "                {\n" +
            "                    \"name\": \"default\",\n" +
            "                    \"type\": \"http-proxy\",\n" +
            "                    \"weight\": 1,\n" +
            "                    \"inheritConfiguration\": false,\n" +
            "                    \"configuration\": {\n" +
            "                        \"target\": \"https://api.gravitee.io/echo\"\n" +
            "                    }\n" +
            "                }\n" +
            "            ]\n" +
            "        }\n" +
            "    ]\n" +
            "}"
        );
    }
}
