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
import { HarnessLoader } from '@angular/cdk/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { InteractivityChecker } from '@angular/cdk/a11y';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatRadioGroupHarness } from '@angular/material/radio/testing';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatDatepickerInputHarness, MatDateRangeInputHarness } from '@angular/material/datepicker/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { set } from 'lodash';
import { GioConfirmDialogHarness } from '@gravitee/ui-particles-angular';

import { ApiPortalSubscriptionEditComponent } from './api-portal-subscription-edit.component';
import { ApiPortalSubscriptionEditHarness } from './api-portal-subscription-edit.harness';

import { CurrentUserService, UIRouterState, UIRouterStateParams } from '../../../../../ajs-upgraded-providers';
import { CONSTANTS_TESTING, GioHttpTestingModule } from '../../../../../shared/testing';
import { ApiPortalSubscriptionsModule } from '../api-portal-subscriptions.module';
import { User as DeprecatedUser } from '../../../../../entities/user';
import {
  AcceptSubscription,
  fakeBasePlan,
  fakePlanV4,
  fakeSubscription,
  Plan,
  PlanMode,
  Subscription,
  UpdateSubscription,
  VerifySubscription,
} from '../../../../../entities/management-api-v2';
import { fakeApplication } from '../../../../../entities/application/Application.fixture';
import { ApiKeyMode } from '../../../../../entities/application/application';
import { ApiKeyValidationHarness } from '../components/api-key-validation/api-key-validation.harness';
import { ApiKey, fakeApiKey } from '../../../../../entities/management-api-v2/api-key';

const SUBSCRIPTION_ID = 'my-nice-subscription';
const API_ID = 'api_1';
const APP_ID = 'my-application';
const PLAN_ID = 'a-nice-plan-id';
const BASIC_SUBSCRIPTION = () =>
  fakeSubscription({
    id: SUBSCRIPTION_ID,
    plan: fakeBasePlan({ id: PLAN_ID }),
    status: 'ACCEPTED',
    application: {
      id: APP_ID,
      name: 'My Application',
      domain: 'https://my-domain.com',
      type: 'My special type',
      primaryOwner: {
        id: 'my-primary-owner',
        displayName: 'Primary Owner',
      },
    },
  });

describe('ApiPortalSubscriptionEditComponent', () => {
  const fakeUiRouter = { go: jest.fn() };
  const currentUser = new DeprecatedUser();
  currentUser.userPermissions = ['api-subscription-u', 'api-subscription-r', 'api-subscription-d'];

  let fixture: ComponentFixture<ApiPortalSubscriptionEditComponent>;
  let loader: HarnessLoader;
  let httpTestingController: HttpTestingController;

  const init = async () => {
    await TestBed.configureTestingModule({
      imports: [ApiPortalSubscriptionsModule, NoopAnimationsModule, GioHttpTestingModule, MatIconTestingModule],
      providers: [
        { provide: UIRouterState, useValue: fakeUiRouter },
        { provide: CurrentUserService, useValue: { currentUser } },
        { provide: 'Constants', useValue: CONSTANTS_TESTING },
        {
          provide: InteractivityChecker,
          useValue: {
            isFocusable: () => true, // This traps focus checks and so avoid warnings when dealing with
            isTabbable: () => true, // Allows tabbing and avoids warnings
          },
        },
      ],
    }).compileComponents();
  };

  beforeEach(async () => {
    await init();
  });

  afterEach(() => {
    jest.clearAllMocks();
    httpTestingController.verify();
  });

  describe('details', () => {
    it('should load accepted subscription', async () => {
      await initComponent();
      expectApplicationGet();
      expectApiKeyListGet();

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);

      expect(await harness.getId()).toEqual(SUBSCRIPTION_ID);
      expect(await harness.getPlan()).toEqual('Default plan (API_KEY)');
      expect(await harness.getStatus()).toEqual('ACCEPTED');
      expect(await harness.getApplication()).toEqual('My Application (Primary Owner) - Type: My special type');
      expect(await harness.getSubscribedBy()).toEqual('My subscriber');
      expect(await harness.getSubscriberMessage()).toEqual('My consumer message');
      expect(await harness.getPublisherMessage()).toEqual('My publisher message');
      expect(await harness.getCreatedAt()).toEqual('Jan 1, 2020 12:00:00.000 AM');
      expect(await harness.getProcessedAt()).toEqual('Jan 1, 2020 12:00:00.000 AM');
      expect(await harness.getClosedAt()).toEqual('-');
      expect(await harness.getPausedAt()).toEqual('-');
      expect(await harness.getStartingAt()).toEqual('Jan 1, 2020 12:00:00.000 AM');
      expect(await harness.getEndingAt()).toEqual('-');
      expect(await harness.getDomain()).toEqual('https://my-domain.com');

      expect(await harness.footerIsVisible()).toEqual(true);

      expect(await harness.transferBtnIsVisible()).toEqual(true);
      expect(await harness.pauseBtnIsVisible()).toEqual(true);
      expect(await harness.resumeBtnIsVisible()).toEqual(false);
      expect(await harness.changeEndDateBtnIsVisible()).toEqual(true);
      expect(await harness.closeBtnIsVisible()).toEqual(true);

      expect(await harness.validateBtnIsVisible()).toEqual(false);
      expect(await harness.rejectBtnIsVisible()).toEqual(false);

      await harness.goBackToSubscriptionsList();
      expect(fakeUiRouter.go).toHaveBeenCalledWith('management.apis.ng.subscriptions');
    });

    it('should load pending subscription', async () => {
      const pendingSubscription = BASIC_SUBSCRIPTION();
      pendingSubscription.status = 'PENDING';
      await initComponent(pendingSubscription);
      expectApplicationGet();
      expectApiKeyListGet();

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);

      expect(await harness.getStatus()).toEqual('PENDING');

      expect(await harness.footerIsVisible()).toEqual(true);

      expect(await harness.transferBtnIsVisible()).toEqual(false);
      expect(await harness.pauseBtnIsVisible()).toEqual(false);
      expect(await harness.changeEndDateBtnIsVisible()).toEqual(false);
      expect(await harness.closeBtnIsVisible()).toEqual(false);

      expect(await harness.validateBtnIsVisible()).toEqual(true);
      expect(await harness.rejectBtnIsVisible()).toEqual(true);
    });

    it('should load rejected subscription', async () => {
      const rejectedSubscription = BASIC_SUBSCRIPTION();
      rejectedSubscription.status = 'REJECTED';
      await initComponent(rejectedSubscription);

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);

      expect(await harness.getStatus()).toEqual('REJECTED');

      expect(await harness.footerIsVisible()).toEqual(false);

      expect(await harness.transferBtnIsVisible()).toEqual(false);
      expect(await harness.pauseBtnIsVisible()).toEqual(false);
      expect(await harness.changeEndDateBtnIsVisible()).toEqual(false);
      expect(await harness.closeBtnIsVisible()).toEqual(false);

      expect(await harness.validateBtnIsVisible()).toEqual(false);
      expect(await harness.rejectBtnIsVisible()).toEqual(false);
    });

    it('should not load footer in read-only mode', async () => {
      await initComponent(BASIC_SUBSCRIPTION(), ['api-subscription-r']);
      expectApplicationGet(ApiKeyMode.SHARED);
      expectApiKeyListGet();

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      expect(await harness.footerIsVisible()).toEqual(false);
    });
  });

  describe('transfer subscription', () => {
    it('should transfer subscription to new push plan', async () => {
      const pushPlanSubscription = BASIC_SUBSCRIPTION();
      pushPlanSubscription.plan = fakeBasePlan({ id: PLAN_ID, security: { type: undefined, configuration: {} } });
      await initComponent(pushPlanSubscription);

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      expect(await harness.transferBtnIsVisible()).toEqual(true);

      await harness.openTransferDialog();

      const transferDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#transferSubscriptionDialog' }),
      );
      expectApiPlansList(
        [
          fakePlanV4({ id: PLAN_ID, name: 'original', mode: 'PUSH', security: { type: undefined, configuration: {} } }),
          fakePlanV4({ id: 'new-id', name: 'new', generalConditions: '', mode: 'PUSH', security: { type: undefined, configuration: {} } }),
          fakePlanV4({ id: 'other-id', name: 'other', mode: 'PUSH', security: { type: undefined, configuration: {} } }),
        ],
        [],
        'PUSH',
      );
      expect(await transferDialog.getTitleText()).toEqual('Transfer your subscription');

      const radioGroup = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(MatRadioGroupHarness);
      expect(await radioGroup.getRadioButtons().then((buttons) => buttons.length)).toEqual(2);
      expect(await radioGroup.getRadioButtons({ label: 'other' }).then((btn) => btn[0].isDisabled())).toEqual(true);
      expect(await radioGroup.getRadioButtons({ label: 'new' }).then((btn) => btn[0].isDisabled())).toEqual(false);

      const transferBtn = await transferDialog.getHarness(MatButtonHarness.with({ text: 'Transfer' }));
      expect(await transferBtn.isDisabled()).toEqual(true);

      await radioGroup.checkRadioButton({ label: 'new' });
      expect(await radioGroup.getCheckedValue()).toEqual('new-id');

      expect(await transferBtn.isDisabled()).toEqual(false);
      await transferBtn.click();

      expectApiSubscriptionTransfer(
        SUBSCRIPTION_ID,
        'new-id',
        fakeSubscription({ id: SUBSCRIPTION_ID, plan: fakeBasePlan({ id: 'new-id', name: 'new' }) }),
      );
      const newSubscription = BASIC_SUBSCRIPTION();
      newSubscription.plan = fakePlanV4({
        id: 'new-id',
        name: 'new',
        generalConditions: '',
        security: { type: undefined, configuration: {} },
      });
      expectApiSubscriptionGet(newSubscription);

      expect(await harness.getPlan()).toEqual('new');
    });

    it('should not transfer subscription on cancel', async () => {
      await initComponent();
      expectApplicationGet();
      expectApiKeyListGet();

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      expect(await harness.transferBtnIsVisible()).toEqual(true);

      await harness.openTransferDialog();

      const transferDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#transferSubscriptionDialog' }),
      );
      expectApiPlansList(
        [
          fakePlanV4({ id: PLAN_ID, name: 'original' }),
          fakePlanV4({ id: 'new-id', name: 'new', generalConditions: '' }),
          fakePlanV4({ id: 'other-id', name: 'other' }),
        ],
        ['API_KEY'],
        'STANDARD',
      );

      await transferDialog.getHarness(MatButtonHarness.with({ text: 'Cancel' })).then((btn) => btn.click());

      expect(await harness.getPlan()).toEqual('Default plan (API_KEY)');
    });
  });

  describe('pause subscription', () => {
    const API_KEYS_DIALOG_TXT = 'All Api-keys associated to this subscription will be paused and unusable.';

    it('should pause subscription', async () => {
      await initComponent(BASIC_SUBSCRIPTION());
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet();

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      expect(await harness.pauseBtnIsVisible()).toEqual(true);

      await harness.openPauseDialog();

      const pauseDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#confirmPauseSubscriptionDialog' }),
      );
      expect(await pauseDialog.getTitleText()).toEqual('Pause your subscription');
      // expect the dialog specific to sharedApiKeyMode to be present
      expect(await pauseDialog.getContentText().then((txt) => txt.indexOf(API_KEYS_DIALOG_TXT) !== -1)).toEqual(true);

      const pauseBtn = await pauseDialog.getHarness(MatButtonHarness.with({ text: 'Pause' }));
      expect(await pauseBtn.isDisabled()).toEqual(false);
      await pauseBtn.click();

      const pausedSubscription = BASIC_SUBSCRIPTION();
      pausedSubscription.status = 'PAUSED';

      expectApiSubscriptionPause(SUBSCRIPTION_ID, pausedSubscription);
      expectApiSubscriptionGet(pausedSubscription);
      expectApplicationGet();
      expectApiKeyListGet();

      expect(await harness.getStatus()).toEqual('PAUSED');
      expect(await harness.pauseBtnIsVisible()).toEqual(false);
      expect(await harness.resumeBtnIsVisible()).toEqual(true);
    });
    it('should not pause subscription on cancel', async () => {
      await initComponent();
      expectApplicationGet();
      expectApiKeyListGet();

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      await harness.openPauseDialog();

      const pauseDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#confirmPauseSubscriptionDialog' }),
      );
      const cancelBtn = await pauseDialog.getHarness(MatButtonHarness.with({ text: 'Cancel' }));
      await cancelBtn.click();

      expect(await harness.getStatus()).toEqual('ACCEPTED');
    });
    it('should not contain info about shared API Key', async () => {
      const keylessSubscription = BASIC_SUBSCRIPTION();
      keylessSubscription.plan = fakeBasePlan({ security: { type: 'KEY_LESS' } });
      await initComponent(keylessSubscription);

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      await harness.openPauseDialog();

      const pauseDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#confirmPauseSubscriptionDialog' }),
      );
      expect(await pauseDialog.getContentText().then((txt) => txt.indexOf(API_KEYS_DIALOG_TXT))).toEqual(-1);
    });
  });

  describe('resume subscription', () => {
    const pausedSubscription = BASIC_SUBSCRIPTION();
    pausedSubscription.status = 'PAUSED';

    it('should resume subscription', async () => {
      await initComponent(pausedSubscription);
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet();

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      expect(await harness.resumeBtnIsVisible()).toEqual(true);

      await harness.openResumeDialog();

      const resumeDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#confirmResumeSubscriptionDialog' }),
      );
      expect(await resumeDialog.getTitleText()).toEqual('Resume your subscription');

      const resumeBtn = await resumeDialog.getHarness(MatButtonHarness.with({ text: 'Resume' }));
      expect(await resumeBtn.isDisabled()).toEqual(false);
      await resumeBtn.click();

      expectApiSubscriptionResume(SUBSCRIPTION_ID, BASIC_SUBSCRIPTION());
      expectApiSubscriptionGet(BASIC_SUBSCRIPTION());
      expectApplicationGet();
      expectApiKeyListGet();

      expect(await harness.getStatus()).toEqual('ACCEPTED');
      expect(await harness.pauseBtnIsVisible()).toEqual(true);
      expect(await harness.resumeBtnIsVisible()).toEqual(false);
    });
    it('should not resume subscription on cancel', async () => {
      await initComponent(pausedSubscription);
      expectApplicationGet();
      expectApiKeyListGet();

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      await harness.openResumeDialog();

      const resumeDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#confirmResumeSubscriptionDialog' }),
      );
      const cancelBtn = await resumeDialog.getHarness(MatButtonHarness.with({ text: 'Cancel' }));
      await cancelBtn.click();

      expect(await harness.getStatus()).toEqual('PAUSED');
    });
  });

  describe('change end date', () => {
    it('should assign end date with no current end date', async () => {
      await initComponent();
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet();

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      expect(await harness.changeEndDateBtnIsVisible()).toEqual(true);
      await harness.openChangeEndDateDialog();

      const changeEndDateDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#changeEndDateDialog' }),
      );
      expect(await changeEndDateDialog.getTitleText()).toEqual('Change the subscription end date');

      const datepicker = await changeEndDateDialog.getHarness(MatDatepickerInputHarness);
      expect(await datepicker.getValue()).toEqual('');

      const changeEndDateBtn = await changeEndDateDialog.getHarness(MatButtonHarness.with({ text: 'Change end date' }));

      expect(await changeEndDateBtn.isDisabled()).toEqual(true);
      await datepicker.openCalendar();
      await datepicker.setValue('01/01/2080');

      expect(await changeEndDateBtn.isDisabled()).toEqual(false);
      await changeEndDateBtn.click();

      const endingAt: Date = new Date('01/01/2080');
      const newEndDateSubscription = BASIC_SUBSCRIPTION();
      newEndDateSubscription.endingAt = endingAt;

      expectApiSubscriptionUpdate(
        SUBSCRIPTION_ID,
        {
          startingAt: BASIC_SUBSCRIPTION().startingAt,
          endingAt,
          consumerConfiguration: BASIC_SUBSCRIPTION().consumerConfiguration,
          metadata: BASIC_SUBSCRIPTION().metadata,
        },
        newEndDateSubscription,
      );

      expectApiSubscriptionGet(newEndDateSubscription);
      expectApplicationGet();
      expectApiKeyListGet();

      expect(await harness.getEndingAt()).toEqual('Jan 1, 2080 12:00:00.000 AM');
    });
    it('should change existing end date', async () => {
      const endingAt = new Date('01/01/2080');

      const endingAtSubscription = BASIC_SUBSCRIPTION();
      endingAtSubscription.endingAt = endingAt;

      await initComponent(endingAtSubscription);
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet();

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      expect(await harness.getEndingAt()).toEqual('Jan 1, 2080 12:00:00.000 AM');

      await harness.openChangeEndDateDialog();

      const changeEndDateDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#changeEndDateDialog' }),
      );

      const datepicker = await changeEndDateDialog.getHarness(MatDatepickerInputHarness);
      expect(await datepicker.getValue()).toEqual(endingAt.toLocaleDateString());

      const changeEndDateBtn = await changeEndDateDialog.getHarness(MatButtonHarness.with({ text: 'Change end date' }));

      expect(await changeEndDateBtn.isDisabled()).toEqual(true);
      await datepicker.openCalendar();
      await datepicker.setValue('01/02/2080');

      expect(await changeEndDateBtn.isDisabled()).toEqual(false);
      await changeEndDateBtn.click();

      const newEndingAt: Date = new Date('01/02/2080');
      const newEndDateSubscription = BASIC_SUBSCRIPTION();
      newEndDateSubscription.endingAt = newEndingAt;

      expectApiSubscriptionUpdate(
        SUBSCRIPTION_ID,
        {
          startingAt: BASIC_SUBSCRIPTION().startingAt,
          endingAt: newEndingAt,
          consumerConfiguration: BASIC_SUBSCRIPTION().consumerConfiguration,
          metadata: BASIC_SUBSCRIPTION().metadata,
        },
        newEndDateSubscription,
      );

      expectApiSubscriptionGet(newEndDateSubscription);
      expectApplicationGet();
      expectApiKeyListGet();

      expect(await harness.getEndingAt()).toEqual('Jan 2, 2080 12:00:00.000 AM');
    });
    it('should not change end date on cancel', async () => {
      await initComponent();
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet();

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      await harness.openChangeEndDateDialog();

      const changeEndDateDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#changeEndDateDialog' }),
      );
      const cancelBtn = await changeEndDateDialog.getHarness(MatButtonHarness.with({ text: 'Cancel' }));
      await cancelBtn.click();
    });
  });

  describe('close subscription', () => {
    beforeEach(async () => {
      await initComponent();
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet();
    });
    it('should close subscription', async () => {
      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      expect(await harness.closeBtnIsVisible()).toEqual(true);

      await harness.openCloseDialog();

      const closeDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#confirmCloseSubscriptionDialog' }),
      );
      expect(await closeDialog.getTitleText()).toEqual('Close your subscription');

      const closeBtn = await closeDialog.getHarness(MatButtonHarness.with({ text: 'Close' }));
      expect(await closeBtn.isDisabled()).toEqual(false);
      await closeBtn.click();

      expectApiSubscriptionClose(SUBSCRIPTION_ID, BASIC_SUBSCRIPTION());
      const closedSubscription = BASIC_SUBSCRIPTION();
      closedSubscription.status = 'CLOSED';
      expectApiSubscriptionGet(closedSubscription);
      expectApplicationGet();
      expectApiKeyListGet();

      expect(await harness.getStatus()).toEqual('CLOSED');
      expect(await harness.pauseBtnIsVisible()).toEqual(false);
      expect(await harness.resumeBtnIsVisible()).toEqual(false);
    });
    it('should not close subscription on cancel', async () => {
      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      expect(await harness.closeBtnIsVisible()).toEqual(true);

      await harness.openCloseDialog();

      const closeDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#confirmCloseSubscriptionDialog' }),
      );
      const cancelBtn = await closeDialog.getHarness(MatButtonHarness.with({ text: 'Cancel' }));
      await cancelBtn.click();

      expect(await harness.getStatus()).toEqual('ACCEPTED');
    });
  });

  describe('validate subscription', () => {
    const pendingSubscription = BASIC_SUBSCRIPTION();
    pendingSubscription.status = 'PENDING';

    it('should validate without any extra information', async () => {
      await initComponent(pendingSubscription);
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet();

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      expect(await harness.validateBtnIsVisible()).toEqual(true);

      await harness.openValidateDialog();

      const validateDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#validateSubscriptionDialog' }),
      );
      expect(await validateDialog.getTitleText()).toEqual('Validate your subscription');

      const validateBtn = await validateDialog.getHarness(MatButtonHarness.with({ text: 'Validate' }));
      expect(await validateBtn.isDisabled()).toEqual(false);
      await validateBtn.click();

      expectApiSubscriptionValidate(SUBSCRIPTION_ID, {}, BASIC_SUBSCRIPTION());

      expectApiSubscriptionGet(BASIC_SUBSCRIPTION());
      expectApplicationGet();
      expectApiKeyListGet();

      expect(await harness.getStatus()).toEqual('ACCEPTED');
      expect(await harness.validateBtnIsVisible()).toEqual(false);
    });
    it('should validate with extra information', async () => {
      await initComponent(pendingSubscription);
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet();

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      await harness.openValidateDialog();

      const validateDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#validateSubscriptionDialog' }),
      );

      const datePicker = await validateDialog.getHarness(MatDateRangeInputHarness);
      expect(await datePicker.getValue()).toEqual('');
      await datePicker.openCalendar();
      await datePicker.getStartInput().then((startInput) => startInput.setValue('01/01/2080'));
      await datePicker.getEndInput().then((endInput) => endInput.setValue('01/02/2080'));

      const message = await validateDialog.getHarness(MatInputHarness.with({ selector: '#subscription-message' }));
      expect(await message.getValue()).toEqual('');
      await message.setValue('A great new message');

      const customApiKey = await validateDialog.getHarness(ApiKeyValidationHarness);
      expect(await customApiKey.getInputValue()).toEqual('');
      await customApiKey.setInputValue('12345678');
      expectApiSubscriptionVerify(true, '12345678');

      const validateBtn = await validateDialog.getHarness(MatButtonHarness.with({ text: 'Validate' }));
      await validateBtn.click();

      expectApiSubscriptionValidate(
        SUBSCRIPTION_ID,
        {
          customApiKey: '12345678',
          reason: 'A great new message',
          startingAt: new Date('01/01/2080'),
          endingAt: new Date('01/02/2080'),
        },
        BASIC_SUBSCRIPTION(),
      );

      expectApiSubscriptionGet(BASIC_SUBSCRIPTION());
      expectApplicationGet();
      expectApiKeyListGet();

      expect(await harness.getStatus()).toEqual('ACCEPTED');
      expect(await harness.validateBtnIsVisible()).toEqual(false);
    });
    it('should validate with sharedApiKeyMode and cannot use custom key', async () => {
      await initComponent(pendingSubscription, undefined, false);
      expectApplicationGet(ApiKeyMode.SHARED);
      expectApiKeyListGet();

      await validateInformation(false);
    });
    it('should validate without sharedKeyMode and can use custom key', async () => {
      await initComponent(pendingSubscription);
      expectApplicationGet(ApiKeyMode.UNSPECIFIED);
      expectApiKeyListGet();

      await validateInformation(true);
    });
    it('should validate without sharedKeyMode and cannot use custom key', async () => {
      await initComponent(pendingSubscription, undefined, false);
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet();

      await validateInformation(false);
    });
    it('should validate with sharedApiKeyMode and can use custom key', async () => {
      await initComponent(pendingSubscription);
      expectApplicationGet(ApiKeyMode.SHARED);
      expectApiKeyListGet();

      await validateInformation(false);
    });
    it('should not validate on cancel', async () => {
      await initComponent(pendingSubscription);
      expectApplicationGet(ApiKeyMode.SHARED);
      expectApiKeyListGet();

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      await harness.openValidateDialog();

      const validateDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#validateSubscriptionDialog' }),
      );
      const cancelBtn = await validateDialog.getHarness(MatButtonHarness.with({ text: 'Cancel' }));
      await cancelBtn.click();
    });

    const validateInformation = async (apiKeyInputIsPresent: boolean) => {
      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      await harness.openValidateDialog();

      const validateDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#validateSubscriptionDialog' }),
      );

      await validateDialog
        .getHarness(ApiKeyValidationHarness)
        .then((isPresent) => (apiKeyInputIsPresent ? expect(isPresent).toBeTruthy() : fail('ApiKeyValidationComponent should be present')))
        .catch((err) => (apiKeyInputIsPresent ? fail('ApiKeyValidationComponent should not be present') : expect(err).toBeTruthy()));

      const validateBtn = await validateDialog.getHarness(MatButtonHarness.with({ text: 'Validate' }));
      await validateBtn.click();

      expectApiSubscriptionValidate(SUBSCRIPTION_ID, {}, BASIC_SUBSCRIPTION());

      expectApiSubscriptionGet(BASIC_SUBSCRIPTION());
      expectApplicationGet();
      expectApiKeyListGet();

      expect(await harness.getStatus()).toEqual('ACCEPTED');
      expect(await harness.validateBtnIsVisible()).toEqual(false);
    };
  });

  describe('reject subscription', () => {
    beforeEach(async () => {
      const pendingSubscription = BASIC_SUBSCRIPTION();
      pendingSubscription.status = 'PENDING';

      await initComponent(pendingSubscription);
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet();
    });
    it('should reject subscription with no reason specified', async () => {
      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      expect(await harness.rejectBtnIsVisible()).toEqual(true);

      await harness.openRejectDialog();

      const rejectDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#rejectSubscriptionDialog' }),
      );
      expect(await rejectDialog.getTitleText()).toEqual('Reject your subscription');

      const rejectBtn = await rejectDialog.getHarness(MatButtonHarness.with({ text: 'Reject' }));
      expect(await rejectBtn.isDisabled()).toEqual(false);
      await rejectBtn.click();

      expectApiSubscriptionReject(SUBSCRIPTION_ID, '', BASIC_SUBSCRIPTION());

      const rejectedSubscription = BASIC_SUBSCRIPTION();
      rejectedSubscription.status = 'REJECTED';
      expectApiSubscriptionGet(rejectedSubscription);

      expect(await harness.getStatus()).toEqual('REJECTED');
      expect(await harness.validateBtnIsVisible()).toEqual(false);
    });
    it('should reject subscription with reason specified', async () => {
      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      await harness.openRejectDialog();

      const rejectDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#rejectSubscriptionDialog' }),
      );

      const formField = await rejectDialog.getHarness(MatInputHarness);
      await formField.setValue('A really great reason');

      const rejectBtn = await rejectDialog.getHarness(MatButtonHarness.with({ text: 'Reject' }));
      expect(await rejectBtn.isDisabled()).toEqual(false);
      await rejectBtn.click();

      expectApiSubscriptionReject(SUBSCRIPTION_ID, 'A really great reason', BASIC_SUBSCRIPTION());

      const rejectedSubscription = BASIC_SUBSCRIPTION();
      rejectedSubscription.status = 'REJECTED';
      expectApiSubscriptionGet(rejectedSubscription);

      expect(await harness.getStatus()).toEqual('REJECTED');
      expect(await harness.validateBtnIsVisible()).toEqual(false);
    });
    it('should not reject subscription on cancel', async () => {
      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      await harness.openRejectDialog();

      const rejectDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#rejectSubscriptionDialog' }),
      );
      const cancelBtn = await rejectDialog.getHarness(MatButtonHarness.with({ text: 'Cancel' }));
      await cancelBtn.click();
    });
  });

  describe('renew API Key', () => {
    it('should not be possible with no API Keys', async () => {
      await initComponent();
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet(SUBSCRIPTION_ID, [], undefined, undefined, 0);

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      expect(await harness.renewApiKeyBtnIsVisible()).toEqual(false);
    });
    it('should not be possible if subscription is not accepted', async () => {
      const pendingSubscription = BASIC_SUBSCRIPTION();
      pendingSubscription.status = 'PENDING';

      await initComponent(pendingSubscription);
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet(SUBSCRIPTION_ID);

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      expect(await harness.renewApiKeyBtnIsVisible()).toEqual(false);
    });
    it('should not be possible with shareApiKeys enabled', async () => {
      await initComponent();
      expectApplicationGet(ApiKeyMode.SHARED);
      expectApiKeyListGet(SUBSCRIPTION_ID);

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      expect(await harness.renewApiKeyBtnIsVisible()).toEqual(false);
    });
    it('should renew API Key without customApiKey enabled', async () => {
      await initComponent(undefined, undefined, false);
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet(SUBSCRIPTION_ID);

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      expect(await harness.renewApiKeyBtnIsVisible()).toEqual(true);
      await harness.openRenewApiKeyDialog();

      const renewDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#renewApiKeysDialog' }),
      );
      expect(await renewDialog.getTitleText()).toEqual('Renew your API Key');

      await renewDialog
        .getHarness(ApiKeyValidationHarness)
        .then((_) => fail('ApiKeyValidationComponent should not be present'))
        .catch((err) => expect(err).toBeTruthy());

      const renewBtn = await renewDialog.getHarness(MatButtonHarness.with({ text: 'Renew' }));
      expect(await renewBtn.isDisabled()).toEqual(false);

      await renewBtn.click();
      expectApiKeyRenew(SUBSCRIPTION_ID, '', fakeApiKey({ id: 'renewed-api-key' }));

      expectApiSubscriptionGet(BASIC_SUBSCRIPTION());
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet(SUBSCRIPTION_ID, [fakeApiKey({ key: 'renewed-api-key' })]);

      expect(await harness.getApiKeyByRowIndex(0)).toContain('renewed-api-key');
    });
    it('should renew API Key with customApiKey enabled', async () => {
      await initComponent();
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet(SUBSCRIPTION_ID, [fakeApiKey({ id: 'my-api-key' })]);

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      await harness.openRenewApiKeyDialog();

      const renewDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#renewApiKeysDialog' }),
      );

      const apiKeyValidation = await renewDialog.getHarness(ApiKeyValidationHarness);
      await apiKeyValidation.setInputValue('12345678');

      expectApiSubscriptionVerify(true, '12345678');

      const renewBtn = await renewDialog.getHarness(MatButtonHarness.with({ text: 'Renew' }));
      await renewBtn.click();

      expectApiKeyRenew(SUBSCRIPTION_ID, '12345678', fakeApiKey({ id: 'my-api-key', key: '12345678' }));

      expectApiSubscriptionGet(BASIC_SUBSCRIPTION());
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet(SUBSCRIPTION_ID, [fakeApiKey({ id: 'my-api-key', key: '12345678' })]);

      expect(await harness.getApiKeyByRowIndex(0)).toContain('12345678');
    });
    it('should not renew API Key on cancel', async () => {
      await initComponent();
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet(SUBSCRIPTION_ID, [fakeApiKey({ key: 'my-api-key' })]);

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      await harness.openRenewApiKeyDialog();

      const renewDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#renewApiKeysDialog' }),
      );

      const cancelBtn = await renewDialog.getHarness(MatButtonHarness.with({ text: 'Cancel' }));
      await cancelBtn.click();

      expect(await harness.getApiKeyByRowIndex(0)).toContain('my-api-key');
    });
  });

  describe('revoke API Key', () => {
    const API_KEY_ID = 'my-api-key-id';
    it('should not appear if shared API Keys is enabled', async () => {
      await initComponent();
      expectApplicationGet(ApiKeyMode.SHARED);
      expectApiKeyListGet(SUBSCRIPTION_ID);

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      await harness
        .getRevokeApiKeyBtn(0)
        .then((_) => fail('Revoke button should not be visible'))
        .catch((err) => expect(err).toBeTruthy());
    });
    it('should not appear if subscription status is pending', async () => {
      const pendingSubscription = BASIC_SUBSCRIPTION();
      pendingSubscription.status = 'PENDING';
      await initComponent(pendingSubscription);
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet(SUBSCRIPTION_ID);

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      await harness
        .getRevokeApiKeyBtn(0)
        .then((_) => fail('Revoke button should not be visible'))
        .catch((err) => expect(err).toBeTruthy());
    });
    it('should not appear if user lacks permissions', async () => {
      await initComponent(undefined, ['api-subscription-r', 'api-subscription-c', 'api-subscription-d']);
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet(SUBSCRIPTION_ID);

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      await harness
        .getRevokeApiKeyBtn(0)
        .then((_) => fail('Revoke button should not be visible'))
        .catch((err) => expect(err).toBeTruthy());
    });
    it('should revoke API Key', async () => {
      await initComponent();
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet(SUBSCRIPTION_ID, [fakeApiKey({ id: API_KEY_ID })]);

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      const revokeBtn = await harness.getRevokeApiKeyBtn(0);
      expect(await revokeBtn.isDisabled()).toEqual(false);
      await revokeBtn.click();

      const confirmDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(GioConfirmDialogHarness);
      await confirmDialog.confirm();

      const req = httpTestingController.expectOne({
        url: `${CONSTANTS_TESTING.env.v2BaseURL}/apis/${API_ID}/subscriptions/${SUBSCRIPTION_ID}/api-keys/${API_KEY_ID}/_revoke`,
        method: 'POST',
      });
      expect(req.request.body).toEqual({});
      req.flush(fakeApiKey({ id: API_KEY_ID }));

      expectApiSubscriptionGet(BASIC_SUBSCRIPTION());
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet(SUBSCRIPTION_ID, [fakeApiKey({ id: API_KEY_ID })]);
    });
    it('should not not revoke API Key on cancel', async () => {
      await initComponent();
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet(SUBSCRIPTION_ID, [fakeApiKey({ id: API_KEY_ID })]);

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      const revokeBtn = await harness.getRevokeApiKeyBtn(0);
      await revokeBtn.click();

      const confirmDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(GioConfirmDialogHarness);
      await confirmDialog.cancel();
    });
  });

  describe('change API Key expiration date', () => {
    it('should assign expiration date with no current expiration date', async () => {
      await initComponent();
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet(SUBSCRIPTION_ID, [fakeApiKey({ expireAt: undefined })]);

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      const expireBtn = await harness.getExpireApiKeyBtn(0);
      expect(await expireBtn.isDisabled()).toEqual(false);
      await expireBtn.click();

      const expireApiKeyDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#expireApiKeyDialog' }),
      );
      expect(await expireApiKeyDialog.getTitleText()).toEqual(`Change your API Key's expiration date`);

      const datepicker = await expireApiKeyDialog.getHarness(MatDatepickerInputHarness);
      expect(await datepicker.getValue()).toEqual('');

      const expireApiKeyBtn = await expireApiKeyDialog.getHarness(MatButtonHarness.with({ text: 'Change expiration date' }));

      expect(await expireApiKeyBtn.isDisabled()).toEqual(true);
      await datepicker.openCalendar();
      await datepicker.setValue('01/01/2080');

      expect(await expireApiKeyBtn.isDisabled()).toEqual(false);
      await expireApiKeyBtn.click();

      const endingAt: Date = new Date('01/01/2080');
      expectApiKeyUpdate(SUBSCRIPTION_ID, endingAt, fakeApiKey({ expireAt: endingAt }));

      expectApiSubscriptionGet(BASIC_SUBSCRIPTION());
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet(SUBSCRIPTION_ID, [fakeApiKey({ expireAt: endingAt })]);

      expect(await harness.getApiKeyEndDateByRowIndex(0)).toEqual('Jan 1, 2080 12:00:00.000 AM');
    });
    it('should change existing expiration date', async () => {
      const endingAt = new Date('01/01/2080');

      await initComponent();
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet(SUBSCRIPTION_ID, [fakeApiKey({ expireAt: endingAt })]);

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      const expireBtn = await harness.getExpireApiKeyBtn(0);
      await expireBtn.click();

      const expireApiKeyDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#expireApiKeyDialog' }),
      );

      const datepicker = await expireApiKeyDialog.getHarness(MatDatepickerInputHarness);
      expect(await datepicker.getValue()).toEqual(endingAt.toLocaleDateString());

      const expireApiKeyBtn = await expireApiKeyDialog.getHarness(MatButtonHarness.with({ text: 'Change expiration date' }));

      expect(await expireApiKeyBtn.isDisabled()).toEqual(true);
      await datepicker.openCalendar();
      await datepicker.setValue('01/02/2080');

      expect(await expireApiKeyBtn.isDisabled()).toEqual(false);
      await expireApiKeyBtn.click();

      const newEndingAt: Date = new Date('01/02/2080');

      expectApiKeyUpdate(SUBSCRIPTION_ID, newEndingAt, fakeApiKey({ expireAt: newEndingAt }));

      expectApiSubscriptionGet(BASIC_SUBSCRIPTION());
      expectApplicationGet();
      expectApiKeyListGet(SUBSCRIPTION_ID, [fakeApiKey({ expireAt: newEndingAt })]);

      expect(await harness.getApiKeyEndDateByRowIndex(0)).toEqual('Jan 2, 2080 12:00:00.000 AM');
    });
    it('should not change expiration date on cancel', async () => {
      await initComponent();
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet();

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      await harness.getExpireApiKeyBtn(0).then((btn) => btn.click());

      const changeEndDateDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(
        MatDialogHarness.with({ selector: '#expireApiKeyDialog' }),
      );
      const cancelBtn = await changeEndDateDialog.getHarness(MatButtonHarness.with({ text: 'Cancel' }));
      await cancelBtn.click();
    });
  });

  describe('reactivate API Key', () => {
    const API_KEY_ID = 'my-api-key-id';
    it('should not appear if API Key is valid', async () => {
      await initComponent();
      expectApplicationGet(ApiKeyMode.SHARED);
      expectApiKeyListGet(SUBSCRIPTION_ID, [fakeApiKey({ expired: false, revoked: false })]);

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      await harness
        .getReactivateApiKeyBtn(0)
        .then((_) => fail('Reactivate button should not be visible'))
        .catch((err) => expect(err).toBeTruthy());
    });
    it('should reactivate API Key', async () => {
      await initComponent();
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet(SUBSCRIPTION_ID, [fakeApiKey({ id: API_KEY_ID, expired: true, revoked: false })]);

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      const reactivateBtn = await harness.getReactivateApiKeyBtn(0);
      expect(await reactivateBtn.isDisabled()).toEqual(false);
      await reactivateBtn.click();

      const confirmDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(GioConfirmDialogHarness);
      await confirmDialog.confirm();

      const req = httpTestingController.expectOne({
        url: `${CONSTANTS_TESTING.env.v2BaseURL}/apis/${API_ID}/subscriptions/${SUBSCRIPTION_ID}/api-keys/${API_KEY_ID}/_reactivate`,
        method: 'POST',
      });
      expect(req.request.body).toEqual({});
      req.flush(fakeApiKey({ id: API_KEY_ID }));

      expectApiSubscriptionGet(BASIC_SUBSCRIPTION());
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet(SUBSCRIPTION_ID, [fakeApiKey({ id: API_KEY_ID })]);
    });
    it('should not not reactivate API Key on cancel', async () => {
      await initComponent();
      expectApplicationGet(ApiKeyMode.EXCLUSIVE);
      expectApiKeyListGet(SUBSCRIPTION_ID, [fakeApiKey({ id: API_KEY_ID, expired: false, revoked: true })]);

      const harness = await loader.getHarness(ApiPortalSubscriptionEditHarness);
      const reactivateBtn = await harness.getReactivateApiKeyBtn(0);
      await reactivateBtn.click();

      const confirmDialog = await TestbedHarnessEnvironment.documentRootLoader(fixture).getHarness(GioConfirmDialogHarness);
      await confirmDialog.cancel();
    });
  });

  async function initComponent(
    subscription: Subscription = BASIC_SUBSCRIPTION(),
    permissions: string[] = ['api-subscription-r', 'api-subscription-u', 'api-subscription-d'],
    canUseCustomApiKey = true,
  ) {
    await TestBed.overrideProvider(UIRouterStateParams, {
      useValue: { apiId: API_ID, subscriptionId: SUBSCRIPTION_ID },
    }).compileComponents();
    if (permissions) {
      const overrideUser = currentUser;
      overrideUser.userPermissions = permissions;
      await TestBed.overrideProvider(CurrentUserService, { useValue: { currentUser: overrideUser } });
    }

    await TestBed.overrideProvider('Constants', {
      useFactory: () => {
        const constants = CONSTANTS_TESTING;
        set(constants, 'env.settings.plan.security', {
          customApiKey: { enabled: canUseCustomApiKey },
        });
        return constants;
      },
    });
    fixture = TestBed.createComponent(ApiPortalSubscriptionEditComponent);
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    expectApiSubscriptionGet(subscription);

    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  }

  function expectApiSubscriptionGet(subscription: Subscription): void {
    httpTestingController
      .expectOne({
        url: `${CONSTANTS_TESTING.env.v2BaseURL}/apis/${API_ID}/subscriptions/${subscription.id}?expands=plan,application,subscribedBy`,
        method: 'GET',
      })
      .flush(subscription);
  }

  function expectApiPlansList(plans: Plan[], securities: string[], mode: PlanMode): void {
    httpTestingController
      .expectOne({
        url: `${CONSTANTS_TESTING.env.v2BaseURL}/apis/${API_ID}/plans?page=1&perPage=9999&securities=${securities}&statuses=PUBLISHED&mode=${mode}`,
        method: 'GET',
      })
      .flush({ data: plans });
  }

  function expectApiSubscriptionUpdate(subscriptionId: string, updateSubscription: UpdateSubscription, subscription: Subscription): void {
    const req = httpTestingController.expectOne({
      url: `${CONSTANTS_TESTING.env.v2BaseURL}/apis/${API_ID}/subscriptions/${subscriptionId}`,
      method: 'PUT',
    });
    expect(JSON.stringify(req.request.body)).toEqual(JSON.stringify(updateSubscription));
    req.flush(subscription);
  }

  function expectApiSubscriptionTransfer(subscriptionId: string, planId: string, subscription: Subscription): void {
    const req = httpTestingController.expectOne({
      url: `${CONSTANTS_TESTING.env.v2BaseURL}/apis/${API_ID}/subscriptions/${subscriptionId}/_transfer`,
      method: 'POST',
    });
    expect(req.request.body.planId).toEqual(planId);
    req.flush(subscription);
  }

  function expectApiSubscriptionPause(subscriptionId: string, subscription: Subscription): void {
    const req = httpTestingController.expectOne({
      url: `${CONSTANTS_TESTING.env.v2BaseURL}/apis/${API_ID}/subscriptions/${subscriptionId}/_pause`,
      method: 'POST',
    });
    expect(req.request.body).toEqual({});
    req.flush(subscription);
  }

  function expectApiSubscriptionResume(subscriptionId: string, subscription: Subscription): void {
    const req = httpTestingController.expectOne({
      url: `${CONSTANTS_TESTING.env.v2BaseURL}/apis/${API_ID}/subscriptions/${subscriptionId}/_resume`,
      method: 'POST',
    });
    expect(req.request.body).toEqual({});
    req.flush(subscription);
  }

  function expectApiSubscriptionClose(subscriptionId: string, subscription: Subscription): void {
    const req = httpTestingController.expectOne({
      url: `${CONSTANTS_TESTING.env.v2BaseURL}/apis/${API_ID}/subscriptions/${subscriptionId}/_close`,
      method: 'POST',
    });
    expect(req.request.body).toEqual({});
    req.flush(subscription);
  }

  function expectApiSubscriptionValidate(subscriptionId: string, acceptSubscription: AcceptSubscription, subscription: Subscription): void {
    const req = httpTestingController.expectOne({
      url: `${CONSTANTS_TESTING.env.v2BaseURL}/apis/${API_ID}/subscriptions/${subscriptionId}/_accept`,
      method: 'POST',
    });
    expect(JSON.stringify(req.request.body)).toEqual(JSON.stringify(acceptSubscription));
    req.flush(subscription);
  }

  function expectApiSubscriptionVerify(isUnique: boolean, key: string): void {
    const req = httpTestingController.expectOne({
      url: `${CONSTANTS_TESTING.env.v2BaseURL}/apis/${API_ID}/subscriptions/_verify`,
      method: 'POST',
    });
    const verifySubscription: VerifySubscription = {
      applicationId: APP_ID,
      apiKey: key,
    };
    expect(req.request.body).toEqual(verifySubscription);
    req.flush({ ok: isUnique });
  }

  function expectApiSubscriptionReject(subscriptionId: string, reason: string, subscription: Subscription): void {
    const req = httpTestingController.expectOne({
      url: `${CONSTANTS_TESTING.env.v2BaseURL}/apis/${API_ID}/subscriptions/${subscriptionId}/_reject`,
      method: 'POST',
    });
    expect(req.request.body).toEqual({ reason });
    req.flush(subscription);
  }

  function expectApiKeyListGet(
    subscriptionId: string = SUBSCRIPTION_ID,
    apiKeys: ApiKey[] = [fakeApiKey()],
    page = 1,
    perPage = 10,
    totalCount = 1,
  ) {
    httpTestingController
      .expectOne({
        url: `${CONSTANTS_TESTING.env.v2BaseURL}/apis/${API_ID}/subscriptions/${subscriptionId}/api-keys?page=${page}&perPage=${perPage}`,
        method: 'GET',
      })
      .flush({ data: apiKeys, pagination: { page, perPage, totalCount } });
  }

  function expectApiKeyRenew(subscriptionId: string, customApiKey: string, apiKey: ApiKey): void {
    const req = httpTestingController.expectOne({
      url: `${CONSTANTS_TESTING.env.v2BaseURL}/apis/${API_ID}/subscriptions/${subscriptionId}/api-keys/_renew`,
      method: 'POST',
    });
    expect(req.request.body).toEqual({ customApiKey });
    req.flush(apiKey);
  }

  function expectApiKeyUpdate(subscriptionId: string, expireAt: Date, apiKey: ApiKey): void {
    const req = httpTestingController.expectOne({
      url: `${CONSTANTS_TESTING.env.v2BaseURL}/apis/${API_ID}/subscriptions/${SUBSCRIPTION_ID}/api-keys/${apiKey.id}`,
      method: 'PUT',
    });
    expect(JSON.stringify(req.request.body)).toEqual(JSON.stringify({ expireAt }));
    req.flush(apiKey);
  }

  function expectApplicationGet(apiKeyMode: ApiKeyMode = ApiKeyMode.UNSPECIFIED): void {
    httpTestingController
      .expectOne({
        url: `${CONSTANTS_TESTING.env.baseURL}/applications/${APP_ID}`,
        method: 'GET',
      })
      .flush(fakeApplication({ id: APP_ID, api_key_mode: apiKeyMode }));
  }
});
