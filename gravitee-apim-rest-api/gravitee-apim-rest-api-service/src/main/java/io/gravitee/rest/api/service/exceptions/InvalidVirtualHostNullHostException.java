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
package io.gravitee.rest.api.service.exceptions;

import io.gravitee.common.http.HttpStatusCode;
import io.gravitee.common.util.Maps;
import io.gravitee.definition.model.VirtualHost;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.Getter;

/**
 * @author Florent CHAMFROY (florent.chamfroy at graviteesource.com)
 * @author GraviteeSource Team
 */
public class InvalidVirtualHostNullHostException extends AbstractManagementException {

    private final String message;
    private final List<String> virtualHostsPath;

    public InvalidVirtualHostNullHostException(String message, List<String> restrictions) {
        this.message = message;
        this.virtualHostsPath = restrictions;
    }

    @Override
    public int getHttpStatusCode() {
        return HttpStatusCode.BAD_REQUEST_400;
    }

    @Override
    public String getTechnicalCode() {
        return "virtualHost.invalid";
    }

    @Override
    public Map<String, String> getParameters() {
        return Maps.<String, String>builder().put("virtualHosts", String.join(",", virtualHostsPath)).build();
    }

    @Override
    public String getMessage() {
        return String.format("%s: %s", message, getParameters().get("virtualHosts"));
    }
}
