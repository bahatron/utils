import jsonschema, { Schema } from "jsonschema";

const validator = new jsonschema.Validator();

/** @todo format errors like this */
// [
//     {
//         "loc": ["body", "dob"],
//         "msg": "invalid date format",
//         "type": "value_error.date"
//     },
//     {
//         "loc": ["body", "lived_abroad"],
//         "msg": "field required",
//         "type": "value_error.missing"
//     },
//     {
//         "loc": ["body", "employment", 0, "income_source"],
//         "msg": "value is not a valid enumeration member; permitted: 'Full Time Employed', 'Part Time Employed', 'Self Employed', 'Temporarily Employed', 'Student', 'Pension', 'Disability', 'Unemployed', 'Homemaker', 'Long Term Benefits', 'Other'",
//         "type": "type_error.enum",
//         "ctx": {
//             "enum_values": [
//                 "Full Time Employed",
//                 "Part Time Employed",
//                 "Self Employed",
//                 "Temporarily Employed",
//                 "Student",
//                 "Pension",
//                 "Disability",
//                 "Unemployed",
//                 "Homemaker",
//                 "Long Term Benefits",
//                 "Other"
//             ]
//         }
//     }
// ]

export function json(val: any, schema: Schema): string[] {
    let result = validator.validate(val, schema);

    return result.errors.map((err) => err.toString().replace(`instance.`, ""));
}
