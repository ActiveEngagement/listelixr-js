import { CSSAttribute, css as api } from 'goober';
import { Ref, computed, ref } from './signal';

export type Theme = {
    css: Ref<CSSAttribute>,
    className: Ref<string>,
    merge: (...args: CSSAttribute[]) => void
}

function mergeCSSAttributes(target: CSSAttribute, source: CSSAttribute): CSSAttribute {
    for(const key in source) {
        if(typeof source[key] === 'object' && typeof target[key] === 'object') {
            target[key] = mergeCSSAttributes(
                target[key] as CSSAttribute,
                source[key] as CSSAttribute
            );
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

export function theme(props: CSSAttribute): Theme {
    const css = ref(props);

    const className = computed(() => {
        return api(css.value);
    });

    function merge(...args: CSSAttribute[]) {
        for(const arg of args) {
            css.value = mergeCSSAttributes(css.value, arg);
        }
    }

    return {
        css,
        className,
        merge
    };
}

export const base = theme({
    '*, ::before, ::after': {
        boxSizing: 'border-box'
    },

    'hr': {
        height: '0', color: 'inherit'
    },

    'abbr[title]': {
        textDecoration: 'underline dotted'
    },

    'b, strong': {
        fontWeight: 'bolder'
    },

    'code, kbd, samp, pre': {
        fontFamily: "ui-monospace, \t\tSFMono-Regular, \t\tConsolas, \t\t'Liberation Mono', \t\tMenlo, \t\tmonospace",
        fontSize: '1em'
    },

    'small': {
        fontSize: '80%'
    },

    'sub, sup': {
        fontSize: '75%',
        lineHeight: 0,
        position: 'relative',
        verticalAlign: 'baseline'
    },

    'sub': {
        bottom: '-0.25em'
    },

    'sup': {
        top: '-0.5em'
    },

    'table': {
        textIndent: '0', borderColor: 'inherit'
    },

    'button, input, optgroup, select, textarea': {
        fontFamily: 'inherit',
        fontSize: '100%',
        lineHeight: 1.15,
        margin: '0'
    },

    'button, select': {
        textTransform: 'none'
    },

    "button, [type='button'], [type='reset'], [type='submit']": {
        WebkitAppearance: 'button'
    },

    '::-moz-focus-inner': {
        borderStyle: 'none', padding: '0'
    },

    ':-moz-focusring': {
        outline: '1px dotted ButtonText'
    },

    ':-moz-ui-invalid': {
        boxShadow: 'none'
    },

    'legend': {
        padding: '0'
    },

    'progress': {
        verticalAlign: 'baseline'
    },

    '::-webkit-inner-spin-button, ::-webkit-outer-spin-button': {
        height: 'auto'
    },

    "[type='search']": {
        WebkitAppearance: 'textfield', outlineOffset: '-2px'
    },

    '::-webkit-search-decoration': {
        WebkitAppearance: 'none'
    },

    '::-webkit-file-upload-button': {
        WebkitAppearance: 'button',
        font: 'inherit'
    },

    'summary': {
        display: 'list-item'
    }
});

export const defaultTheme = theme({
    ...base.css.value,

    fontFamily: 'system-ui, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif, \'Apple Color Emoji\', \'Segoe UI Emoji\'',
    lineHeight: 1.15,
    '-webkit-text-size-adjust': '100%',
    '-moz-tab-size': 4,
    tabSize: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: '.75rem',

    '.form-field': {
        display: 'flex',
        flexDirection: 'column',
        gap: '.25rem',

        '&.has-errors': {
            '.form-label': {
                color: '#dc2626',
            },
            '.form-control': {
                borderColor: '#dc2626',

                '&:focus': {
                    boxShadow: '0px 0px 0px 3px rgb(220, 38, 38, .5)'
                }
            }
        }

    },

    '.field-error': {
        fontSize: '.85rem',
        color: '#dc2626'
    },

    '.form-label': {
        display: 'block',
        fontSize: '.9rem',
        color: '#27272a',
    },

    '.form-control': {
        border: '1px solid #e0e0e0',
        display: 'block',
        width: '100%',
        padding: '.25rem .5rem',
        borderRadius: '.25rem',
        outline: 'none',
        fontSize: '1rem',
        lineHeight: '1.5rem',
        color: '#27272a',

        '&:focus': {
            borderColor: '#3b82f6',
            boxShadow: '0px 0px 0px 3px rgb(30, 78, 216, .5)'
        }
    },

    'select.form-control': {
        padding: '.25rem',
    },

    'button': {
        background: '#2563eb',
        padding: '.5rem .25rem',
        border: 'none',
        borderStyle: 'none',
        color: 'white',
        borderRadius: '.25rem',
        cursor: 'pointer',
        outline: 'none',
        fontSize: '1.05rem',
        lineHeight: '1.25rem',

        '&:active': {
            background: '#1d4ed8'
        },

        '&:focus': {
            boxShadow: '0px 0px 0px 3px rgb(30, 78, 216, .5)',
        }
    }
});
