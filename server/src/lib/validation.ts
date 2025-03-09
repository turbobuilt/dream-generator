// Copyright Hans Truelson, licensed under the MIT License
import xss, { IFilterXSSOptions } from "xss";
import moment, { max } from "moment";
import { maxChars } from "./db";


export enum ValidatorType {
    guid="guid",
    text="text",
    datetime="datetime",
    number="number",
    dollar="dollar",
    string="string",
    json="json",
    bool="bool",
    stringArray="stringArray",
    boolMap="boolMap",
    relatedObjectArray="relatedObjectArray",
}

export const propertyInfo = {} as {
    [className: string] : {
        properties: {
            [propertyName: string] : {
                [key: string]: any,
                type: ValidatorType,
                options: {
                    [propertyName: string]: any
                },
                validationFn: (value, options) => {valid: boolean, value?: any, error?: string, errorCode?: string},
            }
        }
    }
};



// // this is only needed if no new properties are on the thing
// export function model(){
//     // console.log("the thing is", ...arguments);
// }

export function validate(tableName: string, object: any) {
    var data = {};
    var info = propertyInfo[snakeToPascal(tableName)];
    if(!info) {
        throw new Error("Error - " + tableName + " has not been registered with the program. You need to make sure the file gets imported for something other than just type info or it won't work right.");
    }
    var validator = info.properties;
    for(var key in object) {
        // convert key to camel case
        let camelKey = key.replace(/_./g, (str) => str[1].toUpperCase());
        if(!validator[camelKey] || validator[camelKey].type === ValidatorType.relatedObjectArray)
            continue;
        var validationStatus = validator[camelKey].validationFn(object[camelKey], validator[camelKey].options);
        if(!validationStatus.valid) {
            throw { error: "property <b>" + toNiceCase(camelKey) + "</b> is invalid: " + validationStatus.error + " value: " + object[camelKey], errorCode: validationStatus.errorCode }
        }
        data[toSnake(camelKey)] = validationStatus.value;
        // delete object[camelKey];
    }
    // object.data = data;
    return {
        guid: object.guid,
        ...data,
        created: object.created,
        updated: object.updated,
        createdBy: object.createdBy,
        updatedBy: object.updatedBy
    };
}

function toNiceCase(str){
    if(!str)
        return str;
    return str.replace(/[A-Z]/g, str => " " + str).replace(/^[a-z]/, str => str.toUpperCase());
}

interface DateTimeOptions {
    
}

interface RelatedObjectArrayOptions {

}
export function setRelatedObjectArrayValue<T extends abstract new (...args: any) => any>(classType: T, defaultValue: any) {
    return defaultValue as InstanceType<T>[];
}
export function relatedObjectArray<T>(options: RelatedObjectArrayOptions = {}) {
    return (target: T, propertyName: string, descriptor?: TypedPropertyDescriptor<T>): any => {
        if(!propertyInfo[target.constructor.name])
            propertyInfo[target.constructor.name] = { 
                properties: { }
            };
        var validator = propertyInfo[target.constructor.name];
        validator.properties[propertyName] = {
            type: ValidatorType.relatedObjectArray,
            options: options,
            validationFn: val => val
        };
    }
}

function dateTimeValidator(value, options: NumberOptions) {
    if(value === null || value === undefined)
        return { valid: true, value }
    if(typeof value !== "string")
        return { valid: false, error: "the given value is not a string.  Datetime values must be a STRING value", code: "NOT_STRING"}
    
    // convert dates to proper format
    if(value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) {
        return { valid: true, value: moment(value).utc().format("YYYY-MM-DD HH:mm:ss")}
    }

    if(!value.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        return { valid: false, error: "the given value is not in the correct format.  It must be formatted like this: 'YYYY-MM-DD HH:mm:ss'", code: "INVALID_DATE_FORMAT"}
    }
    return { valid: true, value: value }
}
export function dateTime<T>(options: DateTimeOptions = {}): any  {
    return (target: any, propertyName: string, descriptor?: TypedPropertyDescriptor<T>): any => {
        if(!propertyInfo[target.constructor.name])
            propertyInfo[target.constructor.name] = { 
                properties: { }
            };
        var validator = propertyInfo[target.constructor.name];
        validator.properties[propertyName] = {
            type: ValidatorType.datetime,
            options: options,
            validationFn: dateTimeValidator
        };
    }
}

interface NumberOptions {
    minValue?: number
}
function numberValidator(value, options: NumberOptions) {
    if(value === null || value === undefined)
        return { valid: true, value }
    if(value === "")
        return { valid: true, value: null }
    if(typeof value !== 'number')
        return { valid: false, error: "the given value is not a number. Value: " + JSON.stringify(value), code: "NOT_NUMBER"}
    return { valid: true, value: value }
}
export function number<T>(options: TextOptions = {}): any  {
    return (target: any, propertyName: string, descriptor?: TypedPropertyDescriptor<T>): any => {
        if(!propertyInfo[target.constructor.name])
            propertyInfo[target.constructor.name] = { 
                properties: { }
            };
        var validator = propertyInfo[target.constructor.name];
        validator.properties[propertyName] = {
            type: ValidatorType.number,
            options: options,
            validationFn: numberValidator
        };
    }
}


interface DollarOptions {
    minValue?: number
}
function dollarValidator(value, options: DollarOptions) {
    if(value === null || value === undefined)
        return { valid: true, value }
    if(value === "")
        return { valid: true, value: null }
    if(typeof value !== 'number')
        return { valid: false, error: "the given value is not a number. Value: " + JSON.stringify(value), code: "NOT_NUMBER"}
    return { valid: true, value: Math.round(value*100) }
}
export function dollar<T>(options: TextOptions = {}): any  {
    return (target: any, propertyName: string, descriptor?: TypedPropertyDescriptor<T>): any => {
        if(!propertyInfo[target.constructor.name])
            propertyInfo[target.constructor.name] = { 
                properties: { }
            };
        var validator = propertyInfo[target.constructor.name];
        validator.properties[propertyName] = {
            type: ValidatorType.dollar,
            options: options,
            validationFn: dollarValidator
        };
    }
}

interface TextOptions {
    maxLength?: number,
    allowHtml?: boolean,
    xssFilterOptions?: IFilterXSSOptions,
    trimWhitespace?: boolean
}
function textValidator(value, options: TextOptions) {
    if(value !== null && value !== undefined && typeof value !== "string")
        return { valid: false, error: "the given value is not a string", code: "NOT_STRING" }
    if(value && value.length > options.maxLength)
        return { valid: false, error: "the given value is too long.  This field is limited to " + options.maxLength + " characters and the value you gave had " + value.length + " characters", code: "STRING_TOO_LONG" }
    if(value == null || value == undefined)
        return { valid: true, value: null }
    if(!options.allowHtml)
        value = (xss as any)(value, options.xssFilterOptions);
    if(options.trimWhitespace)
        value = value.trim();
    return { valid: true, value: value };
}
export function text<T>(maxLength: number, options: TextOptions = {}): any  {
    return (target: any, propertyName: string, descriptor?: TypedPropertyDescriptor<T>): any => {
        if(!propertyInfo[target.constructor.name])
            propertyInfo[target.constructor.name] = { 
                properties: { }
            };
        options.maxLength = maxLength;
        var validator = propertyInfo[target.constructor.name];
        validator.properties[propertyName] = {
            type: ValidatorType.text,
            options: options,
            validationFn: textValidator
        };
    }
}


interface GuidOptions {
    required?: boolean
    length?: number
}
function guidValidator(value, options: GuidOptions) {
    if(value === null || value === undefined)
        if(options.required)
            return { valid: false, error: `a value is required, but was not provided` }
        else
            return { valid: true, value };
            console.log(options.length, "maxchars", maxChars)
    let length = options.length || maxChars;
    if(typeof value === 'string') {
        if(value.length == length)
            return { valid: true, value };
        else if(value.slice(0,2).toLowerCase() === "0x" && value.length !== length*2 + 2)
            return { valid: false, error: `the given guid is a hexadecimal guid but is not ${length*2 + 2} characters in length` }
        else
            return { valid: false, error: `the given guid is not a ${length} string, nor is it a ${length*2 + 2} hexadecimal string that starts with 0x` }
    }
    else if (Buffer.isBuffer(value))
        if ((value as Buffer).length === maxChars*8)
            return { valid: true, value };
        else
            return { valid: false, error: `the given buffer is not ${maxChars*8} bytes long`, code: "WRONG_BUFFER_LENGTH"}
    else 
        return { valid: false, error: "the given value is not a string or a buffer", code: "NOT_STRING_OR_BUFFER" }
    
    return {valid: true, value: value};
}
export function guid<T>(length?, options: GuidOptions = {}): any  {
    if(length)
        options.length = length || maxChars;
    return (target: any, propertyName: string, descriptor?: TypedPropertyDescriptor<T>): any => {
        if(!propertyInfo[target.constructor.name])
            propertyInfo[target.constructor.name] = { 
                properties: { }
            };
        var validator = propertyInfo[target.constructor.name];
        validator.properties[propertyName] = {
            type: ValidatorType.guid,
            options: options,
            validationFn: guidValidator
        };
    }
}

interface JsonOptions {
    
}
function jsonValidator(value, options: JsonOptions) {
    if(value === null || value === undefined)
        return { valid: true, value };
    return {valid: true, value: value};
}
export function json<T>(options: JsonOptions = {}): any  {
    return (target: any, propertyName: string, descriptor?: TypedPropertyDescriptor<T>): any => {
        if(!propertyInfo[target.constructor.name])
            propertyInfo[target.constructor.name] = { 
                properties: { }
            };
        var validator = propertyInfo[target.constructor.name];
        validator.properties[propertyName] = {
            type: ValidatorType.json,
            options: options,
            validationFn: jsonValidator
        };
    }
}



interface BoolOptions {
    
}
function boolValidator(value) {
    if(value === null || value === undefined)
        return { valid: true, value };
    if(value === "true" || value === 1 || value === true)
        return { valid: true, value: 1 }
    else if(value === "false" || value === 0 || value === false)
        return { valid: true, value: 0 }
    
    return { valid: false, error: "A boolean value must be either 'true' | true | 1 | 'false' | false | 0 | null | undefined", code: "NOT_BOOLEAN" };
}
export function bool<T>(options: BoolOptions = {}): any  {
    return (target: any, propertyName: string, descriptor?: TypedPropertyDescriptor<T>): any => {
        if(!propertyInfo[target.constructor.name])
            propertyInfo[target.constructor.name] = { 
                properties: { }
            };
        var validator = propertyInfo[target.constructor.name];
        validator.properties[propertyName] = {
            type: ValidatorType.bool,
            options: options,
            validationFn: boolValidator
        };
    }
}


interface StringArrayOptions {
    maxLength?: number,
    xssFilterOptions?: any
}
function stringArrayValidator(value, options: StringArrayOptions) {
    if(value === null || value === undefined)
        return { valid: true, value }
    if(!Array.isArray(value))
        return { valid: false, error: "the given value is not an array", code: "NOT_ARRAY" }
    for(var i = 0; i < value.length; ++i) {
        if(value[i] !== null && value[i] !== undefined && typeof value[i] !== "string") {
            return { valid: false, error: "Object at index " + (i) + " is not a string", code: "NOT_STRING" };
        }
        if(value[i].length > options.maxLength) {
            return { valid: false, error: "the given value at index " + i + " is too long.  This field is limited to " + options.maxLength + " characters and the value you gave had " + value.length + " characters", code: "STRING_TOO_LONG" }
        }
        value[i] = (xss as any)(value[i], options.xssFilterOptions);
    }
    return { valid: true, value };
}
export function stringArray<T>(maxLength: number, options: StringArrayOptions = {}): any  {
    return (target: any, propertyName: string, descriptor?: TypedPropertyDescriptor<T>): any => {
        if(!propertyInfo[target.constructor.name])
            propertyInfo[target.constructor.name] = { 
                properties: { }
            };
        options.maxLength = maxLength
        var validator = propertyInfo[target.constructor.name];
        validator.properties[propertyName] = {
            type: ValidatorType.stringArray,
            options: options,
            validationFn: stringArrayValidator
        };
    }
}

interface BoolMapOptions {
    allowedKeys?: string[],
    allowedKeysMap?: any,
    required?: boolean
}
function boolMapValidator(value, options: BoolMapOptions) {
    if(value === null || value === undefined) {
        if(!options.required)
            return { valid: true, value }
        else
            return { valid: false, error: "The value is required, but no value was given.", code: "REQUIRED_FIELD_EMPTY" }
    }
    if(typeof value !== "object" || Array.isArray(Object))
        return { valid: false, error: "The given value is not an object", code: "NOT_OBJECT" }
    for(var key in value) {
        if(value[key] !== null && value[key] !== undefined && typeof value[key] !== "boolean") {
            return { valid: false, error: "Object with key " + (key) + " is not a boolean", code: "NOT_BOOLEAN" };
        }
    }
    if(options.allowedKeys || options.allowedKeysMap) {
        for(var key in value) {
            if(!options.allowedKeysMap[key]) {
                return { valid: false, error: "Object has an invalid key that is not in the list of allowed keys: " + key, code: "KEY_NOT_ALLOWED" };
            }
        }
    }
    return { valid: true, value };
}
export function boolMap<T>(options: BoolMapOptions = {}): any  {
    return (target: any, propertyName: string, descriptor?: TypedPropertyDescriptor<T>): any => {
        if(!propertyInfo[target.constructor.name])
            propertyInfo[target.constructor.name] = { 
                properties: { }
            };
        var validator = propertyInfo[target.constructor.name];
        if(options.allowedKeys) {
            options.allowedKeysMap = {} as any;
            for(let key of options.allowedKeys)
                options.allowedKeysMap[key] = true;
        }
        validator.properties[propertyName] = {
            type: ValidatorType.boolMap,
            options: options,
            validationFn: boolMapValidator,
        };
    }
}


function toSnake(str){
    return str.replace(/[A-Z]/g, s => "_" + s.toLowerCase())
}
function toCamel(str) {
    return str.replace(/_[a-z]/g, s => s.slice(1).toUpperCase())
}
function snakeToPascal(name: string) {
    var first = name.slice(0,1).toUpperCase();
    return first + name.slice(1).replace(/_[a-z]/g, val => val.slice(1).toUpperCase());
}

