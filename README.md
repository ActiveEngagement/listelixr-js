# ListElixr.js

This library provides simple customizable widgets that perform various actions on ListElixr.

Note: ListElixr is a private API meant only for clients of ActiveEngagement, LLC. This software is not open source or licensed to be used except by ActiveEngagement clients.

## Using from a CDN

`https://unpkg.com/listelixr-js@VERSION/dist/ListElixr.umd.js`

Note, `@VERSION` is a placeholder and must be a valid format such as `^1.0`, `~1.0`, `1.0.5`. It's best practice to lock into a specific version when using in production to ensure future updates do not break functionality.

```html
<script src="https://unpkg.com/listelixr-js@VERSION/dist/ListElixr.umd.js"></script>
```

Put this at the bottom of your body tag.

```html
<script>
// If you are using the subscribe form
ListElixr.subscribeForm(el, {
    // your options here...
});

// If you are using the preference form
ListElixr.preferenceForm(el, {
    // your options here...
});
</script>
```

## Using from NPM

```bash
npm install listelixr-js@VERSION
```

```js
import { preferenceForm, subscribeForm } from 'listelixr-js';

// If you are using the subscribe form
subscribeForm(el, {
    // your options here...
})

// If you are using the preference form
preferenceForm(el, {
    // your options here...
})
```

## Subscribe Forms

Subscribe forms allow you to add subscribers.

```html
<script src="https://unpkg.com/listelixr-js@VERSION/dist/ListElixr.umd.js"></script>

<script>
const el = document.querySelector('#foo');

ListElixr.subscribeForm(el, {
    key: 'the-access-token-goes-here',
    tags: ['foo', 'bar'], // optional
    source: 'XXXXX', // optional
    channel: 'YYYYY', // optional
    fields: ['email', 'first', 'last']
});
</script>
```

### Available Fields

The following are the standard fields:

`email`, `first`, `last`, `street`, `city`, `state`, `zip`, `phone`.

*The order of the fields determines the order they appear in the form.*

### Required Fields

You may also mark the following fields as required:

 `first`, `last`, `street`, `city`, `state`, `zip`, `phone`.

```js
<script>
const el = document.querySelector('#foo');

ListElixr.subscribeForm(el, {
    key: 'the-access-token-goes-here',
    fields: ['email', 'first', 'last'],
    requiredFields: ['first', 'last']
});
</script>
```

*Email is always required.*

## Preference Forms

Preference forms allow existing subscribers to manage their subscriptions for various lists.

```html
<script src="https://unpkg.com/listelixr-js@VERSION/dist/ListElixr.umd.js"></script>

<script>
const el = document.querySelector('#foo');

ListElixr.preferenceForm(el, {
    key: 'the-access-token-goes-here'
});
</script>
```

### Custom Labels and Descriptions

You may wish to add descriptions or custom labels. Both `label` and
`description` are entirely optional.

```ts
ListElixr.preferenceForm(document.querySelector('#app1') as Element, {
    key: 'b85cbb19-b0c2-49f2-b3b0-7618d008d58e',
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
    }
})
```

### Custom Headings

You may also override the heading and/or add a field heading (which is like a
subheader). Both `heading` and `fieldHeading` are optional. If nothing is given,
the defaults on the form will be used.

```ts
ListElixr.preferenceForm(document.querySelector('#app1') as Element, {
    key: 'b85cbb19-b0c2-49f2-b3b0-7618d008d58e',
    heading: 'My Custom Heading',
    fieldHeading: 'My Custom Subheader'
})
```

### Remove the Heading

You may also remove the heading on the form by passing `false`.

```ts
ListElixr.preferenceForm(document.querySelector('#app1') as Element, {
    key: 'b85cbb19-b0c2-49f2-b3b0-7618d008d58e',
    heading: false
})
```

## Themes

The widgets all support CSS-in-JS styling. Alternatively, you may style the widgets using traditional CSS. However, the CSS-in-JS solutions are much easier and provide sensible defaults. 

*Note: all themes provide CSS scoping and will not conflict with any of the other styles on your site.*

### Extending the Default Theme

Extending themes allows you to inherit the default styles, while changing only the pieces you desire. For example, this theme will extend the default theme and change the button color to red.

```js
const theme = ListElixr.defaultTheme.extend({
    'button': {
        background: 'red',

        '&:active': {
            background: 'darkred'
        },

        '&:focus': {
            boxShadow: '0px 0px 0px 3px rgb(255, 0, 0, .5)',
        }
    }
});
```

### Extending the Base Theme

It's generally advised to start from the `base` theme, if you are not extending the `default` theme. The `base` theme is a reset stylesheet.

```js
const theme = ListElixr.base.extend({
    'button': {
        // your button css here...
    },
    'input, select, textarea': {
        // your form field css here...
    }
});
```

### Creating a Custom Theme

However, should you want to start completely from scratch you can still do so.

```js
const theme = ListElixr.theme({
    'button': {
        // your button css here...
    },
    'input, select, textarea': {
        // your form field css here...
    }
});
```

### Using Your Theme

Once you create the theme, just pass it to the options of the widget.

```js
const el = document.querySelector('#foo');

// If you are using the subscribe form...
ListElixr.subscribeForm(el, {
    theme,
    // your options here...
});

// Or for the preference form...
ListElixr.preferenceForm(el, {
    theme,
    // your options here...
});
```

### Toggle Switches

Below is an example theme for how to convert checkboxes to toggle switches.

```ts
// Toggle fields
ListElixr.theme({
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
```
