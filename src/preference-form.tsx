import { createEffect, createResource, createSignal, For, Match, Show, Switch } from 'solid-js';
import { createStore } from 'solid-js/store';
import { render, type MountableElement } from 'solid-js/web';
import { ActivityIndicator, CheckboxField, InputField, RadioField, type HttpError, type ValidationErrors } from './html';
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
    theme?: Theme | Theme[];
    heading?: string|false;
    fieldHeading?: string;
    fields?: Record<string|number, {
        label?: string;
        description?: string;   
    }>;
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

    const [form, setForm] = createSignal<PreferenceForm>();
    const [submitting, setSubmitting] = createSignal(false);
    const [error, setError] = createSignal<ValidationErrors>();
    const [fieldType, setFieldType] = createSignal<'radio'|'checkbox'>();

    const [ resource ] = createResource<PreferenceForm|HttpError>(async () => {
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
        const data = resource();

        if(!data) {
            return;
        }

        if('message' in data) {
            setError(data);

            return;
        }

        setForm(data);
        setFieldType(data.form.rows.flat(1).find(({ type }) => type === 'toggle_single') ? 'checkbox' : 'radio');

        setModel(model => {
            const fields = data.form.rows.reduce<Record<number,boolean>>((carry, group) => {
                return Object.assign(carry, Object.fromEntries(
                    Object.entries(group).map(([, row]) => [row.id, row.checked])
                ));
            }, {}) ?? {};
            
            return Object.assign({}, model, {
                email: data.subscriber?.email,
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
        return form()?.form.rows
            .flat(1)
            .filter(({ type }) => ['unsub', 'toggle', 'toggle_single'].includes(type)) ?? [];
    }

    function getUnsubFields() {
        return form()
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
            <div class={Array.isArray(options?.theme) ? options.theme.map(theme => theme.className()).join(' ') : options.theme?.className()}>
                <Show when={!resource.loading} fallback={<ActivityIndicator />}>
                    <form onsubmit={onSubmit}>
                        <Show when={options.heading !== false && form()?.form.heading}>
                            <div class="form-heading">{options.heading ? options.heading : form()?.form.heading}</div>
                        </Show>
                        <Show when={error()?.message}>
                            <div class="form-error-message">
                                <div class="form-heading">
                                An error has occurred
                                </div>
                                {error()?.message ?? 'An unexpected error has occurred.'}
                            </div>
                        </Show>
                        <Show when={form()}>
                            <div class="form-fields">
                                <div class="form-field-group">
                                    <div class="form-field-row">
                                        <InputField
                                            label={options.fields?.email?.label ?? 'Email'}
                                            description={options.fields?.email?.description}
                                            errors={error()?.errors?.email}
                                            value={model.email}
                                            oninput={e => handleInputChange(e, 'email')} />
                                    </div>
                                </div>
                                <Show when={options.fieldHeading}>
                                    <div class="form-heading" innerHTML={options.fieldHeading} />
                                </Show>
                                <For each={form()?.form.rows}>{(group) =>
                                    <div class="form-field-group">
                                        <For each={group}>{(row) =>
                                            <div class="form-field-row">
                                                <Switch>
                                                    <Match when={fieldType() === 'checkbox' || row.type === 'pause'}>
                                                        <CheckboxField
                                                            label={options.fields?.[row.id]?.label ?? options.fields?.[row.label]?.label ?? row.label}
                                                            description={(options.fields?.[row.id] ?? options.fields?.[row.label])?.description}
                                                            id={String(row.id)}
                                                            errors={!!error()?.errors?.fields}
                                                            checked={model?.fields[row.id]}
                                                            oninput={e => handleCheckboxInput(e, row)} />
                                                    </Match>
                                                    <Match when={fieldType() === 'radio'}>
                                                        <RadioField
                                                            label={options.fields?.[row.id]?.label ?? options.fields?.[row.label]?.label ?? row.label}
                                                            description={(options.fields?.[row.id] ?? options.fields?.[row.label])?.description}
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
                        </Show>
                    </form>
                </Show>
            </div>
        </>
    );
}

export function preferenceForm(el: MountableElement, options: PreferenceFormOptions) {
    render(() => PreferenceForm(options), el);
}