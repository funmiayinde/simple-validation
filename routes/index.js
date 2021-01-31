let express = require('express');
let router = express.Router();
let _ = require('lodash');

/* GET home page. */
router.get('/', function (req, res, next) {
    return res.status(200).json({
        message: "My Rule-Validation API",
        status: "success",
        data: {
            name: "Funmi Ayinde",
            github: "@funmiayinde",
            email: "funmiayinde11@gmail.com",
            mobile: "08086365224",
            twitter: "@funmite_kay"
        }
    });
});

router.post('/validate-rule', (req, res, next) => {
    // console.log('req-body:', req.body);
    const {rule, data} = req.body;
    console.log('data:', data);
    let response = {
        message: '',
        status: 'error',
        data: null
    };
    const conditions = (type, v1, v2, fieldName = '', data = null) => {
        console.log('type:', type);
        console.log('v1:', v1);
        console.log('v2:', v2);
        console.log('fieldName:', fieldName);
        switch (type) {
            case 'eq': {
                return (v1 === v2) ? true : `field ${fieldName} failed validation.`;
            }
            case 'neq': {
                return (v1 !== v2) ? true : `field ${fieldName} failed validation.`;
            }
            case 'gt': {
                return (v1 > v2) ? true : `field ${fieldName} failed validation.`;
            }
            case 'gte': {
                return (v1 >= v2) ? true : `field ${fieldName} failed validation.`;
            }
            case 'contains': {
                if (data[v1]) {
                    console.log('value:', data[v1]);
                    return true;
                } else {
                    `field ${fieldName} failed validation.`;
                }
            }
        }
    };

    if (_.isEmpty(rule)) {
        _.assign(response, {message: 'rule is required.'});
        return res.status(400).json(response);
    }

    if (_.isEmpty(data)) {
        _.assign(response, {message: 'data is required.'});
        return res.status(400).json(response);
    }
    const {field, condition, condition_value} = rule;
    console.log('condition:', condition);
    if (_.isEmpty(field)) {
        _.assign(response, {message: 'field is required.'});
        return res.status(400).json(response);
    }

    if (_.isEmpty(condition) || _.isNull(condition)) {
        _.assign(response, {message: 'condition is required.'});
        return res.status(400).json(response);
    }

    if (_.isNull(condition_value)) {
        if (_.isEmpty(condition_value)) {
            _.assign(response, {message: 'condition value is required.'});
            return res.status(400).json(response);
        }
        _.assign(response, {message: 'condition value is required.'});
        return res.status(400).json(response);
    }

    if (!_.isString(field)) {
        _.assign(response, {message: 'field value should be a string.'});
        return res.status(400).json(response);
    }

    let nestedKey;
    let nestedValue;
    if (field.indexOf('.') !== -1) {
        nestedKey = field.split('.')[1];
        if (nestedKey) {
            if (typeof data === 'object') {
                nestedValue = _.pick(data[field.split('.')[0]], [nestedKey]);
                if (_.isEmpty(nestedValue)) {
                    _.assign(response, {message: `field ${nestedKey} is missing from data.`});
                    return res.status(400).json(response);
                }
            }
        }
    } else {
        nestedKey = field;
        if (typeof data === 'object') {
            nestedValue = _.pick(data, [field]);
            if (_.isEmpty(nestedValue)) {
                _.assign(response, {message: `field ${nestedKey} is missing from data.`});
                return res.status(400).json(response);
            }
        }
    }
    let actualValue;
    if (typeof data === 'string') {
        const fieldValue = field.indexOf('.') !== -1 ? field.split('.')[1] : field;
        actualValue = data.split('')[_.isString(fieldValue) ? parseInt(fieldValue) : fieldValue];
    } else {
        actualValue = field.indexOf('.') !== -1 ? nestedValue[field.split('.')[1]] : nestedValue[field];
    }
    const conditionResult = conditions(condition, actualValue, condition_value, nestedKey, data);
    if (typeof conditionResult === 'string') {
        const data = {
            validation: {
                error: true,
                field,
                field_value: actualValue,
                condition,
                condition_value
            }
        };
        _.assign(response, {message: `${conditionResult}`, data});
        return res.status(400).json(response);
    }
    const responseData = {
        validation: {
            error: false,
            field,
            field_value: actualValue,
            condition,
            condition_value
        }
    };
    _.assign(response, {message: `field ${field} successfully validated.`, data: responseData});
    return res.status(200).json(response);
});
module.exports = router;
