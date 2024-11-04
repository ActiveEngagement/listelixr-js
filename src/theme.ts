import { css as api, type CSSAttribute } from 'goober';
import { createSignal } from 'solid-js';

export type Theme = {
    className: () => string;
    css: () => CSSAttribute;
    merge: (...args: CSSAttribute[]) => Theme;
    extend: (...args: CSSAttribute[]) => Theme;
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
export function theme(attrs: CSSAttribute): Theme {
    const [ css, setCss ] = createSignal<CSSAttribute>(attrs);

    function className() {
        return api(css());
    }

    function merge(...attrs: CSSAttribute[]) {
        const target = JSON.parse(JSON.stringify(css()));

        for(const attr of attrs) {
            mergeCSSAttributes(target, attr);
        }

        setCss(target);
        // setClassName(api(css()));

        return {
            className,
            css,
            merge,
            extend
        };
    }

    function extend(...attrs: CSSAttribute[]) {
        const target = JSON.parse(JSON.stringify(css()));

        for(const attr of attrs) {
            mergeCSSAttributes(target, attr);
        }

        return theme(target);
    }

    return {
        className,
        css,
        merge,
        extend
    };
}

export const base = theme({
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',

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

export const defaultTheme = base.extend({
    '@keyframes animloader': {
        '0%': {
            transform: 'scale(0)',
            opacity: '1'
        },
        '100%': {
            transform: 'scale(1)',
            opacity: '0'
        }
    },

    'form, &': {
        lineHeight: 1.15,
        '-webkit-text-size-adjust': '100%',
        '-moz-tab-size': 4,
        tabSize: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    
    '.activity-indicator': {
        width: '48px',
        height: '48px',
        background: 'gray',
        display: 'inline-block',
        borderRadius: '50%',
        boxSizing: 'border-box',
        animation: 'animloader 1s ease-in infinite',

        '& .activity-indicator-label': {
            display: 'none'
        }
    },

    '.form-error-message': {
        display: 'flex',
        flexDirection: 'column',
        gap: '.5rem',
        backgroundColor: '#dc262615',
        borderLeft: '.333rem #dc2626 solid',
        padding: '.666rem 1rem',
    },
    
    '.form-success-message': {
        display: 'flex',
        flexDirection: 'column',
        gap: '.5rem',
        backgroundColor: '#05966915',
        borderLeft: '.333rem #059669 solid',
        padding: '.666rem 1rem',
    },

    '.form-heading': {
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },

    '.form-fields': {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },

    '.form-field-group': {
        display: 'flex',
        flexDirection: 'column',
        gap: '.25rem'
    },

    '.form-field': {
        display: 'flex',
        flexDirection: 'column',
        gap: '.25rem',

        '&.has-errors': {
            '.form-label': {
                color: '#dc2626',
            },

            '.form-control': {
                color: '#dc2626',
                borderColor: '#dc2626',

                '&:focus': {
                    boxShadow: '0px 0px 0px 3px rgb(220, 38, 38, .5)'
                },

                '&[type=checkbox],&[type=radio]': {
                    borderColor: '#dc2626',

                    '&:checked': {
                        backgroundColor: '#dc2626'
                    }
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

        '&:has([type="checkbox"],[type="radio"])': {
            display: 'flex',
            alignItems: 'center',
            gap: '.25rem',
        }
    },

    '.form-control': {
        border: '1px solid #e0e0e0',
        padding: '.25rem .5rem',
        borderRadius: '.25rem',
        outline: 'none',
        fontSize: '1rem',
        lineHeight: '1.5rem',
        color: '#27272a',

        '&[type=checkbox], &[type=radio]': {
            display: 'inline-flex',
            appearance: 'none',
            height: '1rem',
            width: '1rem',
            padding: '0',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'contain',

            '&:checked': {
                borderColor: '#3b82f6',
                backgroundColor: '#3b82f6',
            }
        },

        '&[type=checkbox]:checked': {
            backgroundImage: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\'><path fill=\'none\' stroke=\'white\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'3\' d=\'M6 10l3 3l6-6\'/></svg>")'
        },

        '&[type=radio]': {
            borderRadius: '100%',

            '&:checked': {
                backgroundImage: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'-4 -4 8 8\'><circle r=\'2\' fill=\'white\'/></svg>")'
            },
        },

        '&:focus': {
            borderColor: '#3b82f6',
            boxShadow: '0px 0px 0px 3px rgb(30, 78, 216, .5)'
        }
    },

    'select.form-control': {
        padding: '.25rem',
    },

    'button': {
        display: 'inline-flex',
        background: '#2563eb',
        padding: '.5rem .75rem',
        border: 'none',
        borderStyle: 'none',
        color: 'white',
        borderRadius: '.25rem',
        cursor: 'pointer',
        outline: 'none',
        fontSize: '1.05rem',
        lineHeight: '1.25rem',

        '&:disabled': {
            background: '#2563eb50',
        },

        '&:active': {
            background: '#1d4ed8'
        },

        '&:focus': {
            boxShadow: '0px 0px 0px 3px rgb(30, 78, 216, .5)',
        }
    }
});
