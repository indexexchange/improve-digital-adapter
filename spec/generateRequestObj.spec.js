/**
 * @author:    Index Exchange
 * @license:   UNLICENSED
 *
 * @copyright: Copyright (C) 2017 by Index Exchange. All rights reserved.
 *
 * The information contained within this document is confidential, copyrighted
 *  and or a trade secret. No part of this document may be reproduced or
 * distributed in any form or by any means, in whole or in part, without the
 * prior written permission of Index Exchange.
 */
// jshint ignore: start

'use strict';

/* =====================================
 * Utilities
 * ---------------------------------- */

function createGetIdFunc(input) {
    return function() {
        return input;
    };
}

var incrementalId = 2222222222;
function getRandomId() {
    return incrementalId++;
}
/**
 * Returns an array of parcels based on all of the xSlot/htSlot combinations defined
 * in the partnerConfig (simulates a session in which all of them were requested).
 *
 * @param {object} profile
 * @param {object} partnerConfig
 * @returns []
 */
function generateReturnParcels(profile, partnerConfig) {
    var returnParcels = [];

    for (var htSlotName in partnerConfig.mapping) {
        if (partnerConfig.mapping.hasOwnProperty(htSlotName)) {
            var xSlotsArray = partnerConfig.mapping[htSlotName];
            for (var i = 0; i < xSlotsArray.length; i++) {
                var getId = createGetIdFunc(htSlotName);
                var xSlotName = xSlotsArray[i];
                returnParcels.push({
                    partnerId: profile.partnerId,
                    htSlot: {
                        getId: getId
                    },
                    ref: "",
                    xSlotRef: partnerConfig.xSlots[xSlotName],
                    requestId: '_' + getRandomId()
                });
            }
        }
        //break;
    }

    return returnParcels;
}

/* =====================================
 * Testing
 * ---------------------------------- */

var expectedRequestObjects = {
    "htSlot1": "http://ad.360yield.com/hb?jsonp=%7B%22bid_request%22%3A%7B%22id%22%3A%22_1111111111%22%2C%22callback%22%3A%22undefined.ImproveDigitalHtb.adResponseCallback%22%2C%22version%22%3A%220.0.1-JS-4.3.3%22%2C%22imp%22%3A%5B%7B%22id%22%3A%22_2222222222%22%2C%22pid%22%3A1053688%2C%22banner%22%3A%7B%7D%7D%5D%7D%7D",
    "htSlot2": "http://ad.360yield.com/hb?jsonp=%7B%22bid_request%22%3A%7B%22id%22%3A%22_1111111112%22%2C%22callback%22%3A%22undefined.ImproveDigitalHtb.adResponseCallback%22%2C%22version%22%3A%220.0.1-JS-4.3.3%22%2C%22imp%22%3A%5B%7B%22id%22%3A%22_2222222223%22%2C%22pubid%22%3A1032%2C%22pkey%22%3A%22data_team_test_hb_smoke_test%22%2C%22banner%22%3A%7B%7D%7D%5D%7D%7D",
    "htSlot3": "http://ad.360yield.com/hb?jsonp=%7B%22bid_request%22%3A%7B%22id%22%3A%22_1111111113%22%2C%22callback%22%3A%22undefined.ImproveDigitalHtb.adResponseCallback%22%2C%22version%22%3A%220.0.1-JS-4.3.3%22%2C%22imp%22%3A%5B%7B%22id%22%3A%22_2222222224%22%2C%22pid%22%3A1053687%2C%22banner%22%3A%7B%22w%22%3A600%2C%22h%22%3A290%7D%7D%5D%7D%7D",
    "htSlot4": "http://ad.360yield.com/hb?jsonp=%7B%22bid_request%22%3A%7B%22id%22%3A%22_1111111114%22%2C%22callback%22%3A%22undefined.ImproveDigitalHtb.adResponseCallback%22%2C%22version%22%3A%220.0.1-JS-4.3.3%22%2C%22imp%22%3A%5B%7B%22id%22%3A%22_2222222225%22%2C%22pubid%22%3A1032%2C%22pkey%22%3A%22data_team_test_hb_size_filter_test%22%2C%22banner%22%3A%7B%22w%22%3A800%2C%22h%22%3A600%7D%7D%5D%7D%7D",
    "htSlot5": "http://ad.360yield.com/hb?jsonp=%7B%22bid_request%22%3A%7B%22id%22%3A%22_1111111115%22%2C%22callback%22%3A%22undefined.ImproveDigitalHtb.adResponseCallback%22%2C%22version%22%3A%220.0.1-JS-4.3.3%22%2C%22imp%22%3A%5B%7B%22id%22%3A%22_2222222226%22%2C%22pubid%22%3A1032%2C%22pkey%22%3A%22data_team_test_hb_key_value_test%22%2C%22kvw%22%3A%7B%22hbkv%22%3A%5B%2201%22%5D%7D%2C%22banner%22%3A%7B%7D%7D%5D%7D%7D",
    "htSlot6": "http://ad.360yield.com/hb?jsonp=%7B%22bid_request%22%3A%7B%22id%22%3A%22_1111111116%22%2C%22callback%22%3A%22undefined.ImproveDigitalHtb.adResponseCallback%22%2C%22version%22%3A%220.0.1-JS-4.3.3%22%2C%22imp%22%3A%5B%7B%22id%22%3A%22_2222222227%22%2C%22pid%22%3A1053689%2C%22kvw%22%3A%7B%22testKey%22%3A%5B%22testValue%22%5D%7D%2C%22banner%22%3A%7B%7D%7D%5D%7D%7D",
    "htSlot7": "http://ad.360yield.com/hb?jsonp=%7B%22bid_request%22%3A%7B%22id%22%3A%22_1111111117%22%2C%22callback%22%3A%22undefined.ImproveDigitalHtb.adResponseCallback%22%2C%22version%22%3A%220.0.1-JS-4.3.3%22%2C%22imp%22%3A%5B%7B%22id%22%3A%22_2222222228%22%2C%22currency%22%3A%22USD%22%2C%22pid%22%3A1053688%2C%22banner%22%3A%7B%7D%7D%5D%7D%7D",
    "htSlot8": "http://ad.360yield.com/hb?jsonp=%7B%22bid_request%22%3A%7B%22id%22%3A%22_1111111118%22%2C%22callback%22%3A%22undefined.ImproveDigitalHtb.adResponseCallback%22%2C%22version%22%3A%220.0.1-JS-4.3.3%22%2C%22imp%22%3A%5B%7B%22id%22%3A%22_2222222229%22%2C%22currency%22%3A%22AUD%22%2C%22pubid%22%3A1032%2C%22pkey%22%3A%22data_team_test_hb_smoke_test%22%2C%22banner%22%3A%7B%7D%7D%5D%7D%7D",
    "htSlot9": "http://ad.360yield.com/hb?jsonp=%7B%22bid_request%22%3A%7B%22id%22%3A%22_1111111119%22%2C%22callback%22%3A%22undefined.ImproveDigitalHtb.adResponseCallback%22%2C%22version%22%3A%220.0.1-JS-4.3.3%22%2C%22imp%22%3A%5B%7B%22id%22%3A%22_2222222230%22%2C%22currency%22%3A%22DKK%22%2C%22pid%22%3A1053687%2C%22banner%22%3A%7B%22w%22%3A600%2C%22h%22%3A290%7D%7D%5D%7D%7D",
    "htSlot10": "http://ad.360yield.com/hb?jsonp=%7B%22bid_request%22%3A%7B%22id%22%3A%22_1111111120%22%2C%22callback%22%3A%22undefined.ImproveDigitalHtb.adResponseCallback%22%2C%22version%22%3A%220.0.1-JS-4.3.3%22%2C%22imp%22%3A%5B%7B%22id%22%3A%22_2222222231%22%2C%22currency%22%3A%22CZK%22%2C%22pubid%22%3A1032%2C%22pkey%22%3A%22data_team_test_hb_size_filter_test%22%2C%22banner%22%3A%7B%22w%22%3A800%2C%22h%22%3A600%7D%7D%5D%7D%7D",
    "htSlot11": "http://ad.360yield.com/hb?jsonp=%7B%22bid_request%22%3A%7B%22id%22%3A%22_1111111121%22%2C%22callback%22%3A%22undefined.ImproveDigitalHtb.adResponseCallback%22%2C%22version%22%3A%220.0.1-JS-4.3.3%22%2C%22imp%22%3A%5B%7B%22id%22%3A%22_2222222232%22%2C%22currency%22%3A%22GBP%22%2C%22pubid%22%3A1032%2C%22pkey%22%3A%22data_team_test_hb_key_value_test%22%2C%22kvw%22%3A%7B%22hbkv%22%3A%5B%2201%22%5D%7D%2C%22banner%22%3A%7B%7D%7D%5D%7D%7D",
    "htSlot12": "http://ad.360yield.com/hb?jsonp=%7B%22bid_request%22%3A%7B%22id%22%3A%22_1111111122%22%2C%22callback%22%3A%22undefined.ImproveDigitalHtb.adResponseCallback%22%2C%22version%22%3A%220.0.1-JS-4.3.3%22%2C%22imp%22%3A%5B%7B%22id%22%3A%22_2222222233%22%2C%22currency%22%3A%22CHF%22%2C%22pid%22%3A1053689%2C%22kvw%22%3A%7B%22testKey%22%3A%5B%22testValue%22%5D%7D%2C%22banner%22%3A%7B%7D%7D%5D%7D%7D",
};

describe('generateRequestObj', function () {

    /* Setup and Library Stub
     * ------------------------------------------------------------- */
    var inspector = require('schema-inspector');
    var proxyquire = require('proxyquire').noCallThru();
    var libraryStubData = require('./support/libraryStubData.js');
    var incremental = 1111111111;
    libraryStubData["system.js"]["generateUniqueId"] = function() {
        var result = '_' + incremental;
        incremental++;
        return result;
    }
    var partnerModule = proxyquire('../improve-digital-htb.js', libraryStubData);
    var partnerConfig = require('./support/mockPartnerConfig.json');
    var expect = require('chai').expect;
    /* -------------------------------------------------------------------- */

    /* Instantiate your partner module */
    var partnerModule = partnerModule(partnerConfig);
    var partnerProfile = partnerModule.profile;

    /* Generate dummy return parcels based on MRA partner profile */
    var returnParcels;
    var requestObject;

    /* Generate a request object using generated mock return parcels. */
    returnParcels = generateReturnParcels(partnerProfile, partnerConfig);

    /* -------- IF SRA, generate a single request for each parcel -------- */
    if (partnerProfile.architecture) {
        requestObject = partnerModule.generateRequestObj(returnParcels);

        /* Simple type checking, should always pass */
        it('SRA - should return a correctly formatted object', function () {
            var result = inspector.validate({
                type: 'object',
                strict: true,
                properties: {
                    url: {
                        type: 'string',
                        minLength: 1
                    },
                    data: {
                        type: 'object'
                    },
                    callbackId: {
                        type: 'string',
                        minLength: 1
                    }
                }
            }, requestObject);

            expect(result.valid).to.be.true;
        });

        /* Test that the generateRequestObj function creates the correct object by building a URL
            * from the results. This is the bid request url the wrapper will send out to get demand
            * for your module.
            *
            * The url should contain all the necessary parameters for all of the request parcels
            * passed into the function.
            */

        /* ---------- ADD MORE TEST CASES TO TEST AGAINST REAL VALUES ------------*/
        it('should correctly build a url', function () {
            /* Write unit tests to verify that your bid request url contains the correct
                * request params, url, etc.
                */
            expect(requestObject).to.exist;
        });
        /* -----------------------------------------------------------------------*/

    /* ---------- IF MRA, generate a single request for each parcel ---------- */
    } else {
        for (var i = 0; i < returnParcels.length; i++) {
            requestObject = partnerModule.generateRequestObj([returnParcels[i]]);
            var expectedUrl = expectedRequestObjects[returnParcels[i].htSlot.getId()]
            /* Simple type checking, should always pass */
            it('MRA - should return a correctly formatted object', function () {
                var result = inspector.validate({
                    type: 'object',
                    strict: true,
                    properties: {
                        url: {
                            type: 'string',
                            minLength: 1
                        },
                        callbackId: {
                            type: 'string',
                            minLength: 1
                        }
                    }
                }, requestObject);

                expect(result.valid).to.be.true;
            });

            /* Test that the generateRequestObj function creates the correct object by building a URL
                * from the results. This is the bid request url that wrapper will send out to get demand
                * for your module.
                *
                * The url should contain all the necessary parameters for all of the request parcels
                * passed into the function.
                */

            /* ---------- ADD MORE TEST CASES TO TEST AGAINST REAL VALUES ------------*/
            it('should correctly build a url', function () {
                expect(requestObject.url).to.equal(expectedUrl);
            });
            /* -----------------------------------------------------------------------*/
        }
    }

});