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
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, EMPTY, Observable, of, Subject } from 'rxjs';
import { StateService, UIRouterGlobals } from '@uirouter/core';
import { isEqual } from 'lodash';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AutocompleteOptions } from '@gravitee/ui-particles-angular';
import * as _ from 'lodash';

import { UIRouterState, UIRouterStateParams } from '../../../../../ajs-upgraded-providers';
import { SubscriptionStatus } from '../../../../../entities/subscription/subscription';
import { GioTableWrapperFilters } from '../../../../../shared/components/gio-table-wrapper/gio-table-wrapper.component';
import { ApiSubscriptionV2Service } from '../../../../../services-ngx/api-subscription-v2.service';
import { SnackBarService } from '../../../../../services-ngx/snack-bar.service';
import { GioPermissionService } from '../../../../../shared/components/gio-permission/gio-permission.service';
import { Api, ApiV4, Plan } from '../../../../../entities/management-api-v2';
import { ApiV2Service } from '../../../../../services-ngx/api-v2.service';
import { ApiPlanV2Service } from '../../../../../services-ngx/api-plan-v2.service';
import {
  ApiPortalSubscriptionCreationDialogComponent,
  ApiPortalSubscriptionCreationDialogData,
  ApiPortalSubscriptionCreationDialogResult,
} from '../components/dialogs/creation/api-portal-subscription-creation-dialog.component';
import { ApplicationService } from '../../../../../services-ngx/application.service';

type SubscriptionsTableDS = {
  id: string;
  plan: string;
  application: string;
  createdAt: Date;
  processedAt: Date;
  startingAt: Date;
  endAt: Date;
  status: string;
};

@Component({
  selector: 'api-portal-subscription-list',
  template: require('./api-portal-subscription-list.component.html'),
  styles: [require('./api-portal-subscription-list.component.scss')],
})
export class ApiPortalSubscriptionListComponent implements OnInit, OnDestroy {
  public displayedColumns = ['plan', 'application', 'createdAt', 'processedAt', 'startingAt', 'endAt', 'status', 'actions'];
  public subscriptionsTableDS: SubscriptionsTableDS[] = [];
  public nbTotalSubscriptions = 0;

  public filtersForm = new FormGroup({
    planIds: new FormControl(),
    applicationIds: new FormControl(),
    statuses: new FormControl(),
    apikey: new FormControl(),
  });

  public plans: Plan[] = [];
  public statuses: { id: SubscriptionStatus; name: string }[] = [
    { id: 'ACCEPTED', name: 'Accepted' },
    { id: 'CLOSED', name: 'Closed' },
    { id: 'PAUSED', name: 'Paused' },
    { id: 'PENDING', name: 'Pending' },
    { id: 'REJECTED', name: 'Rejected' },
    { id: 'RESUMED', name: 'Resumed' },
  ];

  private unsubscribe$: Subject<boolean> = new Subject<boolean>();

  // Create filters stream
  public filtersStream = new BehaviorSubject<{
    tableWrapper: GioTableWrapperFilters;
    subscriptionsFilters: {
      planIds?: string[];
      applicationIds?: string[];
      statuses?: SubscriptionStatus[];
      apikey?: string;
    };
  }>({
    tableWrapper: {
      pagination: { index: 1, size: 10 },
      searchTerm: '',
    },
    subscriptionsFilters: {
      planIds: null,
      applicationIds: null,
      statuses: ['ACCEPTED', 'PAUSED', 'PENDING'],
      apikey: undefined,
    },
  });

  private api: Api;

  public isLoadingData = true;
  public isReadOnly = false;
  private routeBase: string;

  constructor(
    @Inject(UIRouterStateParams) private readonly ajsStateParams,
    @Inject(UIRouterState) private readonly ajsState: StateService,
    private readonly ajsGlobals: UIRouterGlobals,
    private readonly apiService: ApiV2Service,
    private readonly apiPlanService: ApiPlanV2Service,
    private readonly apiSubscriptionService: ApiSubscriptionV2Service,
    private readonly applicationService: ApplicationService,
    private readonly snackBarService: SnackBarService,
    private readonly permissionService: GioPermissionService,
    private readonly matDialog: MatDialog,
  ) {}

  public ngOnInit(): void {
    this.initFilters();
    this.routeBase = this.ajsGlobals.current?.data?.baseRouteState ?? 'management.apis.detail.portal';

    this.filtersForm.valueChanges
      .pipe(distinctUntilChanged(isEqual), takeUntil(this.unsubscribe$))
      .subscribe(({ planIds, applicationIds, statuses, apikey }) =>
        this.filtersStream.next({
          tableWrapper: {
            ...this.filtersStream.value.tableWrapper,
            // go to first page when filters change
            pagination: { index: 1, size: this.filtersStream.value.tableWrapper.pagination.size },
          },
          subscriptionsFilters: {
            ...this.filtersStream.value.subscriptionsFilters,
            planIds,
            applicationIds,
            statuses,
            apikey,
          },
        }),
      );

    this.apiService
      .get(this.ajsStateParams.apiId)
      .pipe(
        tap((api) => {
          this.api = api;
          this.isReadOnly =
            !this.permissionService.hasAnyMatching(['api-subscription-u', 'api-subscription-c']) ||
            api.definitionContext?.origin === 'KUBERNETES';
        }),
        switchMap(() => this.apiPlanService.list(this.ajsStateParams.apiId, null, null, null, 1, 9999)),
        tap((plansResponse) => (this.plans = plansResponse.data)),
        catchError((error) => {
          this.snackBarService.error(error.message);
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();

    this.filtersStream
      .pipe(
        debounceTime(400),
        distinctUntilChanged(isEqual),
        tap(({ subscriptionsFilters, tableWrapper }) => {
          // Change url params
          this.ajsState.go(
            '.',
            {
              page: tableWrapper.pagination.index,
              size: tableWrapper.pagination.size,
              status: subscriptionsFilters.statuses?.join(','),
              plan: subscriptionsFilters.planIds?.join(','),
              application: subscriptionsFilters.applicationIds?.join(','),
              apikey: subscriptionsFilters.apikey,
            },
            { notify: false },
          );
        }),
        tap(({ subscriptionsFilters }) => {
          this.filtersForm.get('planIds').setValue(subscriptionsFilters.planIds);
          this.filtersForm.get('applicationIds').setValue(subscriptionsFilters.applicationIds);
          this.filtersForm.get('statuses').setValue(subscriptionsFilters.statuses);
          this.filtersForm.get('apikey').setValue(subscriptionsFilters.apikey);
        }),
        switchMap(({ subscriptionsFilters, tableWrapper }) =>
          this.apiSubscriptionService
            .list(
              this.ajsStateParams.apiId,
              tableWrapper.pagination.index,
              tableWrapper.pagination.size,
              subscriptionsFilters.statuses,
              subscriptionsFilters.applicationIds,
              subscriptionsFilters.planIds,
              subscriptionsFilters.apikey,
              ['application', 'plan'],
            )
            .pipe(
              catchError(() => {
                this.snackBarService.error('Unable to try the request, please try again');
                return EMPTY;
              }),
            ),
        ),
        takeUntil(this.unsubscribe$),
      )
      .subscribe((apiSubscriptionsResponse) => {
        this.nbTotalSubscriptions = apiSubscriptionsResponse.pagination.totalCount;
        this.subscriptionsTableDS = (apiSubscriptionsResponse.data ?? []).map((subscription) => ({
          id: subscription.id,
          application: `${subscription.application?.name} (${subscription.application?.primaryOwner?.displayName})`,
          createdAt: subscription.createdAt,
          endAt: subscription.endingAt,
          plan: subscription.plan?.name,
          processedAt: subscription.processedAt,
          startingAt: subscription.startingAt,
          status: this.statuses.find((status) => status.id === subscription.status)?.name,
        }));
        this.isLoadingData = false;
      });
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.unsubscribe();
  }

  public navigateToSubscription(subscriptionId: string): void {
    this.ajsState.go(`${this.routeBase}.subscription.edit`, { subscriptionId });
  }

  public exportAsCSV(): void {
    const apiId = this.ajsStateParams.apiId;
    const page = '1';
    const perPage = `${this.nbTotalSubscriptions}`;
    const planIds: string[] = this.filtersStream.value.subscriptionsFilters.statuses;
    const applicationIds = this.filtersStream.value.subscriptionsFilters.applicationIds;
    const statuses = this.filtersStream.value.subscriptionsFilters.planIds;
    const apikey = this.filtersStream.value.subscriptionsFilters.apikey;

    this.apiSubscriptionService
      .exportAsCSV(apiId, page, perPage, planIds, applicationIds, statuses, apikey)
      .pipe(
        tap((blob) => {
          let fileName = `subscriptions-${this.api.name}-${this.api.apiVersion}-${_.now()}.csv`;
          fileName = fileName.replace(/[\s]/gi, '-').replace(/[^\w]/gi, '-');

          const anchor = document.createElement('a');
          anchor.download = fileName;
          anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
          anchor.click();
        }),
        catchError(() => {
          this.snackBarService.error('An error occurred while exporting the subscriptions.');
          return EMPTY;
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe();
  }

  public createSubscription(): void {
    this.matDialog
      .open<
        ApiPortalSubscriptionCreationDialogComponent,
        ApiPortalSubscriptionCreationDialogData,
        ApiPortalSubscriptionCreationDialogResult
      >(ApiPortalSubscriptionCreationDialogComponent, {
        role: 'alertdialog',
        id: 'createSubscriptionDialog',
        data: {
          availableSubscriptionEntrypoints: this.getApiSubscriptionEntrypoints(this.api),
          plans: this.plans.filter((plan) => plan.status),
        },
      })
      .afterClosed()
      .pipe(
        switchMap((result) => {
          return result ? this.apiSubscriptionService.create(this.api.id, result.subscriptionToCreate) : EMPTY;
        }),
        takeUntil(this.unsubscribe$),
      )
      .subscribe(
        (subscription) => {
          this.snackBarService.success(`Subscription successfully created`);
          this.ajsState.go('management.apis.ng.subscription.edit', { subscriptionId: subscription.id });
        },
        (err) => this.snackBarService.error(err.message),
      );
  }

  onFiltersChanged(filters: GioTableWrapperFilters) {
    this.filtersStream.next({ ...this.filtersStream.value, tableWrapper: filters });
  }

  private initFilters() {
    const initialPageNumber = this.ajsStateParams.page ? Number(this.ajsStateParams.page) : 1;
    const initialPageSize = this.ajsStateParams.size ? Number(this.ajsStateParams.size) : 10;
    const initialPlanIds: string[] = this.ajsStateParams.plan ? this.ajsStateParams.plan.split(',') : null;
    const initialApplicationIds = this.ajsStateParams.application ? this.ajsStateParams.application.split(',') : null;
    const initialStatuses = this.ajsStateParams.status ? this.ajsStateParams.status.split(',') : ['ACCEPTED', 'PAUSED', 'PENDING'];
    const initialApikey = this.ajsStateParams.apikey ? this.ajsStateParams.apikey : undefined;

    this.filtersStream.next({
      tableWrapper: {
        searchTerm: '',
        pagination: { index: initialPageNumber, size: initialPageSize },
      },
      subscriptionsFilters: {
        planIds: initialPlanIds,
        applicationIds: initialApplicationIds,
        statuses: initialStatuses,
        apikey: initialApikey,
      },
    });
  }

  public resetFilters() {
    this.filtersStream.next({
      tableWrapper: {
        searchTerm: '',
        pagination: { index: 1, size: 10 },
      },
      subscriptionsFilters: {
        planIds: null,
        applicationIds: null,
        statuses: ['ACCEPTED', 'PAUSED', 'PENDING'],
        apikey: undefined,
      },
    });
  }

  private getApiSubscriptionEntrypoints(api: Api) {
    if (api.definitionVersion !== 'V4') {
      return [];
    }

    return (api as ApiV4).listeners.filter((listener) => listener.type === 'SUBSCRIPTION').flatMap((listener) => listener.entrypoints);
  }

  public searchApplications: (searchTerm: string) => Observable<AutocompleteOptions> = (searchTerm: string) => {
    return this.apiService.getSubscribers(this.ajsStateParams.apiId, searchTerm, 1, 20).pipe(
      map((subscribers) =>
        subscribers?.data?.map((subscriber) => ({
          value: subscriber.id,
          label: `${subscriber.name} (${subscriber.primaryOwner?.displayName})`,
        })),
      ),
    );
  };

  public displayApplication: (value: string) => Observable<string> = (value: string) => {
    return this.applicationService.getById(value).pipe(
      map((application) => `${application.name} (${application.owner?.displayName})`),
      catchError(() => {
        return of(value);
      }),
    );
  };
}
