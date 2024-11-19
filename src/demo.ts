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
    key: '6022873a-0e1c-4010-b386-3621a8f8745f',
    fields: {
        email: {
            label: 'Your Email:'
        },
        'Breaking News': {
            description: 'Weekdays - Most Popular | <a href="">Sample</a>' 
        }
    },
    theme: [
        // Layout
        base.extend({
            '.form-fields': {
                display: 'flex',
                flexDirection: 'column',
                gap: '30px',
            },

            '.form-field-group': {
                '.form-field-row:not(:last-child)': {
                    borderBottom: '1px solid #f2f2f2'
                }    
            },

            '.form-label': {
                display: 'grid',
                gridTemplateColumns: '1fr 2fr',
                gridTemplateRows: '1fr 1fr',
                gridTemplateAreas: '"a a c"  "b b c"',
                padding: '15px 0',

                '.form-label-text': {
                    gridArea: 'a',
                    fontSize: '1.0625rem',
                    lineHeight: 1.2,
                    fontWeight: 600,
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