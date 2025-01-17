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
package io.gravitee.rest.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * @author Titouan COMPIEGNE (titouan.compiegne at graviteesource.com)
 * @author Guillaume GILLON
 * @author GraviteeSource Team
 */
public class NewPageEntity extends FetchablePageEntity {

    /**
     * The page crossId uniquely identifies a page across environments.
     * Pages promoted between environments will share the same crossId.
     */
    private String crossId;

    @NotNull
    @Size(min = 1)
    private String name;

    @NotNull
    private PageType type;

    private int order;

    private boolean published;

    private Visibility visibility;

    private String lastContributor;

    private PageSourceEntity source;

    private Map<String, String> configuration;

    private boolean homepage;

    @JsonProperty("excluded_groups")
    private List<String> excludedGroups;

    private boolean excludedAccessControls;

    private Set<AccessControlEntity> accessControls;

    @JsonProperty("attached_media")
    private List<PageMediaEntity> attachedMedia;

    private String parentId;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public PageType getType() {
        return type;
    }

    public void setType(PageType type) {
        this.type = type;
    }

    public int getOrder() {
        return order;
    }

    public void setOrder(int order) {
        this.order = order;
    }

    public boolean isPublished() {
        return published;
    }

    public void setPublished(boolean published) {
        this.published = published;
    }

    public String getLastContributor() {
        return lastContributor;
    }

    public void setLastContributor(String lastContributor) {
        this.lastContributor = lastContributor;
    }

    public PageSourceEntity getSource() {
        return source;
    }

    public void setSource(PageSourceEntity source) {
        this.source = source;
    }

    public Map<String, String> getConfiguration() {
        return configuration;
    }

    public void setConfiguration(Map<String, String> configuration) {
        this.configuration = configuration;
    }

    public boolean isHomepage() {
        return homepage;
    }

    public void setHomepage(boolean homepage) {
        this.homepage = homepage;
    }

    public List<String> getExcludedGroups() {
        return excludedGroups;
    }

    public void setExcludedGroups(List<String> excludedGroups) {
        this.excludedGroups = excludedGroups;
    }

    public void setExcludedAccessControls(boolean excludedAccessControls) {
        this.excludedAccessControls = excludedAccessControls;
    }

    public Boolean isExcludedAccessControls() {
        return excludedAccessControls;
    }

    public Set<AccessControlEntity> getAccessControls() {
        return accessControls;
    }

    public void setAccessControls(Set<AccessControlEntity> accessControls) {
        this.accessControls = accessControls;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public Visibility getVisibility() {
        return visibility;
    }

    public void setVisibility(Visibility visibility) {
        this.visibility = visibility;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder("Page{");
        sb.append("crossId='").append(crossId).append('\'');
        sb.append("name='").append(name).append('\'');
        sb.append(", type='").append(type).append('\'');
        sb.append(", order='").append(order).append('\'');
        sb.append(", homepage='").append(homepage).append('\'');
        sb.append(", visibility='").append(visibility).append('\'');
        sb.append(", lastContributor='").append(lastContributor).append('\'');
        sb.append('}');
        return sb.toString();
    }

    public List<PageMediaEntity> getAttachedMedia() {
        return attachedMedia;
    }

    public void setAttachedMedia(List<PageMediaEntity> attachedMedia) {
        this.attachedMedia = attachedMedia;
    }

    public String getCrossId() {
        return crossId;
    }

    public void setCrossId(String crossId) {
        this.crossId = crossId;
    }
}
