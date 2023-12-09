export interface SingleTranslateResponseSentence {
    backend: number;
    orig: string;
    trans?: string;
    src_translit?: string;
}

export interface SingleTranslateResponseDictEntry {
    word: string;
    reverse_translation: string[];
    score?: number;
}

export interface SingleTranslateResponseDictEntries {
    entry: SingleTranslateResponseDictEntry[];
    pos: string;
    pos_enum: number;
    base_form: string;
    terms: string[];
}

export interface SingleTranslateResponseAlternativeTranslation {
    word_postproc: string;
    score: number;
    has_preceding_space: boolean;
    attach_to_next_token: boolean;
    backends: number[];
}

export interface SingleTranslateResponseLdResult {
    srclangs: string[];
    srclangs_confidences: number[];
    extended_srclangs: string[];
}

export interface SingleTranslateResponse {
    sentences?: SingleTranslateResponseSentence[];
    dict?: SingleTranslateResponseDictEntries[];
    alternative_translations?: object[];
    src?: string;
    spell?: object;
    ld_result?: SingleTranslateResponseLdResult;
}

/*
e.g.
{
    "sentences": [
        {
            "trans": "world",
            "orig": "duniya",
            "backend": 2
        }
    ],
    "src": "ha",
    "alternative_translations": [
        {
            "src_phrase": "duniya",
            "alternative": [
                {
                    "word_postproc": "world",
                    "score": 1000,
                    "has_preceding_space": true,
                    "attach_to_next_token": false,
                    "backends": [
                        2,
                        8
                    ]
                },
                {
                    "word_postproc": "earth",
                    "score": 1000,
                    "has_preceding_space": true,
                    "attach_to_next_token": false,
                    "backends": [
                        2
                    ]
                },
                {
                    "word_postproc": "globe",
                    "score": 1000,
                    "has_preceding_space": true,
                    "attach_to_next_token": false,
                    "backends": [
                        2
                    ]
                },
                {
                    "word_postproc": "the world",
                    "score": 0,
                    "has_preceding_space": true,
                    "attach_to_next_token": false,
                    "backends": [
                        3
                    ],
                    "backend_infos": [
                        {
                            "backend": 3
                        }
                    ]
                }
            ],
            "srcunicodeoffsets": [
                {
                    "begin": 0,
                    "end": 6
                }
            ],
            "raw_src_segment": "duniya",
            "start_pos": 0,
            "end_pos": 0
        }
    ],
    "spell": {}
}

{
    "src": "el",
    "confidence": 1.0,
    "spell": {},
    "ld_result": {
        "srclangs": [
            "el"
        ],
        "srclangs_confidences": [
            1.0
        ],
        "extended_srclangs": [
            "el"
        ]
    }
}
*/