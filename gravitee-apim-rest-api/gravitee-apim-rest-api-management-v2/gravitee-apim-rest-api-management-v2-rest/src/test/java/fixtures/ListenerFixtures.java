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
package fixtures;

import io.gravitee.definition.model.v4.listener.http.Path;
import io.gravitee.rest.api.management.v2.rest.model.HttpListener;
import io.gravitee.rest.api.management.v2.rest.model.ListenerType;
import io.gravitee.rest.api.management.v2.rest.model.PathV4;
import io.gravitee.rest.api.management.v2.rest.model.SubscriptionListener;
import io.gravitee.rest.api.management.v2.rest.model.TcpListener;
import java.util.List;
import java.util.Set;

@SuppressWarnings("ALL")
public class ListenerFixtures {

    private static final PathV4.PathV4Builder BASE_PATH_V4 = PathV4.builder().host("my.fake.host").path("/test").overrideAccess(true);
    private static final Path.PathBuilder BASE_MODEL_PATH_V4 = Path.builder().host("my.fake.host").path("/test").overrideAccess(true);

    private static final HttpListener.HttpListenerBuilder BASE_HTTP_LISTENER = HttpListener
        .builder()
        // BaseListener
        .type(ListenerType.HTTP)
        .entrypoints(List.of(EntrypointFixtures.anEntrypointV4()))
        .servers(List.of("my-server1", "my-server2"))
        // HttpListener specific
        .paths(List.of(BASE_PATH_V4.build()))
        .pathMappings(List.of("/test"))
        .cors(CorsFixtures.aCors());

    private static final SubscriptionListener.SubscriptionListenerBuilder BASE_SUBSCRIPTION_LISTENER = SubscriptionListener
        .builder()
        // BaseListener
        .type(ListenerType.SUBSCRIPTION)
        .entrypoints(List.of(EntrypointFixtures.anEntrypointV4()))
        .servers(List.of("my-server1", "my-server2"));

    private static final TcpListener.TcpListenerBuilder BASE_TCP_LISTENER = TcpListener
        .builder()
        // BaseListener
        .type(ListenerType.TCP)
        .entrypoints(List.of(EntrypointFixtures.anEntrypointV4()))
        .servers(List.of("my-server1", "my-server2"));

    private static final io.gravitee.definition.model.v4.listener.http.HttpListener.HttpListenerBuilder BASE_MODEL_HTTP_LISTENER =
        io.gravitee.definition.model.v4.listener.http.HttpListener
            .builder()
            // Listener
            .type(io.gravitee.definition.model.v4.listener.ListenerType.HTTP)
            .entrypoints(List.of(EntrypointFixtures.aModelEntrypointV4()))
            .servers(List.of("my-server1", "my-server2"))
            // HttpListener specific
            .paths(List.of(BASE_MODEL_PATH_V4.build()))
            .pathMappings(Set.of("/test"))
            .cors(CorsFixtures.aModelCors());

    private static final io.gravitee.definition.model.v4.listener.subscription.SubscriptionListener.SubscriptionListenerBuilder BASE_MODEL_SUBSCRIPTION_LISTENER =
        io.gravitee.definition.model.v4.listener.subscription.SubscriptionListener
            .builder()
            // BaseListener
            .type(io.gravitee.definition.model.v4.listener.ListenerType.SUBSCRIPTION)
            .entrypoints(List.of(EntrypointFixtures.aModelEntrypointV4()))
            .servers(List.of("my-server1", "my-server2"));

    private static final io.gravitee.definition.model.v4.listener.tcp.TcpListener.TcpListenerBuilder BASE_MODEL_TCP_LISTENER =
        io.gravitee.definition.model.v4.listener.tcp.TcpListener
            .builder()
            // BaseListener
            .type(io.gravitee.definition.model.v4.listener.ListenerType.TCP)
            .entrypoints(List.of(EntrypointFixtures.aModelEntrypointV4()))
            .servers(List.of("my-server1", "my-server2"));

    public static HttpListener aHttpListener() {
        return BASE_HTTP_LISTENER.build();
    }

    public static SubscriptionListener aSubscriptionListener() {
        return BASE_SUBSCRIPTION_LISTENER.build();
    }

    public static TcpListener aTcpListener() {
        return BASE_TCP_LISTENER.build();
    }

    public static io.gravitee.definition.model.v4.listener.http.HttpListener aModelHttpListener() {
        return BASE_MODEL_HTTP_LISTENER.build();
    }

    public static io.gravitee.definition.model.v4.listener.subscription.SubscriptionListener aModelSubscriptionListener() {
        return BASE_MODEL_SUBSCRIPTION_LISTENER.build();
    }

    public static io.gravitee.definition.model.v4.listener.tcp.TcpListener aModelTcpListener() {
        return BASE_MODEL_TCP_LISTENER.build();
    }
}
