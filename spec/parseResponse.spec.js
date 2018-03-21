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
            var htSlot = {
                id: htSlotName,
                getId: function () {
                    return this.id;
                }
            }
            for (var i = 0; i < xSlotsArray.length; i++) {
                var getId = createGetIdFunc(htSlotName);
                var xSlotName = xSlotsArray[i];
                returnParcels.push({
                    partnerId: profile.partnerId,
                    htSlot: htSlot,
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
    var fs = require('fs');
    var parseJson = require('parse-json');
    var path = require('path');
    var chai = require('chai');
    var sinon = require('sinon');
    var sinonChai = require("sinon-chai");
    var expect = chai.expect;
    chai.use(sinonChai);
    /* -------------------------------------------------------------------- */

    /* Instantiate your partner module */
    var partnerModule = partnerModule(partnerConfig);
    var partnerProfile = partnerModule.profile;

    /* Generate dummy return parcels based on MRA partner profile */
    var registerAd;
	var returnParcels = generateReturnParcels(partnerModule.profile, partnerConfig);
	var responseData = JSON.parse(fs.readFileSync(path.join(__dirname, './support/mockResponseData.json')));
	var mockData = responseData.bid;
	var expectSpy = sinon.spy(chai, 'expect');

    describe('should correctly parse bids:', function () {
		
        mockData = responseData.bid;

        beforeEach(function () {
            /* spy on RenderService.registerAd function, so that we can test it is called */
            registerAd = sinon.spy(libraryStubData["space-camp.js"].services.RenderService, 'registerAd');			
        });

        afterEach(function () {
            registerAd.restore();
        });
		
		for (var i = 0; i < mockData.length; i++) {
			(function(counter) {
				var expectedResults = responseData.results[counter];
				var requestId = expectedResults.requestId;
				it("Check response for slot " + requestId, function() {
					partnerModule.parseResponse(1, mockData[counter], returnParcels);
					if (expectedResults.pass === false) {
						chai.expect(registerAd.callCount).to.equal(1);
						var registerAdArgs = registerAd.getCalls()[0].args;
						chai.expect(registerAdArgs.price).to.equal(mockData.price);
						chai.expect(registerAdArgs.dealId).to.equal(mockData.placementId);
					}
					for (var responseAttr in expectedResults) {
						if (responseAttr === "targeting") {
							chai.expect(expectedResults[responseAttr].ix_imdi_dealid, "(Request:" + requestId + ") Attribute " + responseAttr + ".ix_imdi_dealid should be " + JSON.stringify(returnParcels[counter][responseAttr].ix_imdi_dealid) + ".  Instead it is " + JSON.stringify(expectedResults[responseAttr].ix_imdi_dealid)).to.deep.equal(returnParcels[counter][responseAttr].ix_imdi_dealid);
							chai.expect(expectedResults[responseAttr].ix_imdi_cpm, "(Request:" + requestId + ") Attribute " + responseAttr + ".ix_imdi_cpm should be " + JSON.stringify(returnParcels[counter][responseAttr].ix_imdi_cpm) + ".  Instead it is " + expectedResults[responseAttr].ix_imdi_cpm).to.deep.equal(returnParcels[counter][responseAttr].ix_imdi_cpm);
							chai.expect(expectedResults[responseAttr].ix_imdi_id, "(Request:" + requestId + ") Attribute " + responseAttr + ".ix_imdi_id should be " + JSON.stringify(returnParcels[counter][responseAttr].ix_imdi_id) + ".  Instead it is " + expectedResults[responseAttr].ix_imdi_id).to.deep.equal(returnParcels[counter][responseAttr].ix_imdi_id);
							chai.expect(expectedResults[responseAttr].pubKitAdId, "(Request:" + requestId + ") Attribute " + responseAttr + ".pubKitAdId should be a string starting with an underscore.  Instead it is " + expectedResults[responseAttr].pubKitAdId).to.match(/^_[a-zA-Z0-9]+$/);
						} else {
							chai.expect(returnParcels[counter][responseAttr], "(Request:" + requestId + ") Required attribute " + responseAttr + " does not exist").to.exist;
							chai.expect(expectedResults[responseAttr], "(Request:" + requestId + ") Attribute " + responseAttr + " should be " + JSON.stringify(expectedResults[responseAttr]) + ".  Instead it is " + responseData.results[counter][responseAttr]).to.deep.equal(returnParcels[counter][responseAttr]);
						}
					}
				});
			})(i);
		};
		
		after(function () {
			expectSpy.restore();
			chai.expect(expectSpy.callCount).to.equal(66);
		})
    });
});