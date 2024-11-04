import { createSignal, For, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { render, type MountableElement } from 'solid-js/web';
import { InputField, type ValidationErrors } from './html';
import type { Theme } from './theme';

export type SubscribeFormField = 'email' | 'first' | 'last' | 'street' | 'state' | 'zip' | 'phone';

export type SubscribeFormOptions = {
    key: string;
    theme?: Theme;
    fields: Partial<SubscribeFormField>[];
    labels?: Partial<Record<SubscribeFormField,string>>;
    heading?: string;
    tags?: string[];
    source?: string;
    channel?: string;
}

export type SubscribeFormModel = Partial<Record<SubscribeFormField,string|undefined>>;

function SubscribeForm(options: SubscribeFormOptions) {
    const endpoint = import.meta.env.VITE_SUBSCRIBE_FORM_URL;
    const [submitting, setSubmitting] = createSignal(false);
    const [error, setError] = createSignal<ValidationErrors>();
    const [success, setSuccess] = createSignal<boolean>(false);

    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${options.key}`
    };

    const labels: Record<SubscribeFormField,string> = Object.assign({
        email: 'Email Address',
        first: 'First Name',
        last: 'Last Name',
        street: 'Street',
        state: 'State',
        zip: 'Zip',
        phone: 'Phone Number'
    }, options.labels);

    const [ model, setModel ] = createStore<Record<string, undefined|string>>({
        ...Object.fromEntries<string|undefined>(
            options.fields.map(key => [key, undefined])
        )
    });

    function handleInputChange(e: InputEvent, key: string) {
        const target = e.target as HTMLInputElement;

        setModel(model => {
            return Object.assign({}, model, {
                [key]: target.value,
            });
        });
    }

    function onSubmit(e: SubmitEvent) {
        e.preventDefault();

        setSubmitting(true);
        setSuccess(false);
        setError(undefined);

        fetch(endpoint, {
            headers,
            mode: 'cors',
            method: 'POST',
            body: JSON.stringify({
                ...model,
                tags: options.tags,
                source: options.source,
                channel: options.channel,
            }),
        }).then(async (response) => {
            if(response.status === 201) {
                setSuccess(true);
            }
            else if(response.status === 422) {
                setError(await response.json());
            }
            else {
                setError(await response.json());
            }
        }, e => {
            setError(e);
        }).finally(() => {
            setSubmitting(false);
        });
    }

    return (
        <>
            <form onsubmit={onSubmit} class={options?.theme?.className()}>
                <Show when={!!options.heading}>
                    <div class="form-heading">{options.heading}</div>
                </Show>
                <Show when={success()}>
                    <div class="form-success-message">
                        <div class="form-heading">
                            Success!
                        </div>
                        You have been subscribed to list.
                    </div>
                </Show>
                <Show when={error()?.message}>
                    <div class="form-error-message">
                        <div class="form-heading">
                            An error has occurred
                        </div>
                        {error()?.message ?? 'An unexpected error has occurred.'}
                    </div>
                </Show>
                <div class="form-fields">
                    <For each={options.fields}>{(field) =>
                        <div class="form-field-group">
                            <div class="form-field-row">
                                <InputField
                                    label={labels?.[field]}
                                    errors={error()?.errors?.[field]}
                                    value={model?.[field]}
                                    oninput={e => handleInputChange(e, field)} />
                            </div>
                        </div>
                    }</For>
                </div>
                
                <div class="form-action">
                    <button disabled={submitting()} class="form-button">
                        Subscribe
                    </button>
                </div>
            </form>
        </>
    );
}

export function subscribeForm(el: MountableElement, options: SubscribeFormOptions): void {
    render(() => SubscribeForm(options), el);
} 