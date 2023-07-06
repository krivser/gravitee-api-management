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

import com.fasterxml.jackson.core.JsonProcessingException;
import io.gravitee.definition.jackson.datatype.GraviteeMapper;
import io.gravitee.definition.model.v4.plan.PlanSecurity;
import io.gravitee.definition.model.v4.plan.PlanStatus;
import io.gravitee.definition.model.v4.property.Property;
import io.gravitee.rest.api.model.api.ApiDeploymentEntity;
import io.gravitee.rest.api.model.api.ApiLifecycleState;
import io.gravitee.rest.api.model.v4.api.ApiEntity;
import io.gravitee.rest.api.model.v4.api.GenericApiEntity;
import io.gravitee.rest.api.model.v4.api.NewApiEntity;
import io.gravitee.rest.api.model.v4.api.UpdateApiEntity;
import io.gravitee.rest.api.model.v4.api.properties.PropertyEntity;
import io.gravitee.rest.api.model.v4.plan.NewPlanEntity;
import io.gravitee.rest.api.model.v4.plan.PlanEntity;
import io.gravitee.rest.api.model.v4.plan.PlanMode;
import io.gravitee.rest.api.model.v4.plan.PlanType;
import io.gravitee.rest.api.model.v4.plan.PlanValidationType;
import io.gravitee.rest.api.service.common.ExecutionContext;
import io.gravitee.rest.api.service.common.GraviteeContext;
import io.gravitee.rest.api.service.v4.ApiService;
import io.gravitee.rest.api.service.v4.ApiStateService;
import io.gravitee.rest.api.service.v4.PlanService;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * @author Ashraful Hasan (ashraful.hasan at graviteesource.com)
 * @author GraviteeSource Team
 */
@Component
public class V4ApiService {

    public static final String KEYLESS = "Keyless";
    public static final String KEYLESS_TYPE = "key-less";
    private final ApiService apiServiceV4;
    private final PlanService planServiceV4;
    private final ApiStateService apiStateService;
    private final GraviteeMapper graviteeMapper;

    public V4ApiService(ApiService apiServiceV4, PlanService planServiceV4, ApiStateService apiStateService) {
        this.apiServiceV4 = apiServiceV4;

        this.planServiceV4 = planServiceV4;
        this.apiStateService = apiStateService;
        this.graviteeMapper = new GraviteeMapper();
    }

    public ApiEntity createPublishApi(String userId, String apiDefinition) throws JsonProcessingException {
        final NewApiEntity newApiEntity = graviteeMapper.readValue(apiDefinition, NewApiEntity.class);
        final ExecutionContext executionContext = GraviteeContext.getExecutionContext();

        final ApiEntity newApi = apiServiceV4.create(executionContext, newApiEntity, userId);

        publishPlan(executionContext, newApi.getId());

        publishApi(executionContext, newApi, userId);

        return (ApiEntity) syncDeployment(executionContext, newApi.getId(), userId);
    }

    private GenericApiEntity syncDeployment(ExecutionContext executionContext, String apiId, String userId) {
        final ApiDeploymentEntity deploymentEntity = new ApiDeploymentEntity();
        return apiStateService.deploy(executionContext, apiId, userId, deploymentEntity);
    }

    private void publishPlan(ExecutionContext executionContext, String apiId) {
        final NewPlanEntity newPlanEntity = createKeylessPlan(apiId);
        final PlanEntity planEntity = planServiceV4.create(executionContext, newPlanEntity);

        planServiceV4.publish(executionContext, planEntity.getId());
    }

    private void publishApi(ExecutionContext executionContext, ApiEntity newApi, String userId) {
        final ApiEntity updatedApi = (ApiEntity) apiStateService.start(executionContext, newApi.getId(), userId);
        final UpdateApiEntity apiToUpdate = createUpdateApiEntity(updatedApi);

        apiServiceV4.update(executionContext, updatedApi.getId(), apiToUpdate, userId);
    }

    private NewPlanEntity createKeylessPlan(String apiId) {
        final NewPlanEntity newPlanEntity = new NewPlanEntity();
        newPlanEntity.setApiId(apiId);
        newPlanEntity.setType(PlanType.API);
        newPlanEntity.setName(KEYLESS);
        newPlanEntity.setDescription(KEYLESS);
        newPlanEntity.setValidation(PlanValidationType.MANUAL);
        PlanSecurity planSecurity = new PlanSecurity();
        planSecurity.setType(KEYLESS_TYPE);
        newPlanEntity.setSecurity(planSecurity);
        newPlanEntity.setMode(PlanMode.STANDARD);
        newPlanEntity.setStatus(PlanStatus.STAGING);

        return newPlanEntity;
    }

    private UpdateApiEntity createUpdateApiEntity(ApiEntity apiEntity) {
        final UpdateApiEntity updateApiEntity = new UpdateApiEntity();
        updateApiEntity.setId(apiEntity.getId());
        updateApiEntity.setName(apiEntity.getName());
        updateApiEntity.setApiVersion(apiEntity.getApiVersion());
        updateApiEntity.setDefinitionVersion(apiEntity.getDefinitionVersion());
        updateApiEntity.setType(apiEntity.getType());
        updateApiEntity.setDescription(apiEntity.getDescription());
        updateApiEntity.setListeners(apiEntity.getListeners());
        updateApiEntity.setEndpointGroups(apiEntity.getEndpointGroups());
        updateApiEntity.setAnalytics(apiEntity.getAnalytics());
        updateApiEntity.setProperties(mapToV4Property(apiEntity.getProperties()));
        updateApiEntity.setResources(apiEntity.getResources());
        updateApiEntity.setPlans(apiEntity.getPlans());
        updateApiEntity.setFlows(apiEntity.getFlows());
        updateApiEntity.setFlowExecution(apiEntity.getFlowExecution());
        updateApiEntity.setResponseTemplates(apiEntity.getResponseTemplates());
        updateApiEntity.setServices(apiEntity.getServices());
        updateApiEntity.setGroups(apiEntity.getGroups());
        updateApiEntity.setVisibility(apiEntity.getVisibility());
        updateApiEntity.setPicture(apiEntity.getPicture());
        updateApiEntity.setPictureUrl(apiEntity.getPictureUrl());
        updateApiEntity.setCategories(apiEntity.getCategories());
        updateApiEntity.setLabels(apiEntity.getLabels());
        updateApiEntity.setLifecycleState(ApiLifecycleState.PUBLISHED);
        updateApiEntity.setDisableMembershipNotifications(apiEntity.isDisableMembershipNotifications());
        updateApiEntity.setBackground(apiEntity.getBackground());
        updateApiEntity.setBackgroundUrl(apiEntity.getBackgroundUrl());

        return updateApiEntity;
    }

    private List<PropertyEntity> mapToV4Property(List<Property> properties) {
        return Optional.ofNullable(properties).orElse(new ArrayList<>()).stream().map(this::mapToV4).collect(Collectors.toList());
    }

    private PropertyEntity mapToV4(Property property) {
        if (property == null) {
            return null;
        }

        return PropertyEntity
            .builder()
            .key(property.getKey())
            .value(property.getValue())
            .encrypted(property.isEncrypted())
            .dynamic(property.isDynamic())
            .build();
    }
}
