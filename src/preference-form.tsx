import { createEffect, createResource, createSignal, For, Match, Show, Switch } from 'solid-js';
import { createStore } from 'solid-js/store';
import { render, type MountableElement } from 'solid-js/web';
import { ActivityIndicator, CheckboxField, InputField, RadioField, type ValidationErrors } from './html';
import type { Theme } from './theme';

export type Field = {
    id: number;
    label: string;
    type: string;
    checked: boolean;
};

export type PreferenceForm = {
    subscriber?: {
        email: string
    };
    form: {
        uid: string;
        heading: string;
        rows: Field[][]
    };
}

export type PreferenceFormOptions = {
    key: string;
    theme?: Theme;
}

export type PreferenceFormModel = {
    email?: string|null;
    sid?: string|null;
    fields: Record<string, boolean>;
}

function PreferenceForm(options: PreferenceFormOptions) {
    const endpoint = `${import.meta.env.VITE_PREFERENCE_FORM_URL}/${options?.key}`;
    const params = Object.fromEntries(new URLSearchParams(window.location.search));

    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    const [submitting, setSubmitting] = createSignal(false);
    const [error, setError] = createSignal<ValidationErrors>();
    const [fieldType, setFieldType] = createSignal<'radio'|'checkbox'>();

    const [ resource ] = createResource<PreferenceForm>(async () => {
        const url = new URL(endpoint);
    
        if(params.email) {
            url.searchParams.set('email', params.email);
        }
        else if(params.sid) {
            url.searchParams.set('sid', params.sid);
        }

        return (await fetch(`${url}`, { headers })).json();
    });

    const [ model, setModel ] = createStore<PreferenceFormModel>({
        email: params.email,
        sid: params.sid,
        fields: {
            // Populate the fields after the resource returns.
        }
    });

    createEffect(() => {
        setFieldType(resource()?.form.rows.flat(1).find(({ type }) => type === 'toggle_single') ? 'checkbox' : 'radio');

        setModel(model => {
            const fields = resource()?.form.rows.reduce<Record<number,boolean>>((carry, group) => {
                return Object.assign(carry, Object.fromEntries(
                    Object.entries(group).map(([, row]) => [row.id, row.checked])
                ));
            }, {}) ?? {};
            
            return Object.assign({}, model, {
                email: resource()?.subscriber?.email,
                sid: params.sid,
                fields
            });
        });
    });

    function handleInputChange(e: InputEvent, key: string) {
        const target = e.target as HTMLInputElement;

        setModel(model => {
            return Object.assign({}, model, {
                [key]: target.value,
            });
        });
    }

    function getAllFields() {
        return resource()
            ?.form.rows
            .flat(1) ?? [];
    }

    function getUnsubFields() {
        return resource()
            ?.form.rows
            .flat(1)
            .filter(({ type }) => ['unsub'].includes(type)) ?? [];
    }

    function uncheckFields(...groups: Field[][]) {
        return Object.fromEntries(
            groups.flat(1).map(field => [field.id, false])
        );
    }

    function handleCheckboxInput(e: InputEvent, { id, type }: Field) {
        const target = e.target as HTMLInputElement;

        setModel((model) => {
            let unchecked: PreferenceFormModel['fields'] = {};

            switch (type) {
            case 'unsub': 
                unchecked = uncheckFields(getAllFields());
                break;
            default: 
                unchecked = uncheckFields(getUnsubFields());
            }

            return Object.assign({}, model, {
                fields: Object.assign({}, model.fields, unchecked, {
                    [id]: target.checked   
                })
            });
        });
    }

    function handleRadioInput(e: InputEvent, { id }: Field) {
        const target = e.target as HTMLInputElement;

        setModel((model) => {
            const unchecked = uncheckFields(
                getAllFields(),
            );

            return Object.assign({}, model, {
                fields: Object.assign({}, model.fields, unchecked, {
                    [id]: target.checked   
                })
            });
        });
    }

    function onSubmit(e: SubmitEvent) {
        e.preventDefault();

        setSubmitting(true);
        setError(undefined);

        fetch(endpoint, {
            headers,
            mode: 'cors',
            method: 'POST',
            body: JSON.stringify(model),
        }).then(async (response) => {
            if(response.status === 200) {
                return;
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
            <Show when={resource()} fallback={<ActivityIndicator />}>
                <form onsubmit={onSubmit} class={options?.theme?.className()}>
                    <div class="form-heading">{resource()?.form.heading}</div>
                    <Show when={error()?.message}>
                        <div class="form-error-message">
                            <div class="form-heading">
                                An error has occurred
                            </div>
                            {error()?.message ?? 'An unexpected error has occurred.'}
                        </div>
                    </Show>
                    <div class="form-fields">
                        <div class="form-field-group">
                            <div class="form-field-row">
                                <InputField
                                    label="Email"
                                    errors={error()?.errors?.email}
                                    value={model.email}
                                    oninput={e => handleInputChange(e, 'email')} />
                            </div>
                        </div>
                        <For each={resource()?.form.rows}>{(group) =>
                            <div class="form-field-group">
                                <For each={group}>{(row) =>
                                    <div class="form-field-row">
                                        <Switch>
                                            <Match when={fieldType() === 'checkbox' || row.type === 'pause'}>
                                                <CheckboxField
                                                    label={row.label}
                                                    id={String(row.id)}
                                                    errors={!!error()?.errors?.fields}
                                                    checked={model?.fields[row.id]}
                                                    oninput={e => handleCheckboxInput(e, row)} />
                                            </Match>
                                            <Match when={fieldType() === 'radio'}>
                                                <RadioField
                                                    label={row.label}
                                                    id={String(row.id)}
                                                    name="pref"
                                                    errors={!!error()?.errors?.fields}
                                                    checked={model?.fields[row.id]}
                                                    oninput={e => handleRadioInput(e, row)}  />
                                            </Match>
                                        </Switch>
                                    </div>
                                }</For>
                            </div>
                        }</For>
                    </div>
                    <div class="form-action">
                        <button disabled={submitting()} class="form-button">
                            Save
                        </button>
                    </div>
                </form>
            </Show>
        </>
    );
}

export function preferenceForm(el: MountableElement, options: PreferenceFormOptions) {
    render(() => PreferenceForm(options), el);
}