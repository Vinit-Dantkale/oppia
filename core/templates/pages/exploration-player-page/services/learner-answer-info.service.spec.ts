// Copyright 2014 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Unit tests for the learner answer info service.
 */

// TODO(#7222): Remove the following block of unnnecessary imports once
// the code corresponding to the spec is upgraded to Angular 8.
import { HttpClientTestingModule, HttpTestingController } from
  '@angular/common/http/testing';
import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';

import { AnswerClassificationResultObjectFactory } from
  'domain/classifier/AnswerClassificationResultObjectFactory';
import { AnswerClassificationService } from
  'pages/exploration-player-page/services/answer-classification.service';
import { LearnerAnswerDetailsBackendApiService } from
  'domain/statistics/learner-answer-details-backend-api.service.ts';
import { LearnerAnswerInfoService } from
  'pages/exploration-player-page/services/learner-answer-info.service.ts';
import { OutcomeObjectFactory } from
  'domain/exploration/OutcomeObjectFactory.ts';
import { State, StateObjectFactory } from 'domain/state/StateObjectFactory.ts';
//import { UpgradedServices } from 'services/UpgradedServices';

class MockLearnerAnswerDetailsBackendApiService {}
class MockAnswerClassificationService {
  getMatchingClassificationResult() {}
}

fdescribe('Learner answer info service', () => {
  let sof: StateObjectFactory = null;
  let oof: OutcomeObjectFactory = null;
  let acrof: AnswerClassificationResultObjectFactory = null;
  let stateDict: any = null;
  let firstState: State = null;
  let secondState: State = null;
  let thirdState: State = null;
  let mockAnswer: string = null;
  let mockInteractionRulesService: any = null;
  let ladbas: LearnerAnswerDetailsBackendApiService = null;
  let learnerAnswerInfoService: LearnerAnswerInfoService = null;
  let answerClassificationService: AnswerClassificationService = null;
  let DEFAULT_OUTCOME_CLASSIFICATION;
  let httpTestingController;

  beforeEach(() => {
    stateDict = {
      content: {
        content_id: 'content',
        html: 'content'
      },
      recorded_voiceovers: {
        voiceovers_mapping: {
          content: {},
          default_outcome: {},
          feedback_1: {},
          feedback_2: {}
        }
      },
      interaction: {
        id: 'RuleTest',
        answer_groups: [{
          outcome: {
            dest: 'outcome 1',
            feedback: {
              content_id: 'feedback_1',
              html: ''
            },
            labelled_as_correct: false,
            param_changes: [],
            refresher_exploration_id: null,
            missing_prerequisite_skill_id: null
          },
          rule_specs: [{
            inputs: {
              x: 10
            },
            rule_type: 'Equals'
          }]
        }, {
          outcome: {
            dest: 'outcome 2',
            feedback: {
              content_id: 'feedback_2',
              html: ''
            },
            labelled_as_correct: false,
            param_changes: [],
            refresher_exploration_id: null,
            missing_prerequisite_skill_id: null
          },
          rule_specs: [{
            inputs: {
              x: 5
            },
            rule_type: 'Equals'
          }, {
            inputs: {
              x: 7
            },
            rule_type: 'NotEquals'
          }, {
            inputs: {
              x: 6
            },
            rule_type: 'Equals'
          }]
        }],
        default_outcome: {
          dest: 'default',
          feedback: {
            content_id: 'default_outcome',
            html: ''
          },
          labelled_as_correct: false,
          param_changes: [],
          refresher_exploration_id: null,
          missing_prerequisite_skill_id: null
        },
        hints: []
      },
      param_changes: [],
      solicit_answer_details: true,
      written_translations: {
        translations_mapping: {
          content: {},
          default_outcome: {},
          feedback_1: {},
          feedback_2: {}
        }
      }
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
      {
        provide: LearnerAnswerDetailsBackendApiService,
        useClass: MockLearnerAnswerDetailsBackendApiService
      },
      {
        provide: AnswerClassificationService,
        useClass: MockAnswerClassificationService
      }]
    });
    httpTestingController = TestBed.get(HttpTestingController);
    sof = TestBed.get(StateObjectFactory);
    oof = TestBed.get(OutcomeObjectFactory);
    acrof = TestBed.get(AnswerClassificationResultObjectFactory);
    firstState = sof.createFromBackendDict('new state', stateDict);
    secondState = sof.createFromBackendDict('fake state', stateDict);
    thirdState = sof.createFromBackendDict('demo state', stateDict);
    ladbas = TestBed.get(LearnerAnswerDetailsBackendApiService);
    console.log(JSON.stringify(ladbas)+"ladbas");
    answerClassificationService = TestBed.get(AnswerClassificationService);
    console.log(JSON.stringify(answerClassificationService)+"acs");
    learnerAnswerInfoService = TestBed.get(LearnerAnswerInfoService);
    console.log(JSON.stringify(learnerAnswerInfoService)+"lais");
    DEFAULT_OUTCOME_CLASSIFICATION = TestBed.get(
      DEFAULT_OUTCOME_CLASSIFICATION);
    console.log(JSON.parse(DEFAULT_OUTCOME_CLASSIFICATION)+"DOC");
    //console.log(JSON.parse(answerClassificationService)+"acs");
    spyOn(answerClassificationService, 'getMatchingClassificationResult')
      .and.returnValue(acrof.createNew(
        oof.createNew('default', 'default_outcome', '', []), 2, 0,
        DEFAULT_OUTCOME_CLASSIFICATION));
    mockAnswer = 'This is my answer';
    mockInteractionRulesService = {
      Equals: function(answer, inputs) {
        return inputs.x === answer;
      },
      NotEquals: function(answer, inputs) {
        return inputs.x !== answer;
      }
    };
    // Spying the random function to return 0, so that
    // getRandomProbabilityIndex() returns 0, which is a private function in
    // LearnerAnswerInfoService. This will help to mark the
    // canAskLearnerAnswerInfo which is a boolean variable as true as every
    // probability index is greater than 0.
    spyOn(Math, 'random').and.returnValue(0);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  fdescribe('.initLearnerAnswerInfo', () => {
    beforeEach(() => {
      learnerAnswerInfoService.initLearnerAnswerInfoService(
        '10', firstState, mockAnswer, mockInteractionRulesService, false);
    });
    fit('should return can ask learner for answer info true', function() {
      console.log(JSON.stringify(ladbas)+"ladbas");
      console.log(DEFAULT_OUTCOME_CLASSIFICATION+"DOC1");
      expect(learnerAnswerInfoService.getCanAskLearnerForAnswerInfo()).toBe(
        true);
    });

    fit('should return current answer', function() {
      expect(learnerAnswerInfoService.getCurrentAnswer()).toEqual(
        'This is my answer');
    });

    fit('should return current interaction rules service', function() {
      expect(
        learnerAnswerInfoService.getCurrentInteractionRulesService()).toEqual(
        mockInteractionRulesService);
    });
  });
  /*
  fdescribe('learner answer info service', () => {
    beforeEach(() => {
      learnerAnswerInfoService.initLearnerAnswerInfoService(
        '10', firstState, mockAnswer, mockInteractionRulesService, false);
    });

    fit('should not ask for answer details for same state', function() {
      expect(learnerAnswerInfoService.getCanAskLearnerForAnswerInfo()).toBe(
        true);
      learnerAnswerInfoService.recordLearnerAnswerInfo('My answer details');
      expect(learnerAnswerInfoService.getCanAskLearnerForAnswerInfo()).toBe(
        false);
      learnerAnswerInfoService.initLearnerAnswerInfoService(
        '10', firstState, mockAnswer, mockInteractionRulesService, false);
      expect(learnerAnswerInfoService.getCanAskLearnerForAnswerInfo()).toBe(
        false);
    });
  });

  fdescribe(
    'should not ask for answer details for trivial interaction ids',
    () => {
      beforeEach(() => {
        firstState.interaction.id = 'EndExploration';
        learnerAnswerInfoService.initLearnerAnswerInfoService(
          '10', firstState, mockAnswer, mockInteractionRulesService, false);
      });

      fit('should return can ask learner for answer info false', function() {
        expect(learnerAnswerInfoService.getCanAskLearnerForAnswerInfo()).toBe(
          false);
      });
    });

  fdescribe('init learner answer info service with solicit answer details false',
    () => {
      beforeEach(() => {
        firstState.solicitAnswerDetails = false;
        learnerAnswerInfoService.initLearnerAnswerInfoService(
          '10', firstState, mockAnswer, mockInteractionRulesService, false);
      });
      fit('should return can ask learner for answer info false', function() {
        expect(learnerAnswerInfoService.getCanAskLearnerForAnswerInfo()).toBe(
          false);
      });
    });

  fdescribe('.recordLearnerAnswerInfo', () => {
    beforeEach(() => {
      learnerAnswerInfoService.initLearnerAnswerInfoService(
        '10', firstState, mockAnswer, mockInteractionRulesService, false);
    });

    fit('should record learner answer details', function() {
      spyOn(ladbas, 'recordLearnerAnswerDetails');
      learnerAnswerInfoService.recordLearnerAnswerInfo('My details');
      expect(
        ladbas.recordLearnerAnswerDetails).toHaveBeenCalledWith(
        '10', 'new state', 'RuleTest', 'This is my answer', 'My details');
    });
  });

  fdescribe('learner answer info service', () => {
    beforeEach(() => {
      learnerAnswerInfoService.initLearnerAnswerInfoService(
        '10', firstState, mockAnswer, mockInteractionRulesService, false);
      learnerAnswerInfoService.recordLearnerAnswerInfo('My details 1');
      learnerAnswerInfoService.initLearnerAnswerInfoService(
        '10', secondState, mockAnswer, mockInteractionRulesService, false);
      learnerAnswerInfoService.recordLearnerAnswerInfo('My details 1');
    });

    fit('should not record answer details more than two times', function() {
      learnerAnswerInfoService.initLearnerAnswerInfoService(
        '10', thirdState, mockAnswer, mockInteractionRulesService, false);
      expect(learnerAnswerInfoService.getCanAskLearnerForAnswerInfo()).toBe(
        false);
    });
  });

  fdescribe('return html from the service', () => {
    fit('should return solicit answer details question', function() {
      expect(
        learnerAnswerInfoService.getSolicitAnswerDetailsQuestion()).toEqual(
        '<p translate="I18N_SOLICIT_ANSWER_DETAILS_QUESTION"></p>');
    });

    fit('should return solicit answer details feedback', function() {
      expect(
        learnerAnswerInfoService.getSolicitAnswerDetailsFeedback()).toEqual(
        '<p translate="I18N_SOLICIT_ANSWER_DETAILS_FEEDBACK"></p>');
    });
  });
  */
});
