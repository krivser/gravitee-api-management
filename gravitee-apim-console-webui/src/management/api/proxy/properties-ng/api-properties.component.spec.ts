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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpTestingController } from '@angular/common/http/testing';
import { InteractivityChecker } from '@angular/cdk/a11y';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { GioSaveBarHarness } from '@gravitee/ui-particles-angular';

import { ApiPropertiesComponent } from './api-properties.component';
import { ApiPropertiesModule } from './api-properties.module';

import { CONSTANTS_TESTING, GioHttpTestingModule } from '../../../../shared/testing';
import { fakeApi } from '../../../../entities/api/Api.fixture';
import { User } from '../../../../entities/user';
import { AjsRootScope, CurrentUserService, UIRouterStateParams } from '../../../../ajs-upgraded-providers';
import { GioUiRouterTestingModule } from '../../../../shared/testing/gio-uirouter-testing-module';
import { Api } from '../../../../entities/api';

describe('ApiPropertiesComponent', () => {
  const API_ID = 'apiId';
  let fixture: ComponentFixture<ApiPropertiesComponent>;
  let component: ApiPropertiesComponent;
  let httpTestingController: HttpTestingController;
  let loader: HarnessLoader;

  const $broadcast = jest.fn();
  const currentUser = new User();
  currentUser.userPermissions = ['api-plan-r', 'api-plan-u'];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, GioHttpTestingModule, ApiPropertiesModule, GioUiRouterTestingModule],
      providers: [
        { provide: UIRouterStateParams, useValue: { apiId: API_ID } },
        {
          provide: AjsRootScope,
          useValue: {
            $broadcast: $broadcast,
          },
        },
        {
          provide: CurrentUserService,
          useValue: { currentUser },
        },
      ],
    })
      .overrideProvider(InteractivityChecker, {
        useValue: {
          isFocusable: () => true, // This traps focus checks and so avoid warnings when dealing with
        },
      })
      .compileComponents();
  });

  const createComponent = (api: Api) => {
    fixture = TestBed.createComponent(ApiPropertiesComponent);
    httpTestingController = TestBed.inject(HttpTestingController);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expectGetApi(api);
  };

  it('should setup properties and save changes', async () => {
    const api = fakeApi({ id: API_ID });
    createComponent(api);
    expect(component.apiDefinition).toStrictEqual({
      id: api.id,
      name: api.name,
      origin: 'management',
      flows: api.flows,
      flow_mode: api.flow_mode,
      resources: api.resources,
      plans: api.plans,
      version: api.version,
      services: api.services,
      properties: api.properties,
      execution_mode: api.execution_mode,
    });

    component.onChange({
      detail: {
        properties: [
          {
            key: 'prop',
            value: 'val',
            dynamic: false,
          },
        ],
      },
    });

    const saveBar = await loader.getHarness(GioSaveBarHarness);
    await saveBar.clickSubmit();
    fixture.detectChanges();

    expectGetApi(api);
    const req = httpTestingController.expectOne({ url: `${CONSTANTS_TESTING.env.baseURL}/apis/${api.id}`, method: 'PUT' });
    expect(req.request.body.properties).toEqual([
      {
        key: 'prop',
        value: 'val',
        dynamic: false,
      },
    ]);
  });

  it('should disable field when origin is kubernetes', async () => {
    const api = fakeApi({
      id: API_ID,
      definition_context: { origin: 'kubernetes' },
    });
    createComponent(api);
    expect(component.isReadonly).toEqual(true);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  const expectGetApi = (api: Api) => {
    httpTestingController.expectOne({ url: `${CONSTANTS_TESTING.env.baseURL}/apis/${api.id}`, method: 'GET' }).flush(api);
    fixture.detectChanges();
  };
});