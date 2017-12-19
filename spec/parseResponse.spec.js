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

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

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
    }

    return returnParcels;
}

/* =====================================
 * Testing
 * ---------------------------------- */

describe('parseResponse', function () {

    /* Setup and Library Stub
     * ------------------------------------------------------------- */
    var inspector = require('schema-inspector');
    var proxyquire = require('proxyquire').noCallThru();
    var libraryStubData = require('./support/libraryStubData.js');
    var partnerModule = proxyquire('../improve-digital-htb.js', libraryStubData);
    var partnerConfig = require('./support/mockPartnerConfig.json');
    var responseData = require('./support/mockResponseData.json');
    var expect = require('chai').expect;
    /* -------------------------------------------------------------------- */

    /* Instantiate your partner module */
    var partnerModule = partnerModule(partnerConfig);
    var partnerProfile = partnerModule.profile;

    /* Generate dummy return parcels based on MRA partner profile */
    var returnParcels;
    var result, expectedValue, mockData, returnParcels;

    describe('should correctly parse bids:', function () {
        /* Simple type checking on the returned objects, should always pass */
        //it('each parcel should have the required fields set', function () {
            returnParcels = generateReturnParcels(partnerModule.profile, partnerConfig);

            /* Get mock response data from our responseData file */
            mockData = responseData.bid;
            var expectedResults = responseData.results;

            for (var i = 0; i < mockData.length; i++) {
                /* IF MRA, parse one parcel at a time */
                if (!partnerProfile.architecture) partnerModule.parseResponse(1, mockData[i], [returnParcels[i]]); {
                    var requestId = returnParcels[i].requestId;
                    expect(isEmpty(responseData.results[i]), "expected results cannot be empty").to.be.false;
                    it('Parcel for request id ' + requestId + ' should have the required fields set', function () {
                        for (var responseAttr in responseData.results[i]) {
                            if (responseAttr === "targeting") {
                                expect(responseData.results[i][responseAttr].ix_imdi_dealid, "(Request:" + requestId + ") Attribute " + responseAttr + ".ix_imdi_dealid should be " + JSON.stringify(returnParcels[i][responseAttr].ix_imdi_dealid) + ".  Instead it is " + responseData.results[i][responseAttr].ix_imdi_dealid).to.deep.equal(returnParcels[i][responseAttr].ix_imdi_dealid);
                                expect(responseData.results[i][responseAttr].ix_imdi_cpm, "(Request:" + requestId + ") Attribute " + responseAttr + ".ix_imdi_cpm should be " + JSON.stringify(returnParcels[i][responseAttr].ix_imdi_cpm) + ".  Instead it is " + responseData.results[i][responseAttr].ix_imdi_cpm).to.deep.equal(returnParcels[i][responseAttr].ix_imdi_cpm);
                                expect(responseData.results[i][responseAttr].ix_imdi_id, "(Request:" + requestId + ") Attribute " + responseAttr + ".ix_imdi_id should be " + JSON.stringify(returnParcels[i][responseAttr].ix_imdi_id) + ".  Instead it is " + responseData.results[i][responseAttr].ix_imdi_id).to.deep.equal(returnParcels[i][responseAttr].ix_imdi_id);
                                expect(responseData.results[i][responseAttr].pubKitAdId, "(Request:" + requestId + ") Attribute " + responseAttr + ".pubKitAdId should be a string starting with an underscore.  Instead it is " + responseData.results[i][responseAttr].pubKitAdId).to.match(/^_[a-zA-Z0-9]+$/);
                            } else {
                                expect(returnParcels[i][responseAttr], "(Request:" + requestId + ") Required attribute " + responseAttr + " does not exist").to.exist;
                                expect(responseData.results[i][responseAttr], "(Request:" + requestId + ") Attribute " + responseAttr + " should be " + JSON.stringify(responseData.results[i][responseAttr]) + ".  Instead it is " + responseData.results[i][responseAttr]).to.deep.equal(returnParcels[i][responseAttr]);
                            }
                        }
                    });
                }
            }
        //});
    });
});