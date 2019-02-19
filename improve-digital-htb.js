/**
 * @author:    Partner
 * @license:   UNLICENSED
 *
 * @copyright: Copyright (c) 2017 by Index Exchange. All rights reserved.
 *
 * The information contained within this document is confidential, copyrighted
 * and or a trade secret. No part of this document may be reproduced or
 * distributed in any form or by any means, in whole or in part, without the
 * prior written permission of Index Exchange.
 */

'use strict';

////////////////////////////////////////////////////////////////////////////////
// Dependencies ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
var Browser = require('browser.js');
var Classify = require('classify.js');
var Constants = require('constants.js');
var Partner = require('partner.js');
var Size = require('size.js');
var SpaceCamp = require('space-camp.js');
var System = require('system.js');
var Network = require('network.js');
var Utilities = require('utilities.js');
var ComplianceService;
var EventsService;
var RenderService;

//? if (DEBUG) {
var ConfigValidators = require('config-validators.js');
var PartnerSpecificValidator = require('improve-digital-htb-validator.js');
var Scribe = require('scribe.js');
var Whoopsie = require('whoopsie.js');
//? }

////////////////////////////////////////////////////////////////////////////////
// Main ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Partner module template
 *
 * @class
 */
function ImproveDigitalHtb(configs) {
    /* =====================================
     * Data
     * ---------------------------------- */

    /* Private
     * ---------------------------------- */

    /**
     * Reference to the partner base class.
     *
     * @private {object}
     */
    var __baseClass;

    /**
     * Profile for this partner.
     *
     * @private {object}
     */
    var __profile;

    /**
     * Instance of Improve Digital Ad Server JS Client
     *
     * @private {object}
     */
    var __adServerClient = new ImproveDigitalAdServerJSClient();

    /* =====================================
     * Functions
     * ---------------------------------- */

    /* Utilities
     * ---------------------------------- */

    /**
     * Generates the request URL and query data to the endpoint for the xSlots
     * in the given returnParcels.
     *
     * @param  {object[]} returnParcels
     *
     * @return {object}
     */
    function __generateRequestObj(returnParcels) {
        /* =============================================================================
         * STEP 2  | Generate Request URL
         * -----------------------------------------------------------------------------
         *
         * Generate the URL to request demand from the partner endpoint using the provided
         * returnParcels. The returnParcels is an array of objects each object containing
         * an .xSlotRef which is a reference to the xSlot object from the partner configuration.
         * Use this to retrieve the placements/xSlots you need to request for.
         *
         * If your partner is MRA, returnParcels will be an array of length one. If your
         * partner is SRA, it will contain any number of entities. In any event, the full
         * contents of the array should be able to fit into a single request and the
         * return value of this function should similarly represent a single request to the
         * endpoint.
         *
         * Return an object containing:
         * queryUrl: the url for the request
         * data: the query object containing a map of the query string paramaters
         *
         * callbackId:
         *
         * arbitrary id to match the request with the response in the callback function. If
         * your endpoint supports passing in an arbitrary ID and returning it as part of the response
         * please use the callbackType: Partner.CallbackTypes.ID and fill out the adResponseCallback.
         * Also please provide this adResponseCallback to your bid request here so that the JSONP
         * response calls it once it has completed.
         *
         * If your endpoint does not support passing in an ID, simply use
         * Partner.CallbackTypes.CALLBACK_NAME and the wrapper will take care of handling request
         * matching by generating unique callbacks for each request using the callbackId.
         *
         * If your endpoint is ajax only, please set the appropriate values in your profile for this,
         * i.e. Partner.CallbackTypes.NONE and Partner.Requesttypes.AJAX. You also do not need to provide
         * a callbackId in this case because there is no callback.
         *
         * The return object should look something like this:
         * {
         *     url: 'http://bidserver.com/api/bids' // base request url for a GET/POST request
         *     data: { // query string object that will be attached to the base url
         *        slots: [
         *             {
         *                 placementId: 54321,
         *                 sizes: [[300, 250]]
         *             },{
         *                 placementId: 12345,
         *                 sizes: [[300, 600]]
         *             },{
         *                 placementId: 654321,
         *                 sizes: [[728, 90]]
         *             }
         *         ],
         *         site: 'http://google.com'
         *     },
         *     callbackId: '_23sd2ij4i1' //unique id used for pairing requests and responses
         * }
         */

        /* ---------------------- PUT CODE HERE ------------------------------------ */
        var queryObj = {};
        var callbackId = System.generateUniqueId();

        var requestObject = {};

        if(returnParcels && returnParcels.length) {
            var requestParameters = {
                returnObjType: __adServerClient.CONSTANTS.RETURN_OBJ_TYPE.DEFAULT,
                libVersion: 'IX-' + __profile.version,
                requestId: callbackId,
                callback: 'window.' + SpaceCamp.NAMESPACE + '.' + __profile.namespace + '.adResponseCallback'
            };
            requestParameters.singleRequestMode = false;

            if (ComplianceService.isPrivacyEnabled()) {
              var gdpr = ComplianceService.gdpr.getConsent();
              if (gdpr && gdpr.applies && (gdpr.consentString || gdpr.consentString.length === 0)) {
                requestParameters.gdpr = gdpr.consentString;
              }
            }

            var protocol = Browser.getProtocol();
            requestParameters.secure = protocol === "https:" ? __adServerClient.CONSTANTS.HTTP_SECURITY.SECURE : __adServerClient.CONSTANTS.HTTP_SECURITY.STANDARD;
            var requestObject = [];
            for (var parcelCounter = 0; parcelCounter < returnParcels.length; parcelCounter++) {
                var parcel = returnParcels[parcelCounter];
                if (parcel) {
                    // The client needs an adUnitId.  The htSlot Id is guaranteed to be unique for the page
                    var xSlotCopy = JSON.parse(JSON.stringify(parcel.xSlotRef));
                    xSlotCopy.adUnitId = parcel.htSlot.getId();
                    xSlotCopy.id = parcel.requestId;
                    requestObject.push(xSlotCopy);
                }
            }
            var request = __adServerClient.createRequest(requestObject, requestParameters);
            if (request && request.requests && request.requests[0] && request.requests[0].url) {
                queryObj.url = request.requests[0].url;
                queryObj.callbackId = callbackId;
            }
        }
        return queryObj;
    }

    /* =============================================================================
     * STEP 3  | Response callback
     * -----------------------------------------------------------------------------
     *
     * This generator is only necessary if the partner's endpoint has the ability
     * to return an arbitrary ID that is sent to it. It should retrieve that ID from
     * the response and save the response to adResponseStore keyed by that ID.
     *
     * If the endpoint does not have an appropriate field for this, set the profile's
     * callback type to CallbackTypes.CALLBACK_NAME and omit this function.
     */
    function adResponseCallback(adResponse) {
        /* get callbackId from adResponse here */
        __baseClass._adResponseStore[adResponse.id] = adResponse;
    }
    /* -------------------------------------------------------------------------- */

    /* Helpers
     * ---------------------------------- */

    /* =============================================================================
     * STEP 5  | Rendering Pixel
     * -----------------------------------------------------------------------------
     *
    */

     /**
     * This function will render the pixel given.
     * @param  {string} pixelUrl Tracking pixel img url.
     */
    function __renderPixel(pixelUrl) {
        if (pixelUrl){
            Network.img({
                url: decodeURIComponent(pixelUrl),
                method: 'GET',
            });
        }
    }

    /**
     * Parses and extracts demand from adResponse according to the adapter and then attaches it
     * to the corresponding bid's returnParcel in the correct format using targeting keys.
     *
     * @param {string} sessionId The sessionId, used for stats and other events.
     *
     * @param {any} adResponse This is the bid response as returned from the bid request, that was either
     * passed to a JSONP callback or simply sent back via AJAX.
     *
     * @param {object[]} returnParcels The array of original parcels, SAME array that was passed to
     * generateRequestObj to signal which slots need demand. In this funciton, the demand needs to be
     * attached to each one of the objects for which the demand was originally requested for.
     */
    function __parseResponse(sessionId, adResponse, returnParcels) {

        /* =============================================================================
         * STEP 4  | Parse & store demand response
         * -----------------------------------------------------------------------------
         *
         * Fill the below variables with information about the bid from the partner, using
         * the adResponse variable that contains your module adResponse.
         */

        /* This an array of all the bids in your response that will be iterated over below. Each of
         * these will be mapped back to a returnParcel object using some criteria explained below.
         * The following variables will also be parsed and attached to that returnParcel object as
         * returned demand.
         *
         * Use the adResponse variable to extract your bid information and insert it into the
         * bids array. Each element in the bids array should represent a single bid and should
         * match up to a single element from the returnParcel array.
         *
         */

        /* ---------- Process adResponse and extract the bids into the bids array ------------*/
        for (var j = 0; j < returnParcels.length; j++) {

            var curReturnParcel = returnParcels[j];

            var headerStatsInfo = {};
            var htSlotId = curReturnParcel.htSlot.getId();
            headerStatsInfo[htSlotId] = {};
            headerStatsInfo[htSlotId][curReturnParcel.requestId] = [curReturnParcel.xSlotName];

            var curBid = null;
      
            if (adResponse && adResponse.bid && adResponse.bid[0]) {
              curBid = adResponse.bid[0];
            } else {
              if (__profile.enabledAnalytics.requestTime) {
                __baseClass._emitStatsEvent(sessionId, 'hs_slot_pass', headerStatsInfo);
              }
              curReturnParcel.pass = true;
              continue;
            }
            
            /* ---------- Fill the bid variables with data from the bid response here. ------------*/

            /* Using the above variable, curBid, extract various information about the bid and assign it to
             * these local variables */

            /* the bid price for the given slot */
            var bidPrice;
            var bidIsPass;
            if (typeof curBid.price === 'undefined' || curBid.price === 0) {
                bidPrice = 0;
                bidIsPass = true;
            } else {
                bidPrice = curBid.price;
                bidIsPass = false;
            }

            /* the size of the given slot */
            var bidSize = [curBid.w, curBid.h];

            /* OPTIONAL: tracking pixel url to be fired AFTER rendering a winning creative.
             * If firing a tracking pixel is not required or the pixel url is part of the adm,
             * leave empty;
             */
            var pixelUrl = '';
      
            var bidCreative = '';
            var bidDealId = null;
            if (curBid.adm) {
                var syncString = "";
                var syncArray = (curBid.sync && curBid.sync.length > 0)? curBid.sync : [];

                for (var syncCounter = 0; syncCounter < syncArray.length; syncCounter++) {
                    syncString += (syncString === "") ? "document.writeln(\"" : "";
                    var syncInd = syncArray[syncCounter];
                    syncInd = syncInd.replace(/\//g, '\\\/');
                    syncString += "<img src=\\\"" + syncInd + "\\\"\/>";
                }
                syncString += (syncString === "") ? "" : "\")";

                var nurl = "";
                if (curBid.nurl && curBid.nurl.length > 0) {
                    nurl = "<img src=\"" + curBid.nurl + "\" width=\"0\" height=\"0\" style=\"display:none\">";
                }
                bidCreative = nurl + "<script>" + curBid.adm + syncString + "</script>";
                bidDealId = curBid.pid.toString();
            } else {
                bidIsPass = true;
            }
      
            /* ---------------------------------------------------------------------------------------*/
      
            curReturnParcel.pass = bidIsPass;
            if (bidIsPass) {
                //? if (DEBUG) {
                Scribe.info(__profile.partnerId + ' returned pass for { id: ' + adResponse.id + ' }.');
                //? }
                if (__profile.enabledAnalytics.requestTime) {
                    __baseClass._emitStatsEvent(sessionId, 'hs_slot_pass', headerStatsInfo);
                }
                continue;
            }

            if (__profile.enabledAnalytics.requestTime) {
                __baseClass._emitStatsEvent(sessionId, 'hs_slot_bid', headerStatsInfo);
            }

            curReturnParcel.size = bidSize;
            curReturnParcel.targetingType = 'slot';
            curReturnParcel.targeting = {};

            var targetingCpm = '';

            //? if (FEATURES.GPT_LINE_ITEMS) {
            targetingCpm = __baseClass._bidTransformers.targeting.apply(bidPrice);
            var sizeKey = Size.arrayToString(curReturnParcel.size);

            if (bidDealId) {
                curReturnParcel.targeting[__baseClass._configs.targetingKeys.pmid] = [sizeKey + '_' + bidDealId];
                curReturnParcel.targeting[__baseClass._configs.targetingKeys.pm] = [sizeKey + '_' + targetingCpm];
            } else {
                curReturnParcel.targeting[__baseClass._configs.targetingKeys.om] = [sizeKey + '_' + targetingCpm];
            }
            curReturnParcel.targeting[__baseClass._configs.targetingKeys.id] = [curReturnParcel.requestId];
            //? }

            //? if (FEATURES.RETURN_CREATIVE) {
            curReturnParcel.adm = bidCreative;
            if (pixelUrl) {
                curReturnParcel.winNotice = __renderPixel.bind(null, pixelUrl);
            }
            //? }

            //? if (FEATURES.RETURN_PRICE) {
            curReturnParcel.price = Number(__baseClass._bidTransformers.price.apply(bidPrice));
            //? }

            var pubKitAdId = RenderService.registerAd({
                sessionId: sessionId,
                partnerId: __profile.partnerId,
                adm: bidCreative,
                requestId: curReturnParcel.requestId,
                size: curReturnParcel.size,
                price: targetingCpm,
                dealId: bidDealId || undefined,
                timeOfExpiry: __profile.features.demandExpiry.enabled ? (__profile.features.demandExpiry.value + System.now()) : 0,
                auxFn: __renderPixel,
                auxArgs: [pixelUrl]
            });

            //? if (FEATURES.INTERNAL_RENDER) {
            curReturnParcel.targeting.pubKitAdId = pubKitAdId;
            //? }
            if (curBid) {
                break;
            }
        }
    }

    /* =====================================
     * Constructors
     * ---------------------------------- */

    (function __constructor() {
        ComplianceService = SpaceCamp.services.ComplianceService;
        EventsService = SpaceCamp.services.EventsService;
        RenderService = SpaceCamp.services.RenderService;

        /* =============================================================================
         * STEP 1  | Partner Configuration
         * -----------------------------------------------------------------------------
         *
         * Please fill out the below partner profile according to the steps in the README doc.
         */

        /* ---------- Please fill out this partner profile according to your module ------------*/
        __profile = {
            partnerId: 'ImproveDigitalHtb', // PartnerName
            namespace: 'ImproveDigitalHtb', // Should be same as partnerName
            statsId: 'IMDI', // Unique partner identifier
            version: '2.1.1',
            targetingType: 'slot',
            enabledAnalytics: {
                requestTime: true
            },
            features: {
                demandExpiry: {
                    enabled: false,
                    value: 0
                },
                rateLimiting: {
                    enabled: false,
                    value: 0
                }
            },
            targetingKeys: { // Targeting keys for demand, should follow format ix_{statsId}_id
                id: 'ix_imdi_id',
                om: 'ix_imdi_cpm',
                pm: 'ix_imdi_cpm',
                pmid: 'ix_imdi_dealid'
            },
      bidUnitInCents: 100,
            lineItemType: Constants.LineItemTypes.ID_AND_PRICE,
            callbackType: Partner.CallbackTypes.ID, // Callback type, please refer to the readme for details
            architecture: Partner.Architectures.MRA, // Multi-request Architecture
            requestType: Partner.RequestTypes.JSONP // Use only JSONP for bid requests
        };
        /* ---------------------------------------------------------------------------------------*/

        //? if (DEBUG) {
        var results = ConfigValidators.partnerBaseConfig(configs) || PartnerSpecificValidator(configs);

        if (results) {
            throw Whoopsie('INVALID_CONFIG', results);
        }
        //? }

        __baseClass = Partner(__profile, configs, null, {
            parseResponse: __parseResponse,
            generateRequestObj: __generateRequestObj,
            adResponseCallback: adResponseCallback
        });
    })();

    /* =====================================
     * Public Interface
     * ---------------------------------- */

    var derivedClass = {
        /* Class Information
         * ---------------------------------- */

        //? if (DEBUG) {
        __type__: 'ImproveDigitalHtb',
        //? }

        //? if (TEST) {
        __baseClass: __baseClass,
        //? }

        /* Data
         * ---------------------------------- */

        //? if (TEST) {
        profile: __profile,
        //? }

        /* Functions
         * ---------------------------------- */

        //? if (TEST) {
        parseResponse: __parseResponse,
        generateRequestObj: __generateRequestObj,
        adResponseCallback: adResponseCallback,
        //? }
    };

    return Classify.derive(__baseClass, derivedClass);
}

////////////////////////////////////////////////////////////////////////////////
// Exports /////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

module.exports = ImproveDigitalHtb;

function ImproveDigitalAdServerJSClient(endPoint) {
  this.CONSTANTS = {
    HTTP_SECURITY: {
      STANDARD: 0,
      SECURE: 1
    },
    AD_SERVER_BASE_URL: 'ice.360yield.com',
    END_POINT: endPoint || 'hb',
    AD_SERVER_URL_PARAM: 'jsonp=',
    CLIENT_VERSION: 'JS-5.1.1',
    MAX_URL_LENGTH: 2083,
    ERROR_CODES: {
      MISSING_PLACEMENT_PARAMS: 2,
      LIB_VERSION_MISSING: 3
    },
    RETURN_OBJ_TYPE: {
      DEFAULT: 0,
      URL_PARAMS_SPLIT: 1
    }
  };

  this.getErrorReturn = function (errorCode) {
    return {
      idMappings: {},
      requests: {},
      'errorCode': errorCode
    };
  };

  this.createRequest = function (requestObject, requestParameters, extraRequestParameters) {
    if (!requestParameters.libVersion) {
      return this.getErrorReturn(this.CONSTANTS.ERROR_CODES.LIB_VERSION_MISSING);
    }

    requestParameters.returnObjType = requestParameters.returnObjType || this.CONSTANTS.RETURN_OBJ_TYPE.DEFAULT;

    var impressionObjects = [];
    var impressionObject = void 0;
    if (Utilities.isArray(requestObject)) {
      for (var counter = 0; counter < requestObject.length; counter++) {
        impressionObject = this.createImpressionObject(requestObject[counter]);
        impressionObjects.push(impressionObject);
      }
    } else {
      impressionObject = this.createImpressionObject(requestObject);
      impressionObjects.push(impressionObject);
    }

    var returnIdMappings = true;
    if (requestParameters.returnObjType === this.CONSTANTS.RETURN_OBJ_TYPE.URL_PARAMS_SPLIT) {
      returnIdMappings = false;
    }

    var returnObject = {};
    returnObject.requests = [];
    if (returnIdMappings) {
      returnObject.idMappings = [];
    }
    var errors = null;

    var baseUrl = (requestParameters.secure === 1 ? 'https' : 'http') + '://' + this.CONSTANTS.AD_SERVER_BASE_URL + '/' + this.CONSTANTS.END_POINT + '?' + this.CONSTANTS.AD_SERVER_URL_PARAM;

    var bidRequestObject = {
      bid_request: this.createBasicBidRequestObject(requestParameters, extraRequestParameters)
    };
    for (var _counter = 0; _counter < impressionObjects.length; _counter++) {
      impressionObject = impressionObjects[_counter];

      if (impressionObject.errorCode) {
        errors = errors || [];
        errors.push({
          errorCode: impressionObject.errorCode,
          adUnitId: impressionObject.adUnitId
        });
      } else {
        if (returnIdMappings) {
          returnObject.idMappings.push({
            adUnitId: impressionObject.adUnitId,
            id: impressionObject.impressionObject.id
          });
        }
        bidRequestObject.bid_request.imp = bidRequestObject.bid_request.imp || [];
        bidRequestObject.bid_request.imp.push(impressionObject.impressionObject);

        var writeLongRequest = false;
        var outputUri = baseUrl + encodeURIComponent(JSON.stringify(bidRequestObject));
        if (outputUri.length > this.CONSTANTS.MAX_URL_LENGTH) {
          writeLongRequest = true;
          if (bidRequestObject.bid_request.imp.length > 1) {
            // Pop the current request and process it again in the next iteration
            bidRequestObject.bid_request.imp.pop();
            if (returnIdMappings) {
              returnObject.idMappings.pop();
            }
            _counter--;
          }
        }

        if (writeLongRequest || !requestParameters.singleRequestMode || _counter === impressionObjects.length - 1) {
          returnObject.requests.push(this.formatRequest(requestParameters, bidRequestObject));
          bidRequestObject = {
            bid_request: this.createBasicBidRequestObject(requestParameters, extraRequestParameters)
          };
        }
      }
    }

    if (errors) {
      returnObject.errors = errors;
    }

    return returnObject;
  };

  this.formatRequest = function (requestParameters, bidRequestObject) {
    switch (requestParameters.returnObjType) {
      case this.CONSTANTS.RETURN_OBJ_TYPE.URL_PARAMS_SPLIT:
        return {
          method: 'GET',
          url: '//' + this.CONSTANTS.AD_SERVER_BASE_URL + '/' + this.CONSTANTS.END_POINT,
          data: '' + this.CONSTANTS.AD_SERVER_URL_PARAM + JSON.stringify(bidRequestObject)
        };
      default:
        var baseUrl = (requestParameters.secure === 1 ? 'https' : 'http') + '://' + (this.CONSTANTS.AD_SERVER_BASE_URL + '/') + (this.CONSTANTS.END_POINT + '?' + this.CONSTANTS.AD_SERVER_URL_PARAM);
        return {
          url: baseUrl + encodeURIComponent(JSON.stringify(bidRequestObject))
        };
    }
  };

  this.createBasicBidRequestObject = function (requestParameters, extraRequestParameters) {
    var impressionBidRequestObject = {};
    if (requestParameters.requestId) {
      impressionBidRequestObject.id = requestParameters.requestId;
    } else {
      impressionBidRequestObject.id = System.generateUniqueId();
    }
    if (requestParameters.domain) {
      impressionBidRequestObject.domain = requestParameters.domain;
    }
    if (requestParameters.page) {
      impressionBidRequestObject.page = requestParameters.page;
    }
    if (requestParameters.ref) {
      impressionBidRequestObject.ref = requestParameters.ref;
    }
    if (requestParameters.callback) {
      impressionBidRequestObject.callback = requestParameters.callback;
    }
    if ('secure' in requestParameters) {
      impressionBidRequestObject.secure = requestParameters.secure;
    }
    if (requestParameters.libVersion) {
      impressionBidRequestObject.version = requestParameters.libVersion + '-' + this.CONSTANTS.CLIENT_VERSION;
    }
    if (requestParameters.referrer) {
      impressionBidRequestObject.referrer = requestParameters.referrer;
    }
    if (requestParameters.gdpr || requestParameters.gdpr === 0) {
      impressionBidRequestObject.gdpr = requestParameters.gdpr;
    }
    if (extraRequestParameters) {
      for (var prop in extraRequestParameters) {
        impressionBidRequestObject[prop] = extraRequestParameters[prop];
      }
    }

    return impressionBidRequestObject;
  };

  this.createImpressionObject = function (placementObject) {
    var outputObject = {};
    var impressionObject = {};
    outputObject.impressionObject = impressionObject;

    if (placementObject.id) {
      impressionObject.id = placementObject.id;
    } else {
      impressionObject.id = System.generateUniqueId();
    }
    if (placementObject.adUnitId) {
      outputObject.adUnitId = placementObject.adUnitId;
    }
    if (placementObject.currency) {
      impressionObject.currency = placementObject.currency.toUpperCase();
    }
    if (placementObject.placementId) {
      impressionObject.pid = placementObject.placementId;
    }
    if (placementObject.publisherId) {
      impressionObject.pubid = placementObject.publisherId;
    }
    if (placementObject.placementKey) {
      impressionObject.pkey = placementObject.placementKey;
    }
    if (placementObject.transactionId) {
      impressionObject.tid = placementObject.transactionId;
    }
    if (placementObject.keyValues) {
      for (var key in placementObject.keyValues) {
        for (var valueCounter = 0; valueCounter < placementObject.keyValues[key].length; valueCounter++) {
          impressionObject.kvw = impressionObject.kvw || {};
          impressionObject.kvw[key] = impressionObject.kvw[key] || [];
          impressionObject.kvw[key].push(placementObject.keyValues[key][valueCounter]);
        }
      }
    }
    if (placementObject.size && placementObject.size.w && placementObject.size.h) {
      impressionObject.banner = {};
      impressionObject.banner.w = placementObject.size.w;
      impressionObject.banner.h = placementObject.size.h;
    } else {
      impressionObject.banner = {};
    }

    if (!impressionObject.pid && !impressionObject.pubid && !impressionObject.pkey && !(impressionObject.banner && impressionObject.banner.w && impressionObject.banner.h)) {
      outputObject.impressionObject = null;
      outputObject.errorCode = this.CONSTANTS.ERROR_CODES.MISSING_PLACEMENT_PARAMS;
    }
    return outputObject;
  };
}

exports.ImproveDigitalAdServerJSClient = ImproveDigitalAdServerJSClient;

