import { subscribeForm } from './form';
import { defaultTheme } from './theme';

subscribeForm(document.querySelector('#app1') as Element, {
    key: 'db5d9aa5c679026a26528b4dc89b636d',
    fields: ['email', 'first'],
    css: defaultTheme
});

subscribeForm(document.querySelector('#app1') as Element, {
    key: 'db5d9aa5c679026a26528b4dc89b636d',
    fields: ['email', 'first'],
    css: defaultTheme
});