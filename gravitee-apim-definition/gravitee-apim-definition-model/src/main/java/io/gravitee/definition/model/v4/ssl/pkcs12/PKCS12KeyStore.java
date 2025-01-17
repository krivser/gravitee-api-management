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
package io.gravitee.definition.model.v4.ssl.pkcs12;

import io.gravitee.definition.model.v4.ssl.KeyStore;
import io.gravitee.definition.model.v4.ssl.KeyStoreType;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * @author Jeoffrey HAEYAERT (jeoffrey.haeyaert at graviteesource.com)
 * @author GraviteeSource Team
 */
@Getter
@Setter
@SuperBuilder
public class PKCS12KeyStore extends KeyStore {

    private static final long serialVersionUID = 1210626721233767960L;

    private String path;

    private String content;

    private String password;

    private String alias;

    /**
     * For PKCS12, if specified, it must be equals to password as the JDK doesn't support a key password different from the keystore password.
     */
    private String keyPassword;

    public PKCS12KeyStore() {
        super(KeyStoreType.PKCS12);
    }
}
