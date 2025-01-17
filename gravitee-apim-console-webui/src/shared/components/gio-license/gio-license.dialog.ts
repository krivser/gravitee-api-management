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
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { GioLicenseService } from './gio-license.service';
import { Feature } from './gio-license-features';
import { UTMMedium } from './gio-license-utm';

import { GioEeUnlockDialogComponent, GioEeUnlockDialogData } from '../../../components/gio-ee-unlock-dialog/gio-ee-unlock-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class GioLicenseDialog {
  constructor(private readonly licenseService: GioLicenseService, private readonly matDialog: MatDialog) {}

  displayUpgradeCta(utmMedium: UTMMedium, event?: Event) {
    event?.stopPropagation();
    event?.preventDefault();
    const featureInfo = this.licenseService.getFeatureInfo(Feature.APIM_EN_MESSAGE_REACTOR);
    const trialURL = this.licenseService.getTrialURL(utmMedium);
    this.matDialog
      .open<GioEeUnlockDialogComponent, GioEeUnlockDialogData, boolean>(GioEeUnlockDialogComponent, {
        data: {
          featureInfo: featureInfo,
          trialURL,
        },
        role: 'alertdialog',
        id: 'gioLicenseDialog',
      })
      .afterClosed()
      .subscribe();
  }
}
