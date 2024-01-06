import { ElementOptions, el } from './dom';
import { Ref, ref, watchEffect } from './signal';
import { Theme, defaultTheme } from './theme';

/**
 * A tuple of field definitions defining the fields available for use.
 */
export const fields = {
    email: defineField('email', {
        label: 'Email',
        required: true,
        attrs: {
            type: 'email',
            placeholder: 'you@example.com'
        }
    }),
    first: defineField('first', {
        label: 'First Name',
        attrs: {
            type: 'text',
        }
    }),
    last: defineField('last', {
        label: 'Last Name',
        attrs: {
            type: 'text',
        }
    }),
    street: defineField('street', {
        label: 'Street Address',
        attrs: {
            type: 'text',
        }
    }),
    city: defineField('city', {
        label: 'City',
        attrs: {
            type: 'text',
        }
    }),
    state: defineField('state', {
        label: 'State',
        attrs: {
            type: 'text',
        }
    }),
    zip: defineField('zip', {
        label: 'Zipcode',
        attrs: {
            type: 'text',
        }
    }),
    phone: defineField('phone', {
        label: 'Phone Number',
        attrs: {
            type: 'text',
        }
    }),
} as const satisfies Record<string, FieldDefinition>;

/**
 * A field definition is simply a function that produces an HTML element capable of displaying the field, optionally
 * with a set of overriden field options.
 *
 * @param custom field options to override
 * @return the generated HTML element
 */
type FieldDefinition = (custom: CustomFormFieldOptions) => HTMLElement;

/**
 * Produces a typical field definition for the given field name and options.
 *
 * This function accomplishes two things:
 *   1. It sets a few sensible defaults.
 *   2. It automatically merges the default options with any custom options the user may provide.
 *
 * Note that unless "tagName" is specified explicitly, we'll default to "input," because, currently, every single one
 * of our fields uses an input element.
 *
 * @param name the "name" of the field. "name" nad "id" will be set to this automatically.
 * @param options the field options
 * @return the generated field definition
 */
function defineField(name: string, options: CustomFormFieldOptions): FieldDefinition {
    return (custom: CustomFormFieldOptions) => formField({
        tagName: 'input',
        ...options,
        ...custom,
        attrs: {
            name,
            id: name,
            ...options.attrs,
            ...custom.attrs
        }
    });
}

/**
 * A union of all the available field names, which of course is just the keys of the fields tuple.
 */
type FieldAlias = keyof typeof fields;

/**
 * A type containing all the information necessary to auto-generate an HTML field. Tt contains the name
 * of the field and optionally custom field options.
 */
type FieldSchema = CustomFormFieldOptions & {
    /**
     * A field alias indicating which type of default field to create.
     */
    name: FieldAlias
}

export type SubscribeFormOptions = {
    key: string,
    css?: Theme,
    button?: string | [Record<string,string>] | [Record<string,string>, ChildNode | ChildNode[]]

    /**
     * An array of fields to generate. Each field may be a simple string representing a field alias, or it may be a
     * field schema object, to specify additional options.
     */
    fields: Array<FieldAlias|FieldSchema>,

    tags?: string[]
    source?: string
    channel?: string
}
export type FieldErrors = string[];

export function subscribeForm(src: Element | null, options: SubscribeFormOptions) {
    const themeClassName = options.css?.className?.value ?? defaultTheme.className.value;

    // "Evaluate" the given fields by converting lone field aliases to skeleton field schema objects.
    const evaluatedFields: FieldSchema[] = options.fields.map(field =>
        typeof field === 'string'
            ? { name: field }
            : field
    );

    const form = el({
        el: src,
        tagName: 'form',
        class: themeClassName,
        children: parent => {
            if(parent.children.length) {
                return Array.from(parent.childNodes);
            }

            return evaluatedFields
                .map(field => fields[field.name](field))
                .concat(el({
                    tagName: 'button',
                    children: ['Subscribe']
                }));
        }
    });

    form.addEventListener('submit', (e) => {
        form.classList.add('was-validated');

        e.preventDefault();

        submit(fieldComponents, {
            key: options.key,
            channel: options.channel,
            source: options.source,
            tags: options.tags,
        })
            .then(() => {
                const svg = document.createElement('div');
                
                svg.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" class="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>';

                form.parentElement?.replaceChild(el({
                    tagName: 'div',
                    class: themeClassName,
                    children: [
                        el({
                            tagName: 'div',
                            class: 'flex items-center justify-center gap-2 p-4',
                            children: [
                                svg,
                                'You have been subscribed!'
                            ]
                        }),
                    ]
                }), form);
            })
            .catch(e => handleValidationErrors(form, e));
    });

    const fieldComponents = Object.fromEntries(evaluatedFields.map(({ name: field }) => {
        const el = form.querySelector<HTMLFormElement>(
            `input[name=${field}], textarea[name=${field}], select[name=${field}]`
        );

        if(!el) {
            throw Error(`The "${field}" field cannot be found in the form`);
        }

        return [field, fieldComponent(el)];
    }));

    if(!src?.contains(form)) {
        src?.append(form);
    }
}

function handleValidationErrors(form: HTMLFormElement, e: SubmitError) {
    const nodeIterator = document.createNodeIterator(form, NodeFilter.SHOW_COMMENT);
                
    while(nodeIterator.nextNode()) {
        const commentNode = nodeIterator.referenceNode;
        const matches = commentNode.textContent?.match(/FieldErrors\:(\w+)/);

        if(!matches?.[1] || !commentNode.parentNode) {
            continue;
        }
        
        const fieldError = e.fieldErrors[matches[1]];

        if(!fieldError) {
            continue;
        }
        
        const error = el({
            el: commentNode.previousSibling,
            tagName: 'div',
            class: 'field-error',
            children: fieldError
        });
        
        commentNode.parentNode.insertBefore(error, commentNode);
    }

    form.querySelector<HTMLFormElement>(':invalid')?.focus();
}

export type FieldComponent = {
    el: HTMLFormElement,
    value: Ref<string>
    errors: Ref<FieldErrors|undefined>
}

export function fieldComponent(el: HTMLFormElement): FieldComponent {
    const value = ref<string>(el.value);
    const errors = ref<FieldErrors>();

    el.addEventListener('input', () => {
        value.value = el.value;
    });

    watchEffect(() => {
        if(errors.value?.length) {
            // el.setCustomValidity(errors.value[0]);
            el.classList.add('invalid');
        }
        else {
            el.removeAttribute('invalid');
            el.classList.remove('invalid');
        }
    });

    return { el, value, errors };
}

/**
 * Represents the form elements available for use.
 */
export type FormElement = 'input' | 'select' | 'textarea';

/**
 * The options for creating an auto-generated field.
 */
export type FormFieldOptions = ElementOptions<FormElement> & {
    label?: string;

    /**
     * Indicates that the field should be required. In practice, this will result in `attrs.required` being set.
     * This is therefore included as a shortcut.
     */
    required?: boolean;
};

/**
 * Options that may be specified to customize a field beyond the default options. Since customization is optional,
 * this type is identical to `FormFieldOptions`, with every key being optional.
 */
export type CustomFormFieldOptions = {
    [Key in keyof FormFieldOptions]?: FormFieldOptions[Key]
};

/**
 * Creates an HTML form field element with the given field options.
 *
 * NOTE that this function used to be generic. However, since it returns a generic `HTMLElement` object, the generic
 * was unnecessary and made it much harder to do certain things with it.
 *
 * @param options the options with which to generate the element
 */
export function formField(options: FormFieldOptions): HTMLElement {
    options.attrs ||= {};

    // The `required` option should result in a `required` attribute on the element.
    // Note the empty string. `required` is one of those elements in HTML that is "value-less," like so:
    //     <input type="text" required />
    if (options.required === true) {
        options.attrs.required = '';
    }

    // Note that the generic doesn't really matter here, since we just need any old HTMLElement.
    // I've chosen `keyof HTMLElementTagNameMap`, since it's the widest possible set.
    return el<keyof HTMLElementTagNameMap>({
        tagName: 'div',
        class: 'form-field',
        children: parent => {
            return [
                options.label && el({
                    tagName: 'label',
                    class: 'form-label',
                    attrs: {
                        for: options.attrs?.name,
                    },
                    children: [
                        options.label,
                        // While it is tempting to check `options.required` instead, we check the attribute in case
                        // the user bypassed `options.required` to set the attribute directly.
                        options.attrs?.required === '' && '*'
                    ]
                }),
                el({
                    ...options,
                    el: parent,
                    class: 'form-control',
                    attrs: {
                        ...options.attrs,
                        id: options.attrs?.name
                    }
                }),
                options.attrs?.name && `<!-- FieldErrors:${options.attrs?.name} -->`
            ];
        }
    });
}

export type FailedResponse = {
    errors: Record<string,FieldErrors>,
    messages: []
};

export type SubmitFormData = {
    channel?: string;
    key: string;
    tags?: string[];
    source?: string;
} & Partial<Record<FieldAlias,string>>

class SubmitError extends Error {
    constructor(
        public response: Response,
        public fieldErrors: Record<string,FieldErrors>
    ) {
        super();
    }
}

export async function submit(fieldComponents: Record<string,FieldComponent>, data: SubmitFormData) {
    const response = await fetch(import.meta.env.VITE_APP_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.key}`,
        },
        body: JSON.stringify({
            ...Object.fromEntries(
                Object.entries(fieldComponents)
                    .map(([key, { value }]) => [key, value.value])
            ),
            ...data
        })
    });

    if(response.status === 403) {
        throw new Error('Invalid api key.');
    }

    if(response.ok) {
        return response;
    }
    
    const { errors }: FailedResponse = await response.json();

    for(const [key, value] of Object.entries(errors)) {
        if(!fieldComponents[key]) {
            continue;
        }

        fieldComponents[key].errors.value = value;
    }

    throw new SubmitError(response, errors);
}