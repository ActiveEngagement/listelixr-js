// import { css } from 'goober';
// import { render } from 'solid-js/web';
// import { preferenceForm } from './preference-form';

// import { preferenceForm } from './preference-form';
import { preferenceForm } from './preference-form';
import { base } from './theme';

// subscribeForm(document.querySelector('#app1') as Element, {
//     heading: 'Subscribe',
//     key: 'db5d9aa5c679026a26528b4dc89b636d',
//     theme: defaultTheme,
//     fields: ['email', 'first', 'last'],
//     channel: 'test',
//     tags: ['a', 'b'],
//     source: 'test'
// });

preferenceForm(document.querySelector('#app1') as Element, {
    key: 'b85cbb19-b0c2-49f2-b3b0-7618d008d58e',
    heading: false,
    fieldHeading: '<h2>Get the following newsletters:</h2><p class="quiet">Newsletters are free for everyone</p>',
    fields: {
        email: {
            label: 'Your Email:'
        },
        'Daily': {
            description: 'Weekdays - Most Popular | <a href="">Sample</a>' 
        },
        'Weekend': {
            description: 'Sunday | <a href="">Sample</a>' 
        },
        'ICYMI': {
            description: 'Saturday | <a href="">Sample</a>' 
        },
        'Breaking': {
            description: 'As needed | <a href="">Sample</a>' 
        },
        'Freedom Post': {
            description: 'Twice a week | <a href="">Sample</a>' 
        },
        'Exclusive Offers': {
            description: 'Thrice a week | <a href="">Sample</a>' 
        },
        'Marketers': {
            description: 'Once a month | <a href="">Sample</a>' 
        }
    },
    theme: [
        // Layout
        base.extend({
            '.form-action': {
                marginTop: '3.125rem',
                textAlign: 'center',

                'button': {
                    padding: '.625rem 3.125rem',
                    fontSize: '1.125rem',
                    lineHeight: 1.4,
                    color: '#fff',
                    background: '#000',
                    border: '0',
                    borderRadius: '100px',
                    cursor: 'pointer',
                    height: '2.8em',
                },
            },

            '.form-field-group:first-child .form-field': {
                display: 'flex',
                alignItems: 'center',
                gap: '.625rem',
                fontSize: '1rem',
                marginBottom: '.9375rem',

                '.form-control': {
                    flex: 1
                }
            },

            '.form-field-group:last-child': {
                '.form-field-row+.form-field-row:not(:last-child)': {
                    borderTop: '1px solid #f2f2f2'
                },

                '.form-label-text': {
                    fontSize: '1.0625rem',
                    lineHeight: 1.2,
                    fontWeight: 600,
                },

                '.form-field-row:last-child': {
                    marginTop: '3.125rem',

                    '.form-label': {
                        display: 'flex',
                        flexDirection: 'row-reverse',

                        '.form-label-text': {
                            flex: 1
                        }
                    }
                },
                
                '.form-label:has(.form-label-description)': {
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr',
                    gridTemplateRows: '1fr 1fr',
                    gridTemplateAreas: '"a a c"  "b b c"',
                    padding: '15px 0',

                    '.form-label-text': {
                        gridArea: 'a'
                    },

                    '.form-label-description': {
                        gridArea: 'b',
                        opacity: .6,
                        fontSize: '.875rem',

                        'a': {
                            color: 'inherit'
                        }
                    },

                    '.form-control': {
                        gridArea: 'c',
                        alignSelf: 'center'
                    }
                }
            }
        }),
        
        // Toggle fields
        base.extend({
            '[type=checkbox]': {
                appearance: 'none',
                backgroundColor: '#dfe1e4',
                borderRadius: '72px',
                borderStyle: 'none',
                flexShrink: 0,
                height: '24px',
                margin: '0',
                position: 'relative',
                width: '39px',
                cursor: 'default',

                '&::after': {
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    content: '""',
                    height: '1.25rem',
                    width: '1.25rem',
                    position: 'absolute',
                    left: '.125rem',
                    top: '.125rem',
                    transition: 'all 100ms ease-out'
                },

                '&:checked': {
                    backgroundColor: '#1774ce',

                    '&::after': {
                        backgroundColor: '#fff',
                        left: 'calc(39px - 1.25rem - .125rem)'
                    },
                }
            },
        })
    ]
});