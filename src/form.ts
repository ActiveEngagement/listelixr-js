import { ElementOptions, el } from './dom';
import { Ref, ref, watchEffect } from './signal';
import { Theme, defaultTheme } from './theme';

export const fields: Record<FieldAlias, Element> = {
    email: formField({
        tagName: 'input',
        label: 'Email',
        attrs: {
            type: 'email',
            name: 'email',
            id: 'email',
            required: 'required',
            placeholder: 'you@example.com'
        }
    }),
    first: formField({
        tagName: 'input',
        label: 'First Name',
        attrs: {
            type: 'text',
            name: 'first',
            id: 'first',
        }
    }),
    last: formField({
        tagName: 'input',
        label: 'Last Name',
        attrs: {
            type: 'text',
            name: 'last',
            id: 'last',
        }
    }),
    street: formField({
        tagName: 'input',
        label: 'Street Address',
        attrs: {
            type: 'text',
            name: 'street',
            id: 'street',
        }
    }),
    city: formField({
        tagName: 'input',
        label: 'City',
        attrs: {
            type: 'text',
            name: 'city',
            id: 'city',
        }
    }),
    state: formField({
        tagName: 'input',
        label: 'State',
        attrs: {
            type: 'text',
            name: 'state',
            id: 'city',
        }
    }),
    zip: formField({
        tagName: 'input',
        label: 'Zipcode',
        attrs: {
            type: 'text',
            name: 'zip',
            id: 'zip',
        }
    }),
    phone: formField({
        tagName: 'input',
        label: 'Phone Number',
        attrs: {
            type: 'text',
            name: 'phone',
            id: 'phone',
        }
    })
};

export type FieldAlias = 'first'
    | 'last'
    | 'email'
    | 'street'
    | 'state'
    | 'city'
    | 'zip'
    | 'phone';

export type SubscribeFormOptions = {
    key: string,
    css?: Theme,
    button?: string | [Record<string,string>] | [Record<string,string>, ChildNode | ChildNode[]]
    fields: FieldAlias[],
    tags?: string[]
    source?: string
    channel?: string
}
export type FieldErrors = string[];

export function subscribeForm(src: Element | null, options: SubscribeFormOptions) {
    const themeClassName = options.css?.className?.value ?? defaultTheme.className.value;

    const form = el({
        el: src,
        tagName: 'form',
        class: themeClassName,
        children: parent => {
            if(parent.children.length) {
                return Array.from(parent.childNodes);
            }

            return options.fields.map(field => fields[field]).concat(el({
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

    const fieldComponents = Object.fromEntries(options.fields.map(field => {
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

export function formField<T extends 'input' | 'select' | 'textarea'>(options: ElementOptions<T> & {label?: string}): HTMLElement {
    return el({
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
                        options.attrs?.required && '*'
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