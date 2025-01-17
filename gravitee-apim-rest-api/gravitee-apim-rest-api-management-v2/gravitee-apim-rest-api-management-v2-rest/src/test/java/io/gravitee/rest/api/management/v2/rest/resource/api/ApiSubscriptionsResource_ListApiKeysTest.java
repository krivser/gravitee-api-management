/*
 * Copyright © 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.gravitee.rest.api.management.v2.rest.resource.api;

import static io.gravitee.common.http.HttpStatusCode.*;
import static io.gravitee.common.http.HttpStatusCode.NOT_FOUND_404;
import static org.junit.Assert.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import fixtures.ApplicationFixtures;
import fixtures.PlanFixtures;
import fixtures.SubscriptionFixtures;
import io.gravitee.common.data.domain.Page;
import io.gravitee.rest.api.management.v2.rest.model.*;
import io.gravitee.rest.api.management.v2.rest.model.Error;
import io.gravitee.rest.api.model.SubscriptionEntity;
import io.gravitee.rest.api.model.SubscriptionStatus;
import io.gravitee.rest.api.model.common.PageableImpl;
import io.gravitee.rest.api.model.permissions.RolePermission;
import io.gravitee.rest.api.model.permissions.RolePermissionAction;
import io.gravitee.rest.api.model.subscription.SubscriptionQuery;
import io.gravitee.rest.api.service.common.GraviteeContext;
import io.gravitee.rest.api.service.exceptions.SubscriptionNotFoundException;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Set;
import org.junit.Test;

public class ApiSubscriptionsResource_ListApiKeysTest extends ApiSubscriptionsResourceTest {

    @Override
    protected String contextPath() {
        return "/environments/" + ENVIRONMENT + "/apis/" + API + "/subscriptions/" + SUBSCRIPTION + "/api-keys";
    }

    @Test
    public void should_return_404_if_not_found() {
        when(subscriptionService.findById(SUBSCRIPTION)).thenThrow(new SubscriptionNotFoundException(SUBSCRIPTION));

        final Response response = rootTarget().request().get();
        assertEquals(NOT_FOUND_404, response.getStatus());

        var error = response.readEntity(Error.class);
        assertEquals(NOT_FOUND_404, (int) error.getHttpStatus());
        assertEquals("Subscription [" + SUBSCRIPTION + "] cannot be found.", error.getMessage());
    }

    @Test
    public void should_return_empty_page_if_no_api_keys() {
        when(subscriptionService.findById(SUBSCRIPTION)).thenReturn(SubscriptionFixtures.aSubscriptionEntity());
        when(apiKeyService.findBySubscription(GraviteeContext.getExecutionContext(), SUBSCRIPTION)).thenReturn(List.of());

        final Response response = rootTarget().request().get();

        assertEquals(OK_200, response.getStatus());

        var subscriptionApiKeysResponse = response.readEntity(SubscriptionApiKeysResponse.class);

        // Check data
        assertEquals(0, subscriptionApiKeysResponse.getData().size());

        // Check pagination
        Pagination pagination = subscriptionApiKeysResponse.getPagination();
        assertNull(pagination.getPage());
        assertNull(pagination.getPerPage());
        assertNull(pagination.getPageItemsCount());
        assertNull(pagination.getTotalCount());
        assertNull(pagination.getPageCount());

        // Check links
        Links links = subscriptionApiKeysResponse.getLinks();
        assertNull(links);
    }

    @Test
    public void should_return_403_if_incorrect_permissions() {
        when(
            permissionService.hasPermission(
                eq(GraviteeContext.getExecutionContext()),
                eq(RolePermission.API_SUBSCRIPTION),
                eq(API),
                eq(RolePermissionAction.READ)
            )
        )
            .thenReturn(false);

        final Response response = rootTarget().request().get();
        assertEquals(FORBIDDEN_403, response.getStatus());

        var error = response.readEntity(Error.class);
        assertEquals(FORBIDDEN_403, (int) error.getHttpStatus());
        assertEquals("You do not have sufficient rights to access this resource", error.getMessage());
    }

    @Test
    public void should_return_list_of_api_keys() {
        when(subscriptionService.findById(SUBSCRIPTION)).thenReturn(SubscriptionFixtures.aSubscriptionEntity());
        when(apiKeyService.findBySubscription(GraviteeContext.getExecutionContext(), SUBSCRIPTION))
            .thenReturn(
                List.of(
                    SubscriptionFixtures.anApiKeyEntity().toBuilder().id("api-key-1").key("custom1").build(),
                    SubscriptionFixtures.anApiKeyEntity().toBuilder().id("api-key-2").key("custom2").build()
                )
            );

        final Response response = rootTarget().request().get();

        assertEquals(OK_200, response.getStatus());

        var subscriptionApiKeysResponse = response.readEntity(SubscriptionApiKeysResponse.class);

        // Check data
        assertEquals(2, subscriptionApiKeysResponse.getData().size());

        assertEquals("api-key-1", subscriptionApiKeysResponse.getData().get(0).getId());
        assertEquals("api-key-2", subscriptionApiKeysResponse.getData().get(1).getId());

        // Check pagination
        Pagination pagination = subscriptionApiKeysResponse.getPagination();
        assertEquals(1L, pagination.getPage().longValue());
        assertEquals(10L, pagination.getPerPage().longValue());
        assertEquals(2L, pagination.getPageItemsCount().longValue());
        assertEquals(2L, pagination.getTotalCount().longValue());
        assertEquals(1L, pagination.getPageCount().longValue());

        // Check links
        Links links = subscriptionApiKeysResponse.getLinks();
        assert links != null;
        assertNotNull(links.getSelf());
        assertNull(links.getFirst());
        assertNull(links.getPrevious());
        assertNull(links.getNext());
        assertNull(links.getLast());
    }
}
