import { ApiCreationStep, ApiCreationStepperService } from './api-creation-stepper.service';

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
describe('ApiCreationStepperService', () => {
  const apiCreationStepperService = new ApiCreationStepperService(
    [
      {
        position: 1,
        label: 'Step 1',
        component: undefined,
      },
      {
        position: 2,
        label: 'Step 2',
        component: undefined,
      },
      {
        position: 3,
        label: 'Step 3',
        component: undefined,
      },
      {
        position: 4,
        label: 'Step 4',
        component: undefined,
      },
    ],
    {
      selectedEntrypoints: ['initial value'],
    },
  );

  let currentStep: ApiCreationStep;

  apiCreationStepperService.currentStep$.subscribe((step) => {
    currentStep = step;
  });

  it('should got to fist step', () => {
    apiCreationStepperService.goToStep(0);

    expect(currentStep.position).toEqual(1);
  });

  it('should save and go to next step(2)', () => {
    apiCreationStepperService.goToNextStep((previousPayload) => ({ ...previousPayload, name: 'Step 1' }));

    expect(currentStep.position).toEqual(2);
  });

  it('should save and go to next step(3)', () => {
    apiCreationStepperService.goToNextStep((previousPayload) => ({ ...previousPayload, description: 'Step 2' }));

    expect(currentStep.position).toEqual(3);
  });

  it('should save and go to next step(4)', () => {
    apiCreationStepperService.goToNextStep((previousPayload) => ({ ...previousPayload, version: 'Step 3' }));

    expect(currentStep.position).toEqual(4);
  });

  it('should have compiled payload from step 1 2 3', () => {
    expect(apiCreationStepperService.compileStepPayload(currentStep)).toEqual({
      name: 'Step 1',
      description: 'Step 2',
      version: 'Step 3',
      selectedEntrypoints: ['initial value'],
    });
  });

  it('should go to step 1 and change patch payload', () => {
    apiCreationStepperService.goToStep(0);
    apiCreationStepperService.goToNextStep((previousPayload) => {
      previousPayload.selectedEntrypoints.push('new value');

      return { ...previousPayload, name: 'Step 1 - edited' };
    });
  });

  it('should go to step 4', () => {
    apiCreationStepperService.goToStep(3);
  });

  it('should have compiled payload from step 1 2 3', () => {
    expect(apiCreationStepperService.compileStepPayload(currentStep)).toEqual({
      name: 'Step 1 - edited',
      description: 'Step 2',
      version: 'Step 3',
      selectedEntrypoints: ['initial value', 'new value'],
    });
  });
});
