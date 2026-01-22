import { Ref, computed, ref, watchEffect } from './signal';
import states from './states';
import { Theme, defaultTheme } from './theme';

export type FieldAttributes = {
    name: string,
    label?: string,
    id?: string,
    value?: string
} & Record<string,string>

export type Attributes = Partial<HTMLElement>

export type WriteableProps<T> = {
    [K in keyof T]: T[K] extends Readonly<any> ? never : T[K];
};

export type ChildNode = HTMLElement | string | undefined;

export function el<T extends HTMLElement>(tagName: string, attrs?: Record<string,string|undefined>, children?: ChildNode | ChildNode[]): T {
    const el = document.createElement(tagName);

    if(attrs) {
        for(const [key, value] of Object.entries(attrs)) {
            if(value === undefined) {
                continue;
            }
            
            el.setAttribute(key, value);
        }
    }

    if(children) {
        const nodes = Array.isArray(children) ? children : [children];

        for(const node of nodes) {
            if(!node) {
                continue;
            }

            el.append(node);
        }
    }

    return el as T;
}

export function fieldErrors(errors?: FieldErrors) {
    return el<HTMLDivElement>('div', {
        class: 'field-errors',
        style: !errors?.length ? 'display: none' : undefined
    }, errors?.map(error => el<HTMLDivElement>('div', {
        class: 'field-error'
    }, error)));
}

export function field<T extends HTMLElement>(tagName: string, attrs: FieldAttributes) {
    const field = el<T>(tagName, attrs);

    const label = attrs.label && el<HTMLLabelElement>('label', {
        class: 'form-label',
        for: attrs.id
    }, [
        attrs.label,
        attrs.required ? el('sup', undefined, '*') : undefined,
    ]);
    
    return el<HTMLDivElement>('div', {
        class: 'form-field'
    }, [ label, field, fieldErrors() ]);
}

export function input(attrs: FieldAttributes) {
    return field('input', { class: 'form-control', ...attrs });
}

export function textarea(attrs: FieldAttributes) {
    return field('textarea', { class: 'form-control', ...attrs });
}

export type SelectFieldOptions = {
    value: string,
    label?: string
}[]

export function select(attrs: FieldAttributes, options: SelectFieldOptions) {
    const wrapper = field('select', { class: 'form-control', ...attrs });
    
    const select = wrapper.querySelector('select') as HTMLSelectElement;

    for(const { value, label } of options) {
        const option = el<HTMLOptionElement>('option');

        option.value = value;
        option.innerText = label ?? value;

        select.appendChild(option);
    }

    return wrapper;
}

export type FieldComponent = {
    el: HTMLElement,
    input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    value: Ref<string>
    errors: Ref<FieldErrors>
    name: string
    mount(parent: HTMLElement): void
    unmount(): void
}

export const fields = {
    email: input({
        label: 'Email',
        name: 'email',
        id: 'email',
        type: 'email',
        required: 'required',
        placeholder: 'you@example.com'
    }),
    first: input({
        label: 'First Name',
        name: 'first',
        id: 'first',
    }),
    last: input({
        label: 'Last Name',
        name: 'last',
        id: 'last',
    }),
    street: input({
        label: 'Street Address',
        name: 'street',
        id: 'street',
    }),
    city: input({
        label: 'City',
        name: 'city',
        id: 'city',
    }),
    state: select({
        label: 'State',
        name: 'state',
        id: 'state',
    }, states),
    zip: input({
        label: 'Zipcode',
        name: 'zip',
        id: 'zip',
    }),
    phone: input({
        label: 'Phone Number',
        name: 'Phone',
        type: 'phone',
        id: 'phone',
    })
};

export function component(wrapper: HTMLElement): FieldComponent {
    const input = findInputField(wrapper);

    if(!input) {
        throw Error('Components must have a valid input field.');
    }

    const name = input.getAttribute('name');

    if(!name) {
        throw Error('Component input fields must have a name attribute.');
    }

    const value = ref<string>(input?.value);
    const errors = ref<FieldErrors>([]);

    watchEffect(() => {
        const el = fieldErrors(errors.value);
        const replace = wrapper.querySelector('.field-errors');

        if(replace) {
            replace.replaceWith(el);
        }
        else {
            wrapper.appendChild(el);
        }

        if(errors.value.length) {
            wrapper.classList.add('has-errors');
        }
        else {
            wrapper.classList.remove('has-errors');
        }
    });

    input.addEventListener('input', () => value.value = input.value);

    function mount(parent: HTMLElement) {
        parent.appendChild(wrapper);
    }

    function unmount() {
        wrapper.remove();
    }

    return {
        el: wrapper,
        name,
        input,
        value,
        errors,
        mount,
        unmount
    };
}

export type FieldErrors = string[]

export function findInputField(el: Element) {
    if(el instanceof HTMLInputElement) {
        return el;
    }

    if(el instanceof HTMLSelectElement) {
        return el;
    }

    if(el instanceof HTMLTextAreaElement) {
        return el;
    }

    return el.querySelector('input')
        ?? el.querySelector('select')
        ?? el.querySelector('textarea');
}

export type SubscribeFormOptions = {
    key: string,
    theme?: Theme,
    button?: string | [Record<string,string>] | [Record<string,string>, ChildNode | ChildNode[]]
    fields: (HTMLElement|FieldAlias)[],
    tags?: string[]
    source?: string
    channel?: string
}

export type FailedResponse = {
    errors: Record<string,string[]>,
    messages: []
};

export type FieldAlias = 'first'
    | 'last'
    | 'email'
    | 'street'
    | 'state'
    | 'city'
    | 'zip'
    | 'phone';

export class SubscribeForm {
    el: HTMLFormElement;
    key: string;
    theme: Theme;
    tags?: string[];
    source?: string;
    channel?: string;
    fields: FieldComponent[] = [];
    data: Ref<Record<string,string>>;

    constructor(
        public readonly parent: HTMLElement,
        options: SubscribeFormOptions
    ) {
        this.el = el<HTMLFormElement>('form');
        this.el.classList.add('elixr');
        this.key = options.key;
        this.tags = options.tags;
        this.source = options.source;
        this.channel = options.channel;
        this.theme = options.theme ?? defaultTheme;

        let themeClassName = this.theme.className();
        
        watchEffect(() => {
            this.el.classList.remove(themeClassName);

            themeClassName = this.theme.className();

            this.el.classList.add(themeClassName);
        });

        for(const field of options.fields) {
            const index = this.fields.push(
                component(typeof field === 'string' ? fields[field] : field)
            ) - 1;

            this.fields[index].mount(this.el);
        }
        
        this.data = computed(() => {
            return this.fields.reduce((carry, { name, value }) => {
                return Object.assign(carry, {
                    [name]: value.value
                });
            }, {});
        });

        this.el.append(el<HTMLButtonElement>(
            'button',
            Array.isArray(options.button) ? options.button[0] : undefined,
            (Array.isArray(options.button) ? options.button[1] : options.button) ?? 'Subscribe'
        ));

        this.el.onsubmit = e => {
            this.submit();

            e.preventDefault();
        };

        parent.appendChild(this.el);
    }

    async submit() {
        const response = await fetch(import.meta.env.VITE_APP_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.key}`,
            },
            body: JSON.stringify({
                ...this.data.value,
                tags: this.tags,
                source: this.source,
                channel: this.channel
            })
        });

        if(response.ok) {
            return response;
        }
        
        const { errors }: FailedResponse = await response.json();

        for(const [key, value] of Object.entries(errors)) {
            const field = this.field(key);

            if(!field) {
                continue;
            }

            field.errors.value = value;
        }

        return errors;
    }

    public field(key: string) {
        return this.fields.find(({ name }) => name === key);
    }
}

export function subscribeForm(el: HTMLElement, options: SubscribeFormOptions) {
    return new SubscribeForm(el, options);
}