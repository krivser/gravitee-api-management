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
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { UIRouterModule } from '@uirouter/angular';
import { MatTabsModule } from '@angular/material/tabs';

import { HomeLayoutComponent } from './home-layout.component';

import { CurrentUserService } from '../../../ajs-upgraded-providers';
import { User } from '../../../entities/user';
import { GioHttpTestingModule } from '../../../shared/testing';
import { HomeModule } from '../home.module';

describe('HomeLayoutComponent', () => {
  let fixture: ComponentFixture<HomeLayoutComponent>;
  let loader: HarnessLoader;
  let httpTestingController: HttpTestingController;

  const currentUser = new User();

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomeLayoutComponent],
      imports: [
        NoopAnimationsModule,
        GioHttpTestingModule,
        HomeModule,
        UIRouterModule.forRoot({
          useHash: true,
        }),
        MatTabsModule,
      ],
      providers: [{ provide: CurrentUserService, useValue: { currentUser } }],
    });
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(HomeLayoutComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should work', async () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(loader).toBeTruthy();
  });
});