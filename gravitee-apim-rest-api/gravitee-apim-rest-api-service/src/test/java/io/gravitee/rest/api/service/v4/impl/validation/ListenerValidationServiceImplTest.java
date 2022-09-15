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
package io.gravitee.rest.api.service.v4.impl.validation;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.gravitee.definition.model.v4.listener.Listener;
import io.gravitee.definition.model.v4.listener.entrypoint.Entrypoint;
import io.gravitee.definition.model.v4.listener.http.HttpListener;
import io.gravitee.definition.model.v4.listener.http.Path;
import io.gravitee.repository.management.api.ApiRepository;
import io.gravitee.rest.api.model.EnvironmentEntity;
import io.gravitee.rest.api.service.EnvironmentService;
import io.gravitee.rest.api.service.common.GraviteeContext;
import io.gravitee.rest.api.service.v4.EntrypointPluginService;
import io.gravitee.rest.api.service.v4.exception.HttpListenerEntrypointMissingException;
import io.gravitee.rest.api.service.v4.exception.HttpListenerEntrypointMissingTypeException;
import io.gravitee.rest.api.service.v4.exception.HttpListenerPathMissingException;
import io.gravitee.rest.api.service.v4.exception.ListenersDuplicatedException;
import io.gravitee.rest.api.service.v4.validation.CorsValidationService;
import io.gravitee.rest.api.service.v4.validation.LoggingValidationService;
import java.util.List;
import org.assertj.core.api.Assertions;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

/**
 * @author Guillaume LAMIRAND (guillaume.lamirand at graviteesource.com)
 * @author GraviteeSource Team
 */
@RunWith(MockitoJUnitRunner.class)
public class ListenerValidationServiceImplTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private ApiRepository apiRepository;

    @Mock
    private EnvironmentService environmentService;

    @Mock
    private CorsValidationService corsValidationService;

    @Mock
    private LoggingValidationService loggingValidationService;

    @Mock
    private EntrypointPluginService entrypointService;

    private ListenerValidationServiceImpl listenerValidationService;

    @Before
    public void setUp() throws Exception {
        when(environmentService.findById(any())).thenReturn(new EnvironmentEntity());
        lenient().when(entrypointService.validateEntrypointConfiguration(any(), any())).thenAnswer(invocation -> invocation.getArgument(1));
        listenerValidationService =
            new ListenerValidationServiceImpl(
                new PathValidationServiceImpl(apiRepository, objectMapper, environmentService),
                entrypointService,
                corsValidationService,
                loggingValidationService
            );
    }

    @Test
    public void shouldIgnoreEmptyList() {
        List<Listener> emptyListeners = List.of();
        List<Listener> validatedListeners = listenerValidationService.validateAndSanitize(
            GraviteeContext.getExecutionContext(),
            null,
            emptyListeners
        );
        Assertions.assertThat(validatedListeners).isEmpty();
        Assertions.assertThat(validatedListeners).isEqualTo(emptyListeners);
    }

    @Test
    public void shouldThrowDuplicatedExceptionWithDuplicatedType() {
        // Given
        Listener httpListener1 = new HttpListener();
        Listener httpListener2 = new HttpListener();
        List<Listener> listeners = List.of(httpListener1, httpListener2);
        // When
        assertThatExceptionOfType(ListenersDuplicatedException.class)
            .isThrownBy(() -> listenerValidationService.validateAndSanitize(GraviteeContext.getExecutionContext(), null, listeners));
    }

    @Test
    public void shouldReturnValidatedListeners() {
        // Given
        HttpListener httpListener = new HttpListener();
        httpListener.setPaths(List.of(new Path("path")));
        Entrypoint entrypoint = new Entrypoint();
        entrypoint.setType("type");
        httpListener.setEntrypoints(List.of(entrypoint));
        List<Listener> listeners = List.of(httpListener);
        // When
        List<Listener> validatedListeners = listenerValidationService.validateAndSanitize(
            GraviteeContext.getExecutionContext(),
            null,
            listeners
        );
        // Then
        assertThat(validatedListeners).isNotNull();
        assertThat(validatedListeners.size()).isEqualTo(1);
        Listener actual = validatedListeners.get(0);
        assertThat(actual).isInstanceOf(HttpListener.class);
        HttpListener actualHttpListener = (HttpListener) actual;
        assertThat(actualHttpListener.getPaths().size()).isEqualTo(1);
        Path path = actualHttpListener.getPaths().get(0);
        assertThat(path.getHost()).isNull();
        assertThat(path.getPath()).isEqualTo("/path/");
    }

    @Test
    public void shouldThrowMissingPathExceptionWithDuplicatedType() {
        // Given
        HttpListener httpListener = new HttpListener();
        // When
        assertThatExceptionOfType(HttpListenerPathMissingException.class)
            .isThrownBy(
                () -> listenerValidationService.validateAndSanitize(GraviteeContext.getExecutionContext(), null, List.of(httpListener))
            );
    }

    @Test
    public void shouldThrowMissingEntrypointExceptionWithDuplicatedType() {
        // Given
        HttpListener httpListener = new HttpListener();
        httpListener.setPaths(List.of(new Path("/path")));
        // When
        assertThatExceptionOfType(HttpListenerEntrypointMissingException.class)
            .isThrownBy(
                () -> listenerValidationService.validateAndSanitize(GraviteeContext.getExecutionContext(), null, List.of(httpListener))
            );
    }

    @Test
    public void shouldThrowMissingEntrypointTypeExceptionWithDuplicatedType() {
        // Given
        HttpListener httpListener = new HttpListener();
        httpListener.setPaths(List.of(new Path("/path")));
        httpListener.setEntrypoints(List.of(new Entrypoint()));
        // When
        assertThatExceptionOfType(HttpListenerEntrypointMissingTypeException.class)
            .isThrownBy(
                () -> listenerValidationService.validateAndSanitize(GraviteeContext.getExecutionContext(), null, List.of(httpListener))
            );
    }
}