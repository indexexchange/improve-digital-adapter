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

var Inspector = require('../../../libs/external/schema-inspector.js');

var custom = {
    impliesPresence: function (schema, candidate) {
        var implication = schema.$impliesPresence;
        var impliedIf = implication.if;
        var impliedThen = implication.then;
        if (candidate[impliedIf] && typeof candidate[impliedThen] === 'undefined') {
            this.report('if ' + impliedIf + 'exists then ' + impliedThen + ' must also exist');
        }
    }
};
Inspector.Validation.extend(custom);
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> Add validator for inclusion of placementKey or placementId

custom = {
    mustIncludeOneOnly: function (schema, candidate) {
        var mustIncludeOneOnly = schema.$mustIncludeOneOnly.params;
        var occurrenceCounter = 0;
        for (var index = 0; index < mustIncludeOneOnly.length; index++) {
            if (candidate[mustIncludeOneOnly[index]]) {
                occurrenceCounter++;
            }
        }
        if (occurrenceCounter != 1) {
            this.report('One and only one of the following must be present: ' + JSON.stringify(mustIncludeOneOnly));
        }
    }
};
Inspector.Validation.extend(custom);

<<<<<<< HEAD
=======
>>>>>>> Add check for presence of publisherId if placementKey is used
=======
>>>>>>> Add validator for inclusion of placementKey or placementId
////////////////////////////////////////////////////////////////////////////////
// Main ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


/* =============================================================================
 * STEP 0 | Config Validation
 * -----------------------------------------------------------------------------
 * This file contains the necessary validation for the partner configuration.
 * This validation will be performed on the partner specific configuration object
 * that is passed into the wrapper. The wrapper uses an outside library called
 * schema-insepctor to perform the validation. Information about it can be found here:
 * https://atinux.fr/schema-inspector/.
 */
var partnerValidator = function (configs) {
    var result = Inspector.validate({
        type: 'object',
        properties: {
            xSlots: {
                type: 'object',
                properties: {
                    '*': {
                        type: 'object',
                        someKeys: ['placementId', 'placementKey'],
                        $impliesPresence : {
                            if: "placementKey",
                            then: "publisherId"
                        },
<<<<<<< HEAD
<<<<<<< HEAD
                        $mustIncludeOneOnly : {
                            params: ["placementId", "placementKey"]
                        },
=======
>>>>>>> Add check for presence of publisherId if placementKey is used
=======
                        $mustIncludeOneOnly : {
                            perams: ["placementId", "placementKey"]
                        },
>>>>>>> Add validator for inclusion of placementKey or placementId
                        properties: {
                            currency: {
                                type: 'string',
                                optional: true,
                                pattern: /^USD|EUR|GBP|AUD|DKK|SEK|CZK|CHF|NOK$/
                            },
                            placementId: {
                                type: 'number',
                                optional: true
                            },
                            size:{
                                type: 'object',
                                optional: true,
                                properties: {
                                    w: {
                                        type: 'number'
                                    },
                                    h: {
                                        type: 'number'
                                    }
                                }
                            },
                            publisherId: {
                                type: 'number',
                                minLength: 1,
                                optional: true
                            },
                            placementKey: {
                                type: 'string',
                                minLength: 1,
                                optional: true
                            },
                            keyValues: {
                                type: 'object',
                                optional: true,
                                properties:{
                                    '*': {
                                        type: 'array',
                                        items: { type: 'string'}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }, configs);

    if (!result.valid) {
        return result.format();
    }

    return null;
};

module.exports = partnerValidator;
