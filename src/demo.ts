import { subscribeForm } from './subscribe-form';
import { defaultTheme } from './theme';

subscribeForm(document.querySelector('#app1') as Element, {
    key: 'db5d9aa5c679026a26528b4dc89b636d',
    theme: defaultTheme,
    fields: ['email', 'first', 'last'],
    requiredFields: ['email'],
    channel: 'test',
    tags: ['a', 'b'],
    source: 'test'
});