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
package io.gravitee.gateway.http.connector;

import com.google.common.net.UrlEscapers;
import io.gravitee.common.component.AbstractLifecycleComponent;
import io.gravitee.common.http.HttpHeaders;
import io.gravitee.common.http.HttpHeadersValues;
import io.gravitee.common.http.HttpStatusCode;
import io.gravitee.definition.model.HttpClientSslOptions;
import io.gravitee.definition.model.HttpProxy;
import io.gravitee.definition.model.endpoint.HttpEndpoint;
import io.gravitee.definition.model.ssl.jks.JKSKeyStore;
import io.gravitee.definition.model.ssl.jks.JKSTrustStore;
import io.gravitee.definition.model.ssl.pem.PEMKeyStore;
import io.gravitee.definition.model.ssl.pem.PEMTrustStore;
import io.gravitee.definition.model.ssl.pkcs12.PKCS12KeyStore;
import io.gravitee.definition.model.ssl.pkcs12.PKCS12TrustStore;
import io.gravitee.gateway.api.Connector;
import io.gravitee.gateway.api.buffer.Buffer;
import io.gravitee.gateway.api.proxy.ProxyConnection;
import io.gravitee.gateway.api.proxy.ProxyRequest;
import io.gravitee.gateway.api.proxy.ProxyResponse;
import io.gravitee.gateway.core.endpoint.EndpointException;
import io.gravitee.gateway.core.proxy.EmptyProxyResponse;
import io.netty.channel.ConnectTimeoutException;
import io.vertx.core.Context;
import io.vertx.core.Vertx;
import io.vertx.core.http.*;
import io.vertx.core.net.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.UnsupportedEncodingException;
import java.net.*;
import java.nio.charset.Charset;
import java.util.*;
import java.util.concurrent.TimeoutException;
import java.util.function.Function;

/**
 * @author David BRASSELY (david.brassely at graviteesource.com)
 * @author GraviteeSource Team
 */
public class VertxHttpClient extends AbstractLifecycleComponent<Connector> implements Connector {

    private final Logger LOGGER = LoggerFactory.getLogger(VertxHttpClient.class);

    private static final String HTTPS_SCHEME = "https";
    private static final int DEFAULT_HTTP_PORT = 80;
    private static final int DEFAULT_HTTPS_PORT = 443;
    private static final Set<String> HOP_HEADERS;
    private static final String URI_PATH_SEPARATOR = "/";
    private static final char URI_PATH_SEPARATOR_CHAR = '/';

    static {
        Set<String> hopHeaders = new HashSet<>();

        // Standard HTTP headers
        hopHeaders.add(HttpHeaders.CONNECTION);
        hopHeaders.add(HttpHeaders.KEEP_ALIVE);
        hopHeaders.add(HttpHeaders.PROXY_AUTHORIZATION);
        hopHeaders.add(HttpHeaders.PROXY_AUTHENTICATE);
        hopHeaders.add(HttpHeaders.PROXY_CONNECTION);
        hopHeaders.add(HttpHeaders.TE);
        hopHeaders.add(HttpHeaders.TRAILER);
        hopHeaders.add(HttpHeaders.UPGRADE);

        HOP_HEADERS = Collections.unmodifiableSet(hopHeaders);
    }

    @Autowired
    private Vertx vertx;

    private final HttpEndpoint endpoint;

    private HttpClientOptions httpClientOptions;

    @Autowired
    public VertxHttpClient(HttpEndpoint endpoint) {
        this.endpoint = endpoint;
    }

    private final Map<Context, HttpClient> httpClients = new HashMap<>();

    @Override
    public ProxyConnection request(ProxyRequest proxyRequest) {
        HttpClient httpClient = httpClients.computeIfAbsent(Vertx.currentContext(), createHttpClient());

        // Remove hop-by-hop headers.
        for (String header : HOP_HEADERS) {
            proxyRequest.headers().remove(header);
        }

        final URI uri ;
        if (endpoint.getHttpClientOptions().isEncodeURI()) {
            uri = getEncodedURI(proxyRequest.uri());
        }else {
            uri = proxyRequest.uri();
        }
        final int port = uri.getPort() != -1 ? uri.getPort() :
                (HTTPS_SCHEME.equals(uri.getScheme()) ? 443 : 80);

        final String host = (port == DEFAULT_HTTP_PORT || port == DEFAULT_HTTPS_PORT) ?
                uri.getHost() : uri.getHost() + ':' + port;

        proxyRequest.headers().set(HttpHeaders.HOST, host);

        // Apply headers from endpoint
        if (endpoint.getHeaders() != null && !endpoint.getHeaders().isEmpty()) {
            endpoint.getHeaders().forEach(proxyRequest.headers()::set);
        }

        String relativeUri = (uri.getRawQuery() == null) ? uri.getRawPath() : uri.getRawPath() + '?' + uri.getRawQuery();

        // Add the endpoint reference in metrics to know which endpoint has been invoked while serving the request
        proxyRequest.metrics().setEndpoint(uri.toString());

        // Prepare request
        HttpClientRequest clientRequest = httpClient.request(
                HttpMethod.valueOf(proxyRequest.method().name()), port, uri.getHost(), relativeUri);
        clientRequest.setTimeout(endpoint.getHttpClientOptions().getReadTimeout());
        clientRequest.setFollowRedirects(endpoint.getHttpClientOptions().isFollowRedirects());

        if (proxyRequest.method() == io.gravitee.common.http.HttpMethod.OTHER) {
            clientRequest.setRawMethod(proxyRequest.rawMethod());
        }

        VertxProxyConnection proxyConnection = new VertxProxyConnection(proxyRequest, clientRequest);
        clientRequest.handler(clientResponse -> handleClientResponse(proxyConnection, clientResponse, clientRequest));

        clientRequest.connectionHandler(connection -> connection.exceptionHandler(ex -> {
            // I don't want to fill my logs with error
        }));

        clientRequest.exceptionHandler(event -> {
            if (! proxyConnection.isCanceled() && ! proxyConnection.isTransmitted()) {
                proxyRequest.metrics().setMessage(event.getMessage());

                if (proxyConnection.timeoutHandler() != null
                        && (event instanceof ConnectException ||
                        event instanceof TimeoutException ||
                        event instanceof NoRouteToHostException ||
                        event instanceof UnknownHostException)) {
                    proxyConnection.handleConnectTimeout(event);
                } else {
                    ProxyResponse clientResponse = new EmptyProxyResponse(
                            ((event instanceof ConnectTimeoutException) || (event instanceof TimeoutException)) ?
                                    HttpStatusCode.GATEWAY_TIMEOUT_504 : HttpStatusCode.BAD_GATEWAY_502);

                    clientResponse.headers().set(HttpHeaders.CONNECTION, HttpHeadersValues.CONNECTION_CLOSE);
                    proxyConnection.handleResponse(clientResponse);
                }
            }
        });

        return proxyConnection;
    }

    private void handleClientResponse(final VertxProxyConnection proxyConnection,
                                      final HttpClientResponse clientResponse, final HttpClientRequest clientRequest) {
        VertxProxyResponse proxyClientResponse = new VertxProxyResponse(clientResponse);
        proxyConnection.setProxyResponse(proxyClientResponse);

        // Copy HTTP headers
        clientResponse.headers().names().forEach(headerName ->
                proxyClientResponse.headers().put(headerName, clientResponse.headers().getAll(headerName)));

        proxyClientResponse.pause();

        // Copy body content
        clientResponse.handler(event -> proxyClientResponse.bodyHandler().handle(Buffer.buffer(event.getBytes())));

        // Signal end of the response
        clientResponse.endHandler(v -> proxyClientResponse.endHandler().handle(null));

        clientResponse.exceptionHandler(throwable -> {
            LOGGER.error("Unexpected error while handling backend response for request {} {} - {}",
                    clientRequest.method(), clientRequest.absoluteURI(), throwable.getMessage());
            proxyClientResponse.endHandler().handle(null);
        });

        proxyConnection.handleResponse(proxyClientResponse);
    }

    @Override
    protected void doStart() throws Exception {
        httpClientOptions = new HttpClientOptions();

        httpClientOptions.setPipelining(endpoint.getHttpClientOptions().isPipelining());
        httpClientOptions.setKeepAlive(endpoint.getHttpClientOptions().isKeepAlive());
        httpClientOptions.setIdleTimeout((int) (endpoint.getHttpClientOptions().getIdleTimeout() / 1000));
        httpClientOptions.setConnectTimeout((int) endpoint.getHttpClientOptions().getConnectTimeout());
        httpClientOptions.setUsePooledBuffers(true);
        httpClientOptions.setMaxPoolSize(endpoint.getHttpClientOptions().getMaxConcurrentConnections());
        httpClientOptions.setTryUseCompression(endpoint.getHttpClientOptions().isUseCompression());
        httpClientOptions.setLogActivity(true);

        // Configure proxy
        HttpProxy proxy = endpoint.getHttpProxy();
        if (proxy != null && proxy.isEnabled()) {
            ProxyOptions proxyOptions = new ProxyOptions();
            proxyOptions.setHost(proxy.getHost());
            proxyOptions.setPort(proxy.getPort());
            proxyOptions.setUsername(proxy.getUsername());
            proxyOptions.setPassword(proxy.getPassword());
            proxyOptions.setType(ProxyType.valueOf(proxy.getType().name()));

            httpClientOptions.setProxyOptions(proxyOptions);
        }

        URI target = URI.create(endpoint.getTarget());
        HttpClientSslOptions sslOptions = endpoint.getHttpClientSslOptions();

        if (HTTPS_SCHEME.equalsIgnoreCase(target.getScheme())) {
            // Configure SSL
            httpClientOptions.setSsl(true);

            if (sslOptions != null) {
                httpClientOptions
                        .setVerifyHost(sslOptions.isHostnameVerifier())
                        .setTrustAll(sslOptions.isTrustAll());

                // Client trust configuration
                if (!sslOptions.isTrustAll() && sslOptions.getTrustStore() != null) {
                    switch (sslOptions.getTrustStore().getType()) {
                        case PEM:
                            PEMTrustStore pemTrustStore = (PEMTrustStore) sslOptions.getTrustStore();
                            PemTrustOptions pemTrustOptions = new PemTrustOptions();
                            if (pemTrustStore.getPath() != null && !pemTrustStore.getPath().isEmpty()) {
                                pemTrustOptions.addCertPath(pemTrustStore.getPath());
                            } else if (pemTrustStore.getContent() != null && !pemTrustStore.getContent().isEmpty()) {
                                pemTrustOptions.addCertValue(io.vertx.core.buffer.Buffer.buffer(pemTrustStore.getContent()));
                            } else {
                                throw new EndpointException("Missing PEM certificate value for endpoint " + endpoint.getName());
                            }
                            this.httpClientOptions.setPemTrustOptions(pemTrustOptions);
                            break;
                        case PKCS12:
                            PKCS12TrustStore pkcs12TrustStore = (PKCS12TrustStore) sslOptions.getTrustStore();
                            PfxOptions pfxOptions = new PfxOptions();
                            pfxOptions.setPassword(pkcs12TrustStore.getPassword());
                            if (pkcs12TrustStore.getPath() != null && !pkcs12TrustStore.getPath().isEmpty()) {
                                pfxOptions.setPath(pkcs12TrustStore.getPath());
                            } else if (pkcs12TrustStore.getContent() != null && !pkcs12TrustStore.getContent().isEmpty()) {
                                pfxOptions.setValue(io.vertx.core.buffer.Buffer.buffer(pkcs12TrustStore.getContent()));
                            } else {
                                throw new EndpointException("Missing PKCS12 value for endpoint " + endpoint.getName());
                            }
                            this.httpClientOptions.setPfxTrustOptions(pfxOptions);
                            break;
                        case JKS:
                            JKSTrustStore jksTrustStore = (JKSTrustStore) sslOptions.getTrustStore();
                            JksOptions jksOptions = new JksOptions();
                            jksOptions.setPassword(jksTrustStore.getPassword());
                            if (jksTrustStore.getPath() != null && !jksTrustStore.getPath().isEmpty()) {
                                jksOptions.setPath(jksTrustStore.getPath());
                            } else if (jksTrustStore.getContent() != null && !jksTrustStore.getContent().isEmpty()) {
                                jksOptions.setValue(io.vertx.core.buffer.Buffer.buffer(jksTrustStore.getContent()));
                            } else {
                                throw new EndpointException("Missing JKS value for endpoint " + endpoint.getName());
                            }
                            this.httpClientOptions.setTrustStoreOptions(jksOptions);
                            break;
                    }
                }

                // Client authentication configuration
                if (sslOptions.getKeyStore() != null) {
                    switch (sslOptions.getKeyStore().getType()) {
                        case PEM:
                            PEMKeyStore pemKeyStore = (PEMKeyStore) sslOptions.getKeyStore();
                            PemKeyCertOptions pemKeyCertOptions = new PemKeyCertOptions();
                            if (pemKeyStore.getCertPath() != null && !pemKeyStore.getCertPath().isEmpty()) {
                                pemKeyCertOptions.setCertPath(pemKeyStore.getCertPath());
                            } else if (pemKeyStore.getCertContent() != null && !pemKeyStore.getCertContent().isEmpty()) {
                                pemKeyCertOptions.setCertValue(io.vertx.core.buffer.Buffer.buffer(pemKeyStore.getCertContent()));
                            }
                            if (pemKeyStore.getKeyPath() != null && !pemKeyStore.getKeyPath().isEmpty()) {
                                pemKeyCertOptions.setKeyPath(pemKeyStore.getKeyPath());
                            } else if (pemKeyStore.getKeyContent() != null && !pemKeyStore.getKeyContent().isEmpty()) {
                                pemKeyCertOptions.setKeyValue(io.vertx.core.buffer.Buffer.buffer(pemKeyStore.getKeyContent()));
                            }
                            this.httpClientOptions.setPemKeyCertOptions(pemKeyCertOptions);
                            break;
                        case PKCS12:
                            PKCS12KeyStore pkcs12KeyStore = (PKCS12KeyStore) sslOptions.getKeyStore();
                            PfxOptions pfxOptions = new PfxOptions();
                            pfxOptions.setPassword(pkcs12KeyStore.getPassword());
                            if (pkcs12KeyStore.getPath() != null && !pkcs12KeyStore.getPath().isEmpty()) {
                                pfxOptions.setPath(pkcs12KeyStore.getPath());
                            } else if (pkcs12KeyStore.getContent() != null && !pkcs12KeyStore.getContent().isEmpty()) {
                                pfxOptions.setValue(io.vertx.core.buffer.Buffer.buffer(pkcs12KeyStore.getContent()));
                            }
                            this.httpClientOptions.setPfxKeyCertOptions(pfxOptions);
                            break;
                        case JKS:
                            JKSKeyStore jksKeyStore = (JKSKeyStore) sslOptions.getKeyStore();
                            JksOptions jksOptions = new JksOptions();
                            jksOptions.setPassword(jksKeyStore.getPassword());
                            if (jksKeyStore.getPath() != null && !jksKeyStore.getPath().isEmpty()) {
                                jksOptions.setPath(jksKeyStore.getPath());
                            } else if (jksKeyStore.getContent() != null && !jksKeyStore.getContent().isEmpty()) {
                                jksOptions.setValue(io.vertx.core.buffer.Buffer.buffer(jksKeyStore.getContent()));
                            }
                            this.httpClientOptions.setKeyStoreOptions(jksOptions);
                            break;
                    }
                }
            }
        }

        printHttpClientConfiguration(httpClientOptions);
    }

    @Override
    protected void doStop() throws Exception {
        LOGGER.info("Closing HTTP Client for '{}' endpoint [{}]", endpoint.getName(), endpoint.getTarget());

        httpClients.values().forEach(httpClient -> {
            try {
                httpClient.close();
            } catch (IllegalStateException ise) {
                LOGGER.warn(ise.getMessage());
            }
        });
    }

    private Function<Context, HttpClient> createHttpClient() {
        return context -> vertx.createHttpClient(httpClientOptions);
    }

    private void printHttpClientConfiguration(HttpClientOptions httpClientOptions) {
        LOGGER.info("Create HTTP Client with configuration: ");
        LOGGER.info("\tHTTP {" +
                "ConnectTimeout='" + httpClientOptions.getConnectTimeout() + '\'' +
                ", KeepAlive='" + httpClientOptions.isKeepAlive() + '\'' +
                ", IdleTimeout='" + httpClientOptions.getIdleTimeout() + '\'' +
                ", MaxChunkSize='" + httpClientOptions.getMaxChunkSize() + '\'' +
                ", MaxPoolSize='" + httpClientOptions.getMaxPoolSize() + '\'' +
                ", MaxWaitQueueSize='" + httpClientOptions.getMaxWaitQueueSize() + '\'' +
                ", Pipelining='" + httpClientOptions.isPipelining() + '\'' +
                ", PipeliningLimit='" + httpClientOptions.getPipeliningLimit() + '\'' +
                ", TryUseCompression='" + httpClientOptions.isTryUseCompression() + '\'' +
                '}');

        if (httpClientOptions.isSsl()) {
            LOGGER.info("\tSSL {" +
                    "TrustAll='" + httpClientOptions.isTrustAll() + '\'' +
                    ", VerifyHost='" + httpClientOptions.isVerifyHost() + '\'' +
                    '}');
        }

        if (httpClientOptions.getProxyOptions() != null) {
            LOGGER.info("\tProxy {" +
                    "Type='" + httpClientOptions.getProxyOptions().getType() +
                    ", Host='" + httpClientOptions.getProxyOptions().getHost() + '\'' +
                    ", Port='" + httpClientOptions.getProxyOptions().getPort() + '\'' +
                    ", Username='" + httpClientOptions.getProxyOptions().getUsername() + '\'' +
                    '}');
        }
    }

    private URI getEncodedURI(URI uri) {

        // Path segments must be encoded to avoid bad URI syntax
        String [] segments = uri.getRawPath().split(URI_PATH_SEPARATOR);
        StringJoiner pathBuilder = new StringJoiner(URI_PATH_SEPARATOR);

        for(String pathSeg : segments) {
            pathBuilder.add(UrlEscapers.urlPathSegmentEscaper().escape(pathSeg));
        }

        String encodedPath = pathBuilder.toString();
        String encodedQuery = null;
        if(uri.getRawQuery() != null) {
            StringJoiner queryBuilder = new StringJoiner("&");
            String query = uri.getRawQuery();
            //EndpointInvoker.buildURI use only the '&' as a query parameter separator. No need to test ';'
            String[] params = query.split("&");
            for (String param: params) {
                try {
                    int equalIndex = param.indexOf('=');
                    if (equalIndex >= 0) {
                        String encodeKey = URLEncoder.encode(param.substring(0, equalIndex), Charset.defaultCharset().name());
                        String encodeValue = URLEncoder.encode(param.substring(equalIndex+1), Charset.defaultCharset().name());
                        queryBuilder.add(encodeKey + '=' + encodeValue);

                    } else {
                        queryBuilder.add(URLEncoder.encode(param, Charset.defaultCharset().name()));
                    }
                } catch (UnsupportedEncodingException e) {
                    LOGGER.error("An error occurs when trying to encode " + param + ". Add the unencoded value.", e);
                    queryBuilder.add(param);
                }
            }
            encodedQuery = queryBuilder.toString();
        }

        return URI.create(
                uri.getScheme() + "://" +
                        uri.getHost()+
                        (uri.getPort()==-1?"":(':' + uri.getPort()))+
                        encodedPath+
                        ((encodedQuery==null) ? "" : '?' + encodedQuery));
    }
}
