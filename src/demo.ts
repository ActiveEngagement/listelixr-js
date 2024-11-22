// import { css } from 'goober';
// import { render } from 'solid-js/web';
// import { preferenceForm } from './preference-form';

// import { preferenceForm } from './preference-form';
import { preferenceForm } from './preference-form';
import { defaultTheme } from './theme';

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
    theme: [
        defaultTheme
    ]
});